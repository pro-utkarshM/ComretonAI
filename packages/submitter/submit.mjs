// In packages/submitter/submit.mjs (Corrected)
import { AptosClient, AptosAccount, FaucetClient, TxnBuilderTypes } from 'aptos';
import * as fs from 'fs';
import * as path from 'path';

// --- CONFIGURATION ---
const CONTRACT_ADDRESS = '0x911bd65e2cb0e42893f08022b8ec9cd058e1233f460f78bfdd296888665c1013';
const PRIVATE_KEY = 'ed25519-priv-0x2f2fe96ab8b1470b5abdc244a0039f8bffa2f8b89c29066dc7f59865f81ebe55';
const NODE_URL = "https://fullnode.devnet.aptoslabs.com";
// --- END CONFIGURATION ---

/**
 * Helper function to convert a hex string or an array of hex strings
 * from snarkjs output into a Uint8Array for the Aptos SDK.
 */
function hexToUint8Array(hexValue) {
    // THE FIX IS HERE: We first check if the value is an array and flatten it if so.
    // If it's already a single string, we use it directly.
    const flatArray = Array.isArray(hexValue) ? hexValue.flat(Infinity) : [hexValue];

    let combinedHex = flatArray.map(s => s.startsWith('0x') ? s.substring(2) : s).join('');
    
    if (combinedHex.length % 2 !== 0) {
        combinedHex = '0' + combinedHex;
    }
    return new Uint8Array(combinedHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
}

async function main() {
    console.log("🚀 Starting proof submission...");

    const client = new AptosClient(NODE_URL);
    const privateKeyBytes = hexToUint8Array(PRIVATE_KEY.split('-priv-')[1]);
    const aptosAccount = new AptosAccount(privateKeyBytes);
    console.log(`✅ Submitter account loaded: ${aptosAccount.address()}`);

    const proofPath = path.join('../circuits/proof.json');
    const publicPath = path.join('../circuits/public.json');
    const proof = JSON.parse(fs.readFileSync(proofPath));
    const publicSignals = JSON.parse(fs.readFileSync(publicPath));
    console.log("✅ Proof and public inputs loaded.");

    const payload = {
        function: `${CONTRACT_ADDRESS}::mlp_verifier::verify_proof_entry`,
        type_arguments: [],
        arguments: [
            hexToUint8Array(proof.pi_a),
            hexToUint8Array(proof.pi_b),
            hexToUint8Array(proof.pi_c),
            publicSignals.map(signal => hexToUint8Array(signal))
        ],
    };

    console.log("✅ Transaction payload constructed. Submitting to Aptos devnet...");

    const txnRequest = await client.generateTransaction(aptosAccount.address(), payload);
    const signedTxn = await client.signTransaction(aptosAccount, txnRequest);
    const transactionRes = await client.submitTransaction(signedTxn);
    
    await client.waitForTransaction(transactionRes.hash);

    console.log(`\n🎉 SUCCESS! Phase 1 Complete! 🎉`);
    console.log(`Transaction successful with hash: ${transactionRes.hash}`);
    console.log(`View on explorer: https://explorer.aptoslabs.com/txn/${transactionRes.hash}?network=devnet`);
}

main().catch(err => {
    console.error("❌ An error occurred:", err);
    process.exit(1);
});