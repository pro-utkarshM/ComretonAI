// In packages/services/indexer.mjs (Final, Corrected Version)
import { AptosClient } from 'aptos';

// --- CONFIGURATION ---
const CONTRACT_ADDRESS = '0x911bd65e2cb0e42893f08022b8ec9cd058e1233f460f78bfdd296888665c1013';
const RESOURCE_ACCOUNT_ADDRESS = '0x911bd65e2cb0e42893f08022b8ec9cd058e1233f460f78bfdd296888665c1013';
const NODE_URL = "https://fullnode.devnet.aptoslabs.com";
const POLLING_INTERVAL_MS = 5000;
// --- END CONFIGURATION ---

async function main() {
    const client = new AptosClient(NODE_URL);
    console.log("✅ Indexer starting...");
    console.log(` monitoring contract: ${CONTRACT_ADDRESS}`);
    console.log(` looking for resource on account: ${RESOURCE_ACCOUNT_ADDRESS}`);

    const resourceType = `${CONTRACT_ADDRESS}::orchestrator::ComretonManager`;
    
    try {
        const resource = await client.getAccountResource(RESOURCE_ACCOUNT_ADDRESS, resourceType);
        if (!resource) {
            throw new Error("Resource not found. Please check the RESOURCE_ACCOUNT_ADDRESS.");
        }

        const eventHandle = resource.data.job_created_events;
        const creationNum = eventHandle.guid.id.creation_num;
        console.log(`✅ Found event handle with creation number: ${creationNum}. Starting to poll...`);

        let lastSeenSequenceNumber = 0n;
        const initialCount = BigInt(eventHandle.counter);
        if (initialCount > 0n) {
            lastSeenSequenceNumber = initialCount - 1n;
        }

        while (true) {
            // THE FIX: Use the correct, simpler function `getEventsByCreationNumber`
            const events = await client.getEventsByCreationNumber(
                RESOURCE_ACCOUNT_ADDRESS,
                creationNum,
                { start: lastSeenSequenceNumber + 1n }
            ).catch(error => {
                console.error("\n❌ Error fetching events:", error.message);
                return [];
            });

            if (events.length > 0) {
                for (const event of events) {
                    console.log("\n🚀 Found new JobCreatedEvent!");
                    console.log(`  - Sequence #: ${event.sequence_number}`);
                    console.log(`  - Job ID:     ${event.data.job_id}`);
                    console.log(`  - Model ID:   ${event.data.model_id}`);
                    console.log(`  - Requester:  ${event.data.requester}`);
                    lastSeenSequenceNumber = BigInt(event.sequence_number);
                }
            } else {
                process.stdout.write(".");
            }
            
            await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
        }

    } catch (error) {
        console.error("❌ Fatal error on startup:", error.message);
        process.exit(1);
    }
}

main();