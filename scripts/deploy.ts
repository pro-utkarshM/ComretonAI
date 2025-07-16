import {
  Account,
  Aptos,
  AptosConfig,
  Network,
  Ed25519PrivateKey,
} from "@aptos-labs/ts-sdk";
import * as fs from "fs";
import * as path from "path";

const PRIVATE_KEY =
  "ed25519-priv-0x50afffed3b60375138989a1d32fb5884eaee49a009d475d87cc07e2cbc363d04";

async function deployContracts() {
  const config = new AptosConfig({ network: Network.TESTNET });
  const aptos = new Aptos(config);

  // Create account from private key
  const privateKey = new Ed25519PrivateKey(PRIVATE_KEY);
  const account = Account.fromPrivateKey({ privateKey });

  console.log("Deploying from account:", account.accountAddress.toString());

  // Check balance
  const balance = await aptos.getAccountAPTAmount({
    accountAddress: account.accountAddress,
  });
  console.log("Account balance:", balance / 100000000, "APT");

  // Compile the contract
  console.log("Compiling contract...");
  const packagePath = path.join(__dirname, "../contracts");
  const packageMetadata = fs.readFileSync(
    path.join(packagePath, "build/ComretonAI/package-metadata.bcs")
  );
  const moduleData = fs.readFileSync(
    path.join(packagePath, "build/ComretonAI/bytecode_modules/marketplace.mv")
  );

  // Deploy the contract
  console.log("Deploying contract...");
  const transaction = await aptos.publishPackageTransaction({
    account: account.accountAddress,
    metadataBytes: packageMetadata,
    moduleBytecode: [moduleData],
  });

  const pendingTxn = await aptos.signAndSubmitTransaction({
    signer: account,
    transaction,
  });

  const response = await aptos.waitForTransaction({
    transactionHash: pendingTxn.hash,
  });
  console.log("Contract deployed! Transaction hash:", response.hash);

  // Initialize marketplace
  console.log("Initializing marketplace...");
  const initTxn = await aptos.transaction.build.simple({
    sender: account.accountAddress,
    data: {
      function: `${account.accountAddress}::marketplace::initialize`,
      typeArguments: [],
      functionArguments: [],
    },
  });

  const initPending = await aptos.signAndSubmitTransaction({
    signer: account,
    transaction: initTxn,
  });

  await aptos.waitForTransaction({ transactionHash: initPending.hash });
  console.log("Marketplace initialized!");

  console.log("\nDeployment complete!");
  console.log("Marketplace address:", account.accountAddress.toString());
  console.log("\nAdd this to your .env.local:");
  console.log(`NEXT_PUBLIC_MARKETPLACE_ADDRESS=${account.accountAddress}`);
}

deployContracts().catch(console.error);
