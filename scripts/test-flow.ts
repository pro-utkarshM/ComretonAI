import {
  Account,
  Aptos,
  AptosConfig,
  Network,
  Ed25519PrivateKey,
} from "@aptos-labs/ts-sdk";

const MARKETPLACE_ADDRESS = "0x...";

async function testFlow() {
  const config = new AptosConfig({ network: Network.TESTNET });
  const aptos = new Aptos(config);

  // Create test accounts
  const creator = Account.generate();
  const auditor1 = Account.generate();
  const auditor2 = Account.generate();
  const auditor3 = Account.generate();
  const user = Account.generate();

  console.log("Test accounts created:");
  console.log("Creator:", creator.accountAddress.toString());
  console.log("Auditor1:", auditor1.accountAddress.toString());
  console.log("Auditor2:", auditor2.accountAddress.toString());
  console.log("Auditor3:", auditor3.accountAddress.toString());
  console.log("User:", user.accountAddress.toString());

  // Fund accounts (you need to use faucet or transfer from funded account)
  console.log("\nFunding accounts...");
  // Use Aptos faucet: https://fullnode.testnet.aptoslabs.com/v1/accounts/{address}/fund

  // Step 1: Creator deploys a model
  console.log("\n1. Creator deploying model...");
  const deployTxn = await aptos.transaction.build.simple({
    sender: creator.accountAddress,
    data: {
      function: `${MARKETPLACE_ADDRESS}::marketplace::register_model`,
      typeArguments: [],
      functionArguments: [
        MARKETPLACE_ADDRESS,
        Array.from(new TextEncoder().encode("Test AI Model")),
        Array.from(new TextEncoder().encode("A test model for demonstration")),
        Array.from(new TextEncoder().encode("QmTestIPFSHash")),
        Array.from(new TextEncoder().encode("NLP")),
        "1000000", // 0.01 APT
      ],
    },
  });

  const deployPending = await aptos.signAndSubmitTransaction({
    signer: creator,
    transaction: deployTxn,
  });
  await aptos.waitForTransaction({ transactionHash: deployPending.hash });
  console.log("Model deployed!");

  // Step 2: Auditors stake and become auditors
  console.log("\n2. Auditors staking...");
  for (const auditor of [auditor1, auditor2, auditor3]) {
    const stakeTxn = await aptos.transaction.build.simple({
      sender: auditor.accountAddress,
      data: {
        function: `${MARKETPLACE_ADDRESS}::marketplace::become_auditor`,
        typeArguments: [],
        functionArguments: [
          MARKETPLACE_ADDRESS,
          "1000000", // 0.01 APT stake
        ],
      },
    });

    const stakePending = await aptos.signAndSubmitTransaction({
      signer: auditor,
      transaction: stakeTxn,
    });
    await aptos.waitForTransaction({ transactionHash: stakePending.hash });
  }
  console.log("All auditors staked!");

  // Step 3: Auditors audit the model
  console.log("\n3. Auditors auditing model...");
  for (const auditor of [auditor1, auditor2, auditor3]) {
    const auditTxn = await aptos.transaction.build.simple({
      sender: auditor.accountAddress,
      data: {
        function: `${MARKETPLACE_ADDRESS}::marketplace::audit_model`,
        typeArguments: [],
        functionArguments: [
          MARKETPLACE_ADDRESS,
          "1", // Model ID
          true, // Approved
          Array.from(new TextEncoder().encode("Model looks good!")),
        ],
      },
    });

    const auditPending = await aptos.signAndSubmitTransaction({
      signer: auditor,
      transaction: auditTxn,
    });
    await aptos.waitForTransaction({ transactionHash: auditPending.hash });
  }
  console.log("Model audited and verified!");

  // Step 4: User runs inference
  console.log("\n4. User running inference...");
  const inferenceTxn = await aptos.transaction.build.simple({
    sender: user.accountAddress,
    data: {
      function: `${MARKETPLACE_ADDRESS}::marketplace::run_inference`,
      typeArguments: [],
      functionArguments: [
        MARKETPLACE_ADDRESS,
        "1", // Model ID
      ],
    },
  });

  const inferencePending = await aptos.signAndSubmitTransaction({
    signer: user,
    transaction: inferenceTxn,
  });
  await aptos.waitForTransaction({ transactionHash: inferencePending.hash });
  console.log("Inference completed! Fees distributed.");

  // Check final state
  console.log("\n5. Checking final state...");
  const model = await aptos.view({
    payload: {
      function: `${MARKETPLACE_ADDRESS}::marketplace::get_model`,
      typeArguments: [],
      functionArguments: [MARKETPLACE_ADDRESS, "1"],
    },
  });
  console.log("Model details:", model[0]);

  const creatorProfile = await aptos.view({
    payload: {
      function: `${MARKETPLACE_ADDRESS}::marketplace::get_user_profile`,
      typeArguments: [],
      functionArguments: [creator.accountAddress],
    },
  });
  console.log("\nCreator earnings:", creatorProfile[1] / 100000000, "APT");

  console.log("\nTest flow completed successfully! ✅");
}

testFlow().catch(console.error);
