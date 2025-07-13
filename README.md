# ComretonAI

**ComretonAI** is a decentralized AI execution and verification platform that combines **formal verification**, **zero-knowledge proofs**, and **blockchain infrastructure**. It is designed to run machine learning models with provable guarantees, separating **on-chain trust logic** from **off-chain computation**, while maintaining performance and economic viability.

---

## Technical System Architecture

The architecture is a hybrid system designed to maximize **security** and **verifiability** while remaining **cost-efficient** and **scalable**.

It separates:
- **Control Plane** (on-chain): Trust, verification, staking, governance.
- **Execution Plane** (off-chain): ML computation, ZKP generation.

---

### Architectural Diagram

```mermaid
graph TD
    subgraph User_Developer_Ecosystem
        A[dApp Frontend - React or Svelte]
        B[ComretonAI SDK or CLI - Rust or TypeScript]
    end

    subgraph Off_Chain_Services
        C[ZKP Prover - arkworks-rs or Gnark]
        D[Compute Executor - Nodejs or Rust]
        E[Indexer Service - GraphQL API]
    end

    subgraph On_Chain_Aptos
        F[Model and Spec Registry]
        G[Inference Orchestrator]
        H[Verified Math Kernel]
        I[ZKP Verifier Contract]
        J[COMAI Token and Staking]
        K[Governance DAO]
    end

    subgraph External_Networks
        L[Decentralized Compute - io.net or Akash]
        M[Decentralized Storage - IPFS or Arweave]
    end

    %% Data Flows
    A -->|1. Request Inference| G
    B -->|2. Register Model| F
    B -->|3. Upload Model or Spec| M

    G -->|4. Emit JobCreated Event| E
    E -->|5. Notify Executors| D
    D -->|6. Fetch Model| M
    D -->|7. Run Inference and Generate Proof| C
    D -->|8. Submit Result and ZKP| G

    G -->|9. Send Proof for Verification| I
    I -->|10. Return Verification Result| G
    G -->|11. Finalize Job and Distribute Rewards| J

    %% Internal On-Chain Calls
    G -->|Simple Model Call| H

    %% Developer Workflow
    subgraph Developer_Workflow_Local
        Dev[ML Model - PyTorch or TensorFlow] --> B
        B --> SpecTemplate[Generate Move Spec Template]
        B --> ZKPCircuit[Generate ZKP Circuit Template]
        SpecTemplate --> MoveProver[Move Prover Verification]
    end
````

---

## Component Breakdown

### On-Chain Components (Aptos / Move Modules)

All logic on-chain is trusted and finalized by the Aptos network.

* **Model & Spec Registry (F)**
  Stores metadata and verification type for ML models.

* **Formally Verified Math Kernel (H)**
  Verified Move math library for simple models:

  * `fixed_point_mul`, `fixed_point_add`, `dot_product`

* **Inference Orchestrator (G)**
  Manages lifecycle: inference requests, result submissions, proof verification, and rewards.

* **ZKP Verifier Contract (I)**
  zk-SNARK verification logic for model outputs.

* **COMAI Token & Staking (J)**
  Economic incentive layer using slashing and rewards.

* **Governance DAO (K)**
  Controls upgrades, verifier approvals, and treasury management.

---

### Off-Chain Components

* **SDK/CLI (B)**
  Developer tools for deployment, spec generation, ZKP circuit generation:

  ```bash
  comretonai deploy model.onnx --spec spec.md
  comretonai gen-circuit model.onnx
  comretonai gen-spec model.onnx
  ```

* **Compute Executor (D)**
  Decentralized worker node to run inference and ZKP generation.

* **Indexer (E)**
  Real-time event tracking (JobCreated, ModelRegistered, etc.) via GraphQL API.

* **ZKP Prover (C)**
  Generates cryptographic proof that the result was computed honestly.

---

## Operational Flow (ZKP Model)

1. **User Requests Inference** via dApp → on-chain `request_inference()`
2. **JobCreated Event** emitted → picked by **Indexer**
3. **Executor** fetches model → runs inference → generates proof
4. **Executor Submits** `submit_result(job_id, result, proof)`
5. **Verifier Contract** checks proof → returns `true/false`
6. **Orchestrator Finalizes Job**

   * Distributes rewards or slashes executor's stake

---

## Design Principles

| Principle             | Implementation                                |
| --------------------- | --------------------------------------------- |
| Verifiability         | ZKPs + Formal Specs (Move Prover)             |
| Trust Minimization    | All sensitive logic on-chain                  |
| Economic Security     | COMAI Token, staking & slashing               |
| Performance           | ML + ZKP offloaded to decentralized workers   |
| ML-Native             | ONNX support, auto-ZKP generation, Move specs |

---

## Tech Stack

| Layer           | Stack                              |
| --------------- | ---------------------------------- |
| Blockchain      | Aptos + Move                       |
| Off-Chain Infra | Rust, TypeScript, Node.js, GraphQL |
| Proving Systems | arkworks-rs, gnark, Circom         |
| Storage/Compute | IPFS, Arweave, io.net, Akash       |
| Frontend        | React / Svelte (dApp)              |

---

## Resources

* [Move Language](https://move-language.github.io/move/)
* [Aptos Docs](https://aptos.dev/)
* [zk-SNARK Basics](https://z.cash/technology/zksnarks/)
* [arkworks-rs](https://github.com/arkworks-rs)

---

## License

This project is licensed under the **MIT License**.
See the [LICENSE](./LICENSE) file for details.

---

## Acknowledgements

Inspired by:

* **Formal methods in safety-critical systems**
* **ZKP-based verifiable computation**
* **Modular kernel architecture (e.g., seL4)**

---

> *“Trust the math, not the machine.”*
