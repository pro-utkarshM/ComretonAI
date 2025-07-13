### **ComretonAI: Technical System Architecture**

The architecture is a hybrid system designed to maximize security and verifiability while maintaining performance and cost-effectiveness. It separates the **Control Plane** (on-chain, for trust and verification) from the **Execution Plane** (off-chain, for heavy computation).

#### **Architectural Diagram**

```mermaid
graph TD
    subgraph User & Developer Ecosystem
        A[dApp / Frontend <br> (React/Svelte)]
        B[ComretonAI SDK/CLI <br> (Rust/TypeScript)]
    end

    subgraph Off-Chain Services & Tooling
        C[ZKP Prover <br> (arkworks-rs / Gnark)]
        D[Compute Executor <br> (Node.js/Rust Client)]
        E[Indexer Service <br> (GraphQL API)]
    end

    subgraph On-Chain: Aptos Blockchain (Control & Verification Plane)
        F[<b>Model & Spec Registry</b> <br> (Aptos Object)]
        G[<b>Inference Orchestrator</b> <br> (Move Module)]
        H[<b>Formally Verified Math Kernel</b> <br> (Move Module)]
        I[<b>ZKP Verifier Contract</b> <br> (Move Module)]
        J[<b>COMAI Token & Staking</b> <br> (Move Module)]
        K[<b>Governance DAO</b> <br> (Move Module)]
    end

    subgraph External Decentralized Networks
        L[Decentralized Compute <br> (io.net / Akash)]
        M[Decentralized Storage <br> (IPFS / Arweave)]
    end

    %% --- Data Flows ---
    A -- 1. Request Inference (Aptos SDK) --> G
    B -- 2. Register Model (Aptos SDK) --> F
    B -- 3. Upload Model/Spec --> M

    G -- 4. Emits Event: 'JobCreated' --> E
    E -- 5. Notifies (API/WebSocket) --> D
    D -- 6. Fetch Model (IPFS Hash) --> M
    D -- 7. Execute Inference & Generate Proof --> C
    D -- 8. Submit Result & ZKP (Aptos SDK) --> G

    G -- 9. Forwards Proof for Verification --> I
    I -- 10. Returns Verification Result (bool) --> G
    G -- 11. Finalizes Job & Distributes Rewards --> J

    %% --- Internal On-Chain Calls ---
    G -- For simple models --> H

    %% --- Developer Tooling Flow ---
    subgraph Developer Workflow (Local)
        Dev[PyTorch/TF Model] --> B
        B -- Generates --> SpecTemplate[Move Spec Template]
        B -- Generates --> ZKPCircuit[ZKP Circuit Template]
        SpecTemplate -- Verified by --> MoveProver[Move Prover]
    end

    classDef onchain fill:#cde4ff,stroke:#4461c7,stroke-width:2px;
    class F,G,H,I,J,K onchain;
    classDef offchain fill:#d2ffd2,stroke:#368036,stroke-width:2px;
    class C,D,E offchain;
    classDef user fill:#fff0c1,stroke:#a88532,stroke-width:2px;
    class A,B user;
    classDef external fill:#f9f9f9,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5;
    class L,M external;

```

---

### **Component Breakdown**

#### **1. On-Chain Components (Aptos / Move Modules)**

This is the **Trusted Computing Base (TCB)** of the system. All state transitions here are final and cryptographically secured by the Aptos network.

*   **F. Model & Spec Registry:**
    *   **Technology**: A set of `Aptos Objects`, where each object represents one ML model.
    *   **Data Stored**:
        *   `model_id`: Unique identifier.
        *   `owner_address`: The developer/DAO who deployed it.
        *   `model_weights_hash`: An `IPFS/Arweave` content-identifier (CID) hash for the large model file (e.g., ONNX format).
        *   `formal_spec_hash`: An IPFS CID hash for the human-readable formal specification document.
        *   `verification_type`: An enum (`FullyOnChain` or `ZKP_Verified`).
        *   `on_chain_kernel_module` (if `FullyOnChain`): Address of the verified Move module that implements it.
        *   `zkp_verifier_id` (if `ZKP_Verified`): Identifier for the circuit used for verification.

*   **H. Formally Verified Math Kernel:**
    *   **Technology**: A Move module with accompanying `spec` blocks, fully verified by the **Move Prover**.
    *   **Purpose**: To provide a library of **provably correct** mathematical functions for *simple, fully on-chain models*.
    *   **Functions**:
        *   `fixed_point_mul(a: u128, b: u128): u128`: Verified fixed-point multiplication.
        *   `fixed_point_add(a: u128, b: u128): u128`: Verified fixed-point addition.
        *   `dot_product(vec1: vector<u128>, vec2: vector<u128>): u128`: A loop that is formally proven to be correct and free of overflows.
    *   **seL4 Analogy**: This is the microkernel. It's small, its properties are proven, and more complex logic relies on it.

