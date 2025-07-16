// In packages/submitter/test_request.mjs
import { AptosClient, AptosAccount, FaucetClient, TxnBuilderTypes } from 'aptos';

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

async function main() {
    const client = new AptosClient(NODE_URL);
    const privateKeyBytes = hexToUint8Array(PRIVATE_KEY.split('-priv-')[1]);
    const aptosAccount = new AptosAccount(privateKeyBytes);
    console.log(`✅ Using account: ${aptosAccount.address()}`);

    // --- Call the request_inference function for Model #0 ---
    console.log("\n🚀 Calling request_inference() for Model #0...");
    const payload = {
        function: `${CONTRACT_ADDRESS}::orchestrator::request_inference`,
        type_arguments: [],
        arguments: [
            "0", // The ID of the model we registered previously.
            [],  // Dummy input data for now.
        ],
    };

    const txnRequest = await client.generateTransaction(aptosAccount.address(), payload);
    const signedTxn = await client.signTransaction(aptosAccount, txnRequest);
    const transactionRes = await client.submitTransaction(signedTxn);
    await client.waitForTransaction(transactionRes.hash);

    console.log(`  -> Success! Txn Hash: ${transactionRes.hash}`);
    console.log(`✅ Job #0 should now be created in the contract's table.`);
    console.log("\n🎉 Successfully requested the first inference job!");
    console.log("➡️ Next step: Check the explorer to see the 'JobCreatedEvent' that was emitted!");
}

main().catch(err => {
    console.error("❌ An error occurred:", JSON.stringify(err, null, 2));
    process.exit(1);
});