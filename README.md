### **Phase 0: The "Lab" - Core Off-Chain Crypto**

This phase is entirely focused on proving the core cryptographic primitive works in isolation, completely off-chain.

*   **Goal:** Successfully generate a zero-knowledge proof for a pre-defined ML model's inference and verify that proof.
*   **Components & Tasks:**
    1.  **Define Target Model:** A simple 2-layer Multi-Layer Perceptron (MLP).
    2.  **Develop ZKP Circuit:** Using **Circom**, create the `mlp.circom` file that mathematically represents the MLP's computation (matrix multiplication, biases, and ReLU activations). This involves breaking down complex equations into the quadratic constraints required by ZKPs.
    3.  **Implement Prover/Verifier Workflow:**
        *   Use **snarkjs** to compile the Circom circuit (`--r1cs`, `--wasm`).
        *   Use a pre-computed Powers of Tau file (e.g., `powersOfTau28_hez_final_12.ptau`) for the trusted setup.
        *   Generate the circuit-specific Proving Key (`.zkey`) and the `verification_key.json`.
        *   Write a script (`run.mjs`) that:
            *   Loads the model weights and a sample input.
            *   Calculates the expected output to use as a public input.
            *   Calls `snarkjs.groth16.fullProve` to generate `proof.json` and `public.json`.
            *   Calls `snarkjs.groth16.verify` to confirm the proof is valid using the `verification_key.json`.
*   **✅ Success Metric:** The `run.mjs` script executes from start to finish without errors, culminating in a `✅ Verification OK` message printed to the console.

---

### **Phase 1: The "On-Chain Bridge" - Connecting to Aptos**

This phase bridges the gap between the off-chain crypto and the on-chain world, proving that a smart contract can verify our proof.

*   **Goal:** Successfully verify a proof generated in Phase 0 using an Aptos smart contract on the devnet.
*   **Components & Tasks:**
    1.  **Setup Aptos Environment:**
        *   Install the latest **Aptos CLI (v2.x or higher)**.
        *   Initialize a local, project-specific configuration (`aptos init`).
        *   Create a `packages/aptos` directory with a `Move.toml` file.
    2.  **Configure Dependencies:**
        *   Modify `Move.toml` to map your account address.
        *   Add the `AptosFramework` as a dependency, critically enabling the `features = ["testing"]` flag to include the necessary cryptographic modules.
    3.  **Create the Verifier Contract:**
        *   Write a `verifier.move` smart contract.
        *   Use a script (`converter.mjs`) to convert the `verification_key.json` from Phase 0 into hardcoded `const` values within the Move contract.
        *   Implement a `public fun verify_groth16_proof(...)` function that calls the native **`aptos_framework::groth16::bn254_pairing_check`** function with the proof elements and the hardcoded verification key.
    4.  **Deploy and Test:**
        *   Use `aptos move compile` to build the contract.
        *   Use `aptos move publish` to deploy the verifier module to the Aptos devnet.
        *   Write a simple off-chain script (e.g., in TypeScript or Python) that reads `proof.json` and `public.json`, connects to the Aptos devnet, and calls the `verify_groth16_proof` function on your deployed contract.
*   **✅ Success Metric:** The off-chain script successfully calls the on-chain function, and the transaction is accepted by the network without aborting, proving on-chain verification is successful.

---

### **Phase 2: The "Automated Orchestrator" - End-to-End Flow**

This phase builds the full, automated (though centralized) system that allows a developer to interact with the service.

*   **Goal:** Enable a developer to deploy a model and request an inference via a CLI, which is then automatically processed by a centralized off-chain system.
*   **Components & Tasks:**
    1.  **Build Core On-Chain Modules:**
        *   **Model Registry:** A smart contract for storing model metadata (e.g., IPFS CID).
        *   **Inference Orchestrator:** The main contract with `request_inference` and `submit_result` functions. `request_inference` emits a `JobCreated` event. `submit_result` calls the verifier contract from Phase 1.
    2.  **Build Centralized Off-Chain Services:**
        *   **Indexer:** A listener script that subscribes to `JobCreated` events from the Orchestrator.
        *   **Executor:** A worker service that, upon notification from the Indexer, fetches the model from IPFS, runs the Phase 0 prover logic, and calls the `submit_result` function on-chain.
    3.  **Develop the Developer CLI:**
        *   Create the initial `comretonai` CLI.
        *   Implement `comretonai deploy model.onnx`: Uploads the model to IPFS and registers it on-chain.
        *   Implement `comretonai request-inference --model-id <ID> ...`: Calls the `request_inference` function on-chain.
*   **✅ Success Metric:** A developer can use the CLI to deploy and request an inference, and the job is automatically processed and its status is updated on-chain, verifiable via a block explorer.

---

### **Phase 3: The "Economic Alpha" - Adding Incentives**

This final phase introduces the basic economic layer and prepares the system for a closed alpha with friendly external developers.

*   **Goal:** Implement a functional economic loop and polish the system for a small, controlled audience.
*   **Components & Tasks:**
    1.  **Implement Simple On-Chain Economics:**
        *   Modify the Orchestrator so the `request_inference` function requires an attached fee in native **APT** tokens.
        *   Upon successful verification in `submit_result`, the contract transfers the fee to the executor's address.
    2.  **Implement Basic Staking:**
        *   Create a simple on-chain registry to whitelist trusted executor addresses. This can be a precursor to a more complex staking/slashing system.
    3.  **Improve Tooling and Docs:**
        *   Add better error handling and status feedback to the CLI.
        *   Implement basic logging and health checks for the off-chain services.
        *   Write simple "happy path" documentation for alpha testers.
    4.  **Onboard Alpha Testers:**
        *   Invite a handful of trusted developers to try deploying the supported MLP model and provide feedback on the experience.
*   **✅ Success Metric:** External developers can successfully use the platform. The economic loop is functional: a user pays for a job, and the executor is rewarded upon successful, verified completion.
