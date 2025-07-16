// In packages/submitter/test_economic_loop.mjs
import { AptosClient, AptosAccount } from 'aptos';
import * as fs from 'fs';
import * as path from 'path';

// --- CONFIGURATION ---
// Make sure these are all for your working 'default' account
const CONTRACT_ADDRESS = '0xad3ad151a8b47e263976516dde60a87335a825b4339ddbde0fc68615526c9ba8';
const PRIVATE_KEY = 'ed25519-priv-0x2f2fe96ab8b1470b5abdc244a0039f8bffa2f8b89c29066dc7f59865f81ebe55';
const NODE_URL = "https://fullnode.devnet.aptoslabs.com";
// --- END CONFIGURATION ---

function hexToUint8Array(hexValue) {
    const flatArray = Array.isArray(hexValue) ? hexValue.flat(Infinity) : [hexValue];
    let combinedHex = flatArray.map(s => s.startsWith('0x') ? s.substring(2) : s).join('');
    if (combinedHex.length % 2 !== 0) { combinedHex = '0' + combinedHex; }
    return new Uint8Array(combinedHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
}

async function submitTxn(account, payload) {
    const client = new AptosClient(NODE_URL);
    const txnRequest = await client.generateTransaction(account.address(), payload);
    const signedTxn = await client.signTransaction(account, txnRequest);
    const transactionRes = await client.submitTransaction(signedTxn);
    await client.waitForTransaction(transactionRes.hash);
    console.log(`  -> Success! Txn Hash: ${transactionRes.hash}`);
    return transactionRes;
}

async function main() {
    const client = new AptosClient(NODE_URL);
    const aptosAccount = new AptosAccount(hexToUint8Array(PRIVATE_KEY.split('-priv-')[1]));
    console.log(`✅ Using account: ${aptosAccount.address()}`);

    // We need to know the next job ID. Let's fetch it from the resource.
    const resourceType = `${CONTRACT_ADDRESS}::orchestrator::ComretonManager`;
    const managerResource = await client.getAccountResource(CONTRACT_ADDRESS, resourceType);
    const nextJobId = managerResource.data.job_counter;

    console.log(`\n--- STEP 1: ACTING AS USER ---`);
    console.log(`🚀 Requesting new inference job (Job #${nextJobId}) and paying fee...`);
    const requestPayload = {
        function: `${CONTRACT_ADDRESS}::orchestrator::request_inference`,
        type_arguments: [],
        arguments: ["0", []], // Model ID #0, dummy input data
    };
    await submitTxn(aptosAccount, requestPayload);
    console.log("✅ Job created and fee paid into escrow.");

    console.log("\n--- STEP 2: ACTING AS EXECUTOR ---");
    console.log(`🚀 Submitting proof for Job #${nextJobId} to claim reward...`);
    
    // Load the pre-generated proof from Phase 0
    const proofPath = path.join('../circuits/proof.json');
    const publicPath = path.join('../circuits/public.json');
    const proof = JSON.parse(fs.readFileSync(proofPath));
    const publicSignals = JSON.parse(fs.readFileSync(publicPath));
    console.log("  - Proof files loaded.");

    const submitPayload = {
        function: `${CONTRACT_ADDRESS}::orchestrator::submit_result`,
        type_arguments: [],
        arguments: [
            nextJobId.toString(),
            hexToUint8Array(publicSignals[0]),
            hexToUint8Array(proof.pi_a),
            hexToUint8Array(proof.pi_b),
            hexToUint8Array(proof.pi_c),
            publicSignals.map(signal => hexToUint8Array(signal))
        ],
    };
    await submitTxn(aptosAccount, submitPayload);
    console.log("✅ Proof verified on-chain and reward paid to executor.");


    console.log("\n🎉 CONGRATULATIONS! Phase 3 Complete! 🎉");
    console.log("The full economic loop (Pay -> Escrow -> Work -> Reward) is working.");
}

main().catch(err => {
    console.error("❌ An error occurred:", JSON.stringify(err, null, 2));
    process.exit(1);
});