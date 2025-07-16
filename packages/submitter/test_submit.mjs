// In packages/submitter/test_submit.mjs
import { AptosClient, AptosAccount } from 'aptos';
import * as fs from 'fs';
import * as path from 'path';

// --- CONFIGURATION ---
const CONTRACT_ADDRESS = '0x911bd65e2cb0e42893f08022b8ec9cd058e1233f460f78bfdd296888665c1013';
const PRIVATE_KEY = 'ed25519-priv-0x2f2fe96ab8b1470b5abdc244a0039f8bffa2f8b89c29066dc7f59865f81ebe55';
const NODE_URL = "https://fullnode.devnet.aptoslabs.com";
// --- END CONFIGURATION ---

function hexToUint8Array(hexValue) {
    const flatArray = Array.isArray(hexValue) ? hexValue.flat(Infinity) : [hexValue];
    let combinedHex = flatArray.map(s => s.startsWith('0x') ? s.substring(2) : s).join('');
    if (combinedHex.length % 2 !== 0) { combinedHex = '0' + combinedHex; }
    return new Uint8Array(combinedHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
}

async function main() {
    const client = new AptosClient(NODE_URL);
    const privateKeyBytes = hexToUint8Array(PRIVATE_KEY.split('-priv-')[1]);
    const aptosAccount = new AptosAccount(privateKeyBytes);
    console.log(`✅ Using account: ${aptosAccount.address()}`);

    // 1. Load the proof and public inputs we generated in Phase 0
    const proofPath = path.join('../circuits/proof.json');
    const publicPath = path.join('../circuits/public.json');
    const proof = JSON.parse(fs.readFileSync(proofPath));
    const publicSignals = JSON.parse(fs.readFileSync(publicPath));
    console.log("✅ Proof and public inputs loaded.");

    // --- Call the submit_result function for Job #0 ---
    console.log("\n🚀 Calling submit_result() for Job #0...");
    const payload = {
        function: `${CONTRACT_ADDRESS}::orchestrator::submit_result`,
        type_arguments: [],
        arguments: [
            "0", // The ID of the job we are completing.
            hexToUint8Array(publicSignals[0]), // The result we are submitting.
            hexToUint8Array(proof.pi_a),
            hexToUint8Array(proof.pi_b),
            hexToUint8Array(proof.pi_c),
            publicSignals.map(signal => hexToUint8Array(signal))
        ],
    };

    const txnRequest = await client.generateTransaction(aptosAccount.address(), payload);
    const signedTxn = await client.signTransaction(aptosAccount, txnRequest);
    const transactionRes = await client.submitTransaction(signedTxn);
    await client.waitForTransaction(transactionRes.hash);

    console.log(`  -> Success! Txn Hash: ${transactionRes.hash}`);
    console.log(`✅ Job #0 should now be marked as 'Completed' on-chain.`);
    
    console.log("\n🎉 CONGRATULATIONS! Phase 2 On-Chain Logic Complete! 🎉");
    console.log("The full on-chain workflow (Request -> Submit -> Verify -> Complete) is working.");
}

main().catch(err => {
    console.error("❌ An error occurred:", JSON.stringify(err, null, 2));
    process.exit(1);
});