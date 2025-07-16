// In packages/submitter/test_orchestrator.mjs
import { AptosClient, AptosAccount, FaucetClient, TxnBuilderTypes } from 'aptos';
import * as fs from 'fs';

// --- CONFIGURATION ---
const CONTRACT_ADDRESS = '0xad3ad151a8b47e263976516dde60a87335a825b4339ddbde0fc68615526c9ba8';
const PRIVATE_KEY = 'ed25519-priv-0x2f2fe96ab8b1470b5abdc244a0039f8bffa2f8b89c29066dc7f59865f81ebe55';
const NODE_URL = "https://fullnode.devnet.aptoslabs.com";
// --- END CONFIGURATION ---

function hexToUint8Array(hex) {
    let hexString = hex.startsWith('0x') ? hex.substring(2) : hex;
    if (hexString.length % 2 !== 0) {
        hexString = '0' + hexString;
    }
    return new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
}

async function submitTxn(account, payload) {
    const client = new AptosClient(NODE_URL);
    const txnRequest = await client.generateTransaction(account.address(), payload);
    const signedTxn = await client.signTransaction(account, txnRequest);
    const transactionRes = await client.submitTransaction(signedTxn);
    await client.waitForTransaction(transactionRes.hash);
    console.log(`  -> Success! Txn Hash: ${transactionRes.hash}`);
    return transactionRes.hash;
}

async function main() {
    // Setup clients and account
    const privateKeyBytes = hexToUint8Array(PRIVATE_KEY.split('-priv-')[1]);
    const aptosAccount = new AptosAccount(privateKeyBytes);
    console.log(`✅ Using account: ${aptosAccount.address()}`);

    // --- 1. Call the initialize function ---
    console.log("\n🚀 Calling initialize()...");
    const initPayload = {
        function: `${CONTRACT_ADDRESS}::orchestrator::initialize`,
        type_arguments: [],
        arguments: [],
    };
    await submitTxn(aptosAccount, initPayload);
    console.log("✅ ComretonManager resource should now be created on-chain.");

    // --- 2. Call the register_model function ---
    console.log("\n🚀 Calling register_model() to create Model #0...");
    const registerPayload = {
        function: `${CONTRACT_ADDRESS}::orchestrator::register_model`,
        type_arguments: [],
        arguments: [
            "QmWd5sGF2f3y2uYyN4a248aF2e4c6e8bA0d2c4e6f8a0b", // Example IPFS CID
            "1000", // Example fee (as a string)
        ],
    };
    await submitTxn(aptosAccount, registerPayload);
    console.log("✅ Model #0 should now be registered in the contract's table.");
    
    console.log("\n🎉 Successfully initialized and registered the first model!");
}

main().catch(err => {
    // Provide more detailed error logging
    console.error("❌ An error occurred:", JSON.stringify(err, null, 2));
    process.exit(1);
});