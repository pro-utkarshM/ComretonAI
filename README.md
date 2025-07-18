# ComretonAI

**ComretonAI** is a decentralized AI execution and verification protocol that blends **formal methods**, **zero-knowledge proofs**, and **blockchain-based auditing** to enable *verifiable machine learning*. It separates **on-chain truth logic** from **off-chain execution**, preserving both *performance* and *cryptographic integrity*.

> “Trust the math, not the machine.”

---

## Abstract

The rapid proliferation of AI models has created a trust gap—users cannot be sure that a given model:
- Matches its advertised architecture
- Executes without hidden logic or biases
- Produces results from authentic computation

**ComretonAI** eliminates this uncertainty using a **Provable Execution Environment (PEE)**, **layer-wise cryptographic hashing**, and **zero-knowledge proofs**. The system is governed by the Aptos blockchain and economically incentivized using the `COMAI` token.

---

## Technical System Architecture

### Hybrid Architecture: On-chain Control, Off-chain Execution

| Plane             | Role                                                 |
|------------------|------------------------------------------------------|
| **Control Plane** | Model registry, staking, inference orchestration     |
| **Execution Plane** | Inference, ZKP generation, state hashing            |

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

## Protocol Lifecycle

### Phase 1: Model Registration

* Upload a **Verifiable Model Artifact (VMA)**:

  * `model.onnx` (model architecture)
  * `spec.move` (Move-based formal spec)
  * Layer-wise hashes and a Genesis Hash `H₀`

### Phase 2: Provable Execution (PEE)

* Compute Providers register specs and pricing
* Jobs are matched and executed in a sandboxed PEE
* Each layer computes a hash in the **Proof Chain**:

```math
H_i = H(H_{i-1} || H(W_i) || H(A_{i-1}) || H(B_i))
```

### Phase 3: Community Auditing

* Auditors stake `COMAI` and verify model specs + hash chains
* Weighted approval voting based on stake
* A model is `VERIFIED` if:

```math
\sum_{i \in \mathcal{A}_m} S_i \ge \Theta
```

---

### **Phase 4: Inference & Proof Verification**

* User requests inference through a dApp
* Execution returns output + ZK-Proof $\pi$
* On-chain verifier checks:

$$
\pi = \text{ZK-SNARK}(C, w, x) \quad \text{where} \quad x = (H_{N-1}, H_N)
$$

* Rewards distributed:

$$
F_{\text{total}} = F_{\text{creator}} + F_{\text{auditors}} + F_{\text{compute}} + F_{\text{protocol}}
$$

---

## Component Breakdown

### On-Chain Modules (Aptos + Move)

* `ModelRegistry`: VMA registration and tracking
* `InferenceOrchestrator`: Job scheduling, payment
* `ZKPVerifier`: Validates `π` on-chain
* `MathKernel`: Verified arithmetic (e.g. dot product)
* `StakingModule`: Auditor participation and rewards
* `DAO`: Protocol governance

### Off-Chain Components

* **CLI / SDK**:

  ```bash
  comretonai deploy model.onnx --spec spec.md
  comretonai gen-circuit model.onnx
  ```
* **Compute Executor**: Fetches model, runs inference, generates ZKP
* **Prover**: Circuit-based proof generation (arkworks-rs, gnark)
* **Indexer**: Emits GraphQL events for jobs, results, proofs

---

## Design Principles

| Principle          | Implementation                            |
| ------------------ | ----------------------------------------- |
| Verifiability      | Layered hashes + Move specs + ZKPs        |
| Trust Minimization | Separation of roles, cryptographic proofs |
| Economic Security  | Staking, slashing, proportional rewards   |
| ML-Native          | ONNX support, Pytorch/TensorFlow inputs   |
| Performance        | Offloaded compute and ZKP                 |

---

## Resources

* [Move Language](https://move-language.github.io/move/)
* [Aptos Developer Docs](https://aptos.dev/)
* [ONNX Format](https://onnx.ai/)
* [zk-SNARKs Explained](https://z.cash/technology/zksnarks/)
* [seL4 Microkernel](https://sel4.systems/)
* [arkworks-rs](https://github.com/arkworks-rs)

---

## Tech Stack

| Layer      | Technologies                          |
| ---------- | ------------------------------------- |
| Blockchain | Aptos + Move                          |
| Compute    | Rust, Node.js, Python                 |
| Proving    | Circom, arkworks-rs, gnark            |
| Storage    | IPFS, Arweave                         |
| Frontend   | React / Svelte (dApp), TypeScript SDK |

---

## License

This project is licensed under the **MIT License**.
See the [LICENSE](./LICENSE) file for details.

---

### Authors

| Name                    | Contact / GitHub                          |
| ----------------------- | ----------------------------------------- |
| **Mrigesh**             | [@Legend101Zz](https://github.com/Legend101Zz/)|
| **Utkarsh**             | [@pro-utkarshM](https://github.com/pro-utkarshM) |

---

## Acknowledgements

Inspired by:

* Formal verification in mission-critical systems
* Zero-knowledge verifiable computing
* seL4 microkernel and modular security

Here’s the updated `README.md` with a new **Authors** section at the end. You can customize names, roles, and contact links as needed:

---
