// In packages/services/comreton-service.mjs (Definitive Polling Fix)
import { AptosClient, AptosAccount } from 'aptos';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// --- CONFIGURATION ---
const CONTRACT_ADDRESS = '0xad3ad151a8b47e263976516dde60a87335a825b4339ddbde0fc68615526c9ba8';
const RESOURCE_ACCOUNT_ADDRESS = '0xad3ad151a8b47e263976516dde60a87335a825b4339ddbde0fc68615526c9ba8';
const PRIVATE_KEY = 'ed25519-priv-0x2f2fe96ab8b1470b5abdc244a0039f8bffa2f8b89c29066dc7f59865f81ebe55';
const NODE_URL = "https://fullnode.devnet.aptoslabs.com";
const POLLING_INTERVAL_MS = 10000;
// --- END CONFIGURATION ---

function hexToUint8Array(hexValue) {
    const flatArray = Array.isArray(hexValue) ? hexValue.flat(Infinity) : [hexValue];
    let combinedHex = flatArray.map(s => s.startsWith('0x') ? s.substring(2) : s).join('');
    if (combinedHex.length % 2 !== 0) { combinedHex = '0' + combinedHex; }
    return new Uint8Array(combinedHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
}

async function executeJob(client, job) {
    const jobId = job.id;
    console.log(`\n🔥 EXECUTING JOB #${jobId}...`);

    if (job.status === 1) {
        console.log(`  - Job #${jobId} has already been completed. Skipping.`);
        return;
    }
    
    console.log("  - Step 1: Generating ZK proof...");
    try {
        const circuitsDir = path.join('../circuits');
        await execAsync(`node run.mjs`, { cwd: circuitsDir });
        console.log("    ...Proof generated successfully.");
    } catch (e) {
        console.error("    ...ERROR generating proof:", e);
        return;
    }

    const proofPath = path.join('../circuits/proof.json');
    const publicPath = path.join('../circuits/public.json');
    const proof = JSON.parse(fs.readFileSync(proofPath));
    const publicSignals = JSON.parse(fs.readFileSync(publicPath));
    console.log("  - Step 2: Loading proof files.");

    console.log("  - Step 3: Submitting result to the blockchain...");
    const aptosAccount = new AptosAccount(hexToUint8Array(PRIVATE_KEY.split('-priv-')[1]));
    const payload = {
        function: `${CONTRACT_ADDRESS}::orchestrator::submit_result`,
        type_arguments: [],
        arguments: [
            jobId.toString(),
            hexToUint8Array(publicSignals[0]),
            hexToUint8Array(proof.pi_a),
            hexToUint8Array(proof.pi_b),
            hexToUint8Array(proof.pi_c),
            publicSignals.map(signal => hexToUint8Array(signal))
        ],
    };

    try {
        const txnRequest = await client.generateTransaction(aptosAccount.address(), payload);
        const signedTxn = await client.signTransaction(aptosAccount, txnRequest);
        const transactionRes = await client.submitTransaction(signedTxn);
        await client.waitForTransaction(transactionRes.hash);
        console.log(`    ...Success! Txn Hash: ${transactionRes.hash}`);
        console.log(`✅ JOB #${jobId} COMPLETED ON-CHAIN!`);
    } catch (e) {
        console.error("    ...ERROR submitting transaction:", JSON.stringify(e.message, null, 2));
    }
}

async function main() {
    console.log("✅ ComretonAI Service Started");
    console.log("...waiting for jobs...");

    const resourceType = `${CONTRACT_ADDRESS}::orchestrator::ComretonManager`;
    
    while (true) {
        try {
            // THE FIX: Create a new client inside the loop to guarantee a fresh connection.
            const client = new AptosClient(NODE_URL);
            
            const resource = await client.getAccountResource(RESOURCE_ACCOUNT_ADDRESS, resourceType);
            const jobsTableHandle = resource.data.jobs.handle;
            const jobCounter = parseInt(resource.data.job_counter, 10);

            process.stdout.write(`\n🔍 Checking ${jobCounter} total jobs...`);

            for (let i = 0; i < jobCounter; i++) {
                const jobData = await client.getTableItem(jobsTableHandle, {
                    key_type: "u64",
                    value_type: `${CONTRACT_ADDRESS}::orchestrator::Job`,
                    key: i.toString(),
                });

                if (jobData && jobData.status === 0) { // 0 is 'Pending'
                    await executeJob(client, jobData);
                }
            }
        } catch (error) {
            console.error("\n❌ Error during polling:", error.message);
        }
        
        process.stdout.write("\n...polling again...");
        await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
    }
}

main();