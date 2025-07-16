// In packages/submitter/whitelist_executor.mjs
import { AptosClient, AptosAccount } from 'aptos';

// --- CONFIGURATION ---
const CONTRACT_ADDRESS = '0x911bd65e2cb0e42893f08022b8ec9cd058e1233f460f78bfdd296888665c1013';
const PRIVATE_KEY = 'ed25519-priv-0x2f2fe96ab8b1470b5abdc244a0039f8bffa2f8b89c29066dc7f59865f81ebe55';
const NODE_URL = "https://fullnode.devnet.aptoslabs.com";
// --- END CONFIGURATION ---

function hexToUint8Array(hex) {
    let hexString = hex.startsWith('0x') ? hex.substring(2) : hex;
    return new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
}

async function main() {
    const client = new AptosClient(NODE_URL);
    const privateKeyBytes = hexToUint8Array(PRIVATE_KEY.split('-priv-')[1]);
    const aptosAccount = new AptosAccount(privateKeyBytes);
    console.log(`✅ Using admin account: ${aptosAccount.address()}`);

    // The address we want to whitelist as an executor.
    // For this test, we will whitelist our own account.
    const executorAddress = aptosAccount.address();
    console.log(`\n🚀 Whitelisting executor address: ${executorAddress}`);

    const payload = {
        function: `${CONTRACT_ADDRESS}::orchestrator::register_executor`,
        type_arguments: [],
        arguments: [executorAddress],
    };

    const txnRequest = await client.generateTransaction(aptosAccount.address(), payload);
    const signedTxn = await client.signTransaction(aptosAccount, txnRequest);
    const transactionRes = await client.submitTransaction(signedTxn);
    await client.waitForTransaction(transactionRes.hash);

    console.log(`  -> Success! Txn Hash: ${transactionRes.hash}`);
    console.log(`✅ Account ${executorAddress} is now an authorized executor.`);
}

main().catch(err => {
    console.error("❌ An error occurred:", JSON.stringify(err, null, 2));
    process.exit(1);
});