*   **G. Inference Orchestrator:**
    *   **Technology**: The main Move module that manages the lifecycle of an inference job.
    *   **Functions**:
        *   `request_inference(model_id, input_hash, fee)`: Called by users. It creates a job entry, locks the fee, and emits a `JobCreated` event.
        *   `submit_result(job_id, result, proof)`: Called by the off-chain Compute Executor. This is the critical entry point for off-chain results.
    *   **Logic**:
        1.  On `submit_result`, it retrieves the job details.
        2.  It looks up the `model_id` in the registry (F) to find the required `verification_type`.
        3.  **If `ZKP_Verified`**: It calls the `ZKP Verifier Contract` (I) with the `proof` and public inputs (model hash, input hash, result).
        4.  **If `FullyOnChain`**: It calls the specific model's function within the `Math Kernel` (H) directly.
        5.  Based on the verifier's boolean response, it finalizes the job, transfers fees to the compute provider, or slashes their stake.

*   **I. ZKP Verifier Contract:**
    *   **Technology**: A Move module containing the verification logic for a specific zk-SNARK scheme (e.g., Groth16).
    *   **Function**: `verify_proof(proof, public_inputs): bool`.
    *   **Details**: This is a highly-optimized, low-level contract. The verification keys for different ML models/circuits are stored on-chain and loaded by this contract. It's gas-intensive but far cheaper than native execution.

*   **J. COMAI Token & Staking:**
    *   **Technology**: A Move module implementing the Aptos Fungible Asset standard.
    *   **Functions**: `stake()`, `unstake()`, `slash(violator_address, amount)`.
    *   **Integration**: The `Inference Orchestrator` (G) holds the authority to call `slash()` on compute providers who submit invalid proofs.

*   **K. Governance DAO:**
    *   **Technology**: A set of Move modules for creating and voting on proposals.
    *   **Responsibilities**: Voting on admitting new `ZKP Verifier` contracts, upgrading the `Orchestrator`, and managing the community treasury.

#### **2. Off-Chain Components**

These services support the on-chain contracts, handling tasks that are too expensive or complex for a blockchain environment.

*   **B. ComretonAI SDK/CLI:**
    *   **Technology**: Rust (for performance, WASM compilation, and ML integration) and TypeScript (for web/JS developers).
    *   **Features**:
        1.  `comretonai deploy <model_file.onnx> --spec <spec.md>`: Automates uploading files to IPFS, getting hashes, and calling the `Model Registry` contract.
        2.  `comretonai gen-circuit <model_file.onnx>`: Parses the model's computation graph and generates a boilerplate ZKP circuit (e.g., in Circom or directly in `arkworks-rs`).
        3.  `comretonai gen-spec <model_file.onnx>`: Generates a template Move `spec` block for developers to fill in.

*   **D. Compute Executor:**
    *   **Technology**: A robust client application (e.g., Node.js or Rust) designed to run on decentralized compute networks like `io.net`.
    *   **Workflow**:
        1.  Listens for `JobCreated` events from an **Indexer Service (E)**.
        2.  Pulls the model from IPFS (M) using the hash from the event.
        3.  Executes the inference using a standard ML runtime (e.g., ONNX Runtime).
        4.  Feeds the computation trace (operations and intermediate values) into the **ZKP Prover (C)**.
        5.  Receives the `proof` and `result`.
        6.  Constructs and sends an Aptos transaction to the `Inference Orchestrator`'s `submit_result` function.

*   **E. Indexer Service:**
    *   **Technology**: A service (like The Graph, or a custom indexer) that listens to all on-chain events from our contracts.
    *   **Purpose**: Provides a fast, queryable GraphQL API for the dApp and Compute Executors to get the state of models and jobs without having to query the Aptos node directly for everything.

### **Operational Flow: Step-by-Step (Hybrid ZKP Model)**

1.  **Request (User -> On-Chain)**: A user in the **dApp (A)** wants to run model `M_123` on their data `D`. They approve a transaction that calls `G.request_inference(M_123, hash(D), fee)`. The `Orchestrator` emits a `JobCreated` event.

2.  **Detection (On-Chain -> Off-Chain)**: The **Indexer (E)** sees the event and pushes it to all listening **Compute Executors (D)**.

3.  **Execution & Proof Generation (Off-Chain)**: An eligible, staked **Executor (D)** accepts the job.
    *   It fetches the model file for `M_123` from **IPFS (M)**.
    *   It runs the inference on data `D`, producing result `R`.
    *   Simultaneously, it uses the **ZKP Prover (C)** and the corresponding circuit for `M_123` to generate a `proof` that `M_123(D) = R`.

4.  **Submission (Off-Chain -> On-Chain)**: The **Executor (D)** calls `G.submit_result(job_id, R, proof)`.

5.  **Verification (On-Chain)**: The **Orchestrator (G)** receives the submission.
    *   It calls `I.verify_proof(proof, [hash(M_123), hash(D), R])`.
    *   The **ZKP Verifier (I)** runs its constant-time algorithm and returns `true`.

6.  **Finalization (On-Chain)**:
    *   The **Orchestrator (G)** sees the `true` result.
    *   It marks the job as complete, stores the result `R`, and calls the **Staking contract (J)** to transfer the `fee` from the user's locked funds to the executor's address.

This architecture creates a robust separation of concerns, using the blockchain exclusively for what it does best: enforcing rules, verifying proofs, and acting as an immutable source of truth. The heavy, expensive work is delegated to a decentralized network of off-chain workers, who are kept honest by a combination of cryptographic proofs and economic incentives (staking/slashing).
