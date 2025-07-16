# ComretonAI MVP - A Verifiable Compute Network on Aptos

Welcome to the ComretonAI MVP! This project is a working proof-of-concept for a decentralized, trustless, and verifiable compute network built on the Aptos blockchain. Our mission is to enable developers to run off-chain machine learning models and receive a cryptographically secure, on-chain proof of the inference result.

This MVP demonstrates the complete end-to-end flow: from generating a Zero-Knowledge Proof (ZKP) for an ML model's output, to having that proof be verified by a smart contract on the Aptos devnet, all orchestrated by an automated off-chain service with a functioning economic loop.

## Table of Contents

- [Project Architecture](#project-architecture)
  - [Core Components](#core-components)
  - [Workflow](#workflow)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Developer Guide (Getting Started)](#developer-guide-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Full System](#running-the-full-system)
- [User Guide (Using the MVP)](#user-guide-using-the-mvp)
  - [Step 1: Initialize the System & Register a Model](#step-1-initialize-the-system--register-a-model)
  - [Step 2: Whitelist Your Account as an Executor](#step-2-whitelist-your-account-as-an-executor)
  - [Step 3: Test the Full Economic Loop](#step-3-test-the-full-economic-loop)

## Project Architecture

The ComretonAI MVP is a hybrid on-chain/off-chain system designed to combine the immense processing power of off-chain computation with the immutable trust of a public blockchain.

### Core Components

1.  **On-Chain Contracts (Aptos & Move):**
    *   **`mlp_verifier.move`**: A highly-optimized smart contract containing the hardcoded verification key for our specific ML model. Its sole purpose is to perform the final, cryptographic `bn254_pairing_check`.
    *   **`orchestrator.move`**: The main application logic contract. It manages the lifecycle of inference jobs, including:
        *   A registry of ML models.
        *   A table of active and completed jobs.
        *   An escrow "pot" to hold user fees.
        *   An allowlist of trusted, off-chain executors.
        *   Emitting a `JobCreatedEvent` to signal that new work is available.

2.  **Off-Chain Crypto Engine (Circom & snarkJS):**
    *   **`mlp.circom`**: A ZKP circuit that mathematically represents a simple 2-layer Multi-Layer Perceptron (MLP). This circuit can prove that for a given set of weights and inputs, a specific output was correctly calculated.
    *   **Prover Script (`run.mjs`)**: A Node.js script that uses `snarkjs` to take model weights and inputs, generate a cryptographic proof of the computation, and output it to `proof.json`.

3.  **Off-Chain Services (Node.js):**
    *   **`comreton-service.mjs`**: An automated, continuously running backend service that acts as both the **Indexer** and **Executor**.
        *   **Indexer Role**: It polls the Aptos blockchain, scans the `jobs` table in our `orchestrator` contract, and identifies any jobs with a `Pending` status.
        *   **Executor Role**: When a pending job is found, it runs the prover script to generate a ZK proof, then calls the `submit_result` function on-chain, delivering the result and the proof to claim its reward.

### Workflow

1.  **Setup (Admin):** An administrator deploys the contracts and calls `initialize()` and `register_executor()` to set up the system.
2.  **Request (User):** A user calls the `request_inference()` function on the `orchestrator` contract. They pay a fee, which is held in escrow by the contract.
3.  **Detect & Execute (Off-Chain Service):** The `comreton-service` detects the pending job. It runs the prover to generate the ZK proof for the specified computation.
4.  **Submit & Verify (Off-Chain Service):** The service calls the `submit_result()` function, providing the ML output and the ZK proof.
5.  **Reward (On-Chain):** The `orchestrator` contract calls the `mlp_verifier` contract. If the proof is valid, the job's status is updated to `Completed`, and the fee is transferred from the escrow to the executor's account.

## Tech Stack

*   **Blockchain:** Aptos (Devnet)
*   **Smart Contracts:** Move
*   **Zero-Knowledge Proofs:** Circom & snarkjs
*   **Off-Chain Components:** Node.js

## Repository Structure

```
ComretonAI/
├── packages/
│   ├── aptos/             # All on-chain Move smart contracts
│   │   ├── sources/
│   │   │   ├── verifier.move
│   │   │   └── orchestrator.move
│   │   └── Move.toml
│   ├── circuits/          # The ZKP circuit and prover logic
│   │   ├── mlp.circom
│   │   └── run.mjs
│   ├── services/          # The automated off-chain indexer/executor
│   │   └── comreton-service.mjs
│   └── submitter/         # Manual scripts for testing and interaction
│       ├── test_orchestrator.mjs
│       ├── whitelist_executor.mjs
│       └── test_economic_loop.mjs
└── README.md
```

---

## Developer Guide (Getting Started)

This guide will help you set up a local development environment to work on the ComretonAI codebase.

### Prerequisites

1.  **Node.js:** v18.0 or higher.
2.  **Rust & Cargo:** Required to install the Circom compiler.
3.  **Aptos CLI:** A modern version that supports the `features` flag in `Move.toml`.
4.  **Git**.

### Installation

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/pro-utkarshM/ComretonAI/
    cd ComretonAI
    ```

2.  **Install Circom Compiler:**
    ```bash
    cargo install circom
    ```

3.  **Install Node.js Dependencies for all packages:**
    ```bash
    # Install for circuits package
    cd packages/circuits
    npm install

    # Install for submitter package
    cd ../submitter
    npm install

    # Install for services package
    cd ../services
    npm install

    cd ../.. # Return to root
    ```

4.  **Set Up Aptos Account:**
    The project is configured to use a local `.aptos` directory. If you don't have one, navigate to `packages/aptos` and run `aptos init` to generate a fresh account for testing. You will need to update the address and private key in the `Move.toml` and all `.mjs` scripts accordingly.

### Running the Full System

1.  **Deploy Contracts:** From `packages/aptos`, run `aptos move publish`.
2.  **Start the Service:** In one terminal, from `packages/services`, run `node comreton-service.mjs`.
3.  **Submit Work:** In another terminal, use the scripts in `packages/submitter` to interact with the deployed contracts, following the User Guide below.

---

## User Guide (Using the MVP)

This guide walks you through interacting with the deployed MVP to test the entire economic loop, from user payment to executor reward.

This guide assumes:
*   The contracts have been deployed by an administrator.
*   Your account address and private key are correctly configured in all `.mjs` scripts in the `packages/submitter/` directory.

### Step 1: Initialize the System & Register a Model

This step only needs to be run **once per deployment**. It creates the manager resource on-chain and registers our default MLP model with a fee.

```bash
# Navigate to the submitter package
cd packages/submitter

# Run the initialization and registration script
node test_orchestrator.mjs
```
**Expected Outcome:** Two successful transactions. The on-chain application is now "live".

### Step 2: Whitelist Your Account as an Executor

To be able to earn rewards for completing jobs, your account must be authorized. This admin function adds your account to the on-chain allowlist.

```bash
# In packages/submitter/
node whitelist_executor.mjs
```
**Expected Outcome:** A successful transaction that authorizes your account.

### Step 3: Test the Full Economic Loop

This is the main demonstration of the MVP. The `test_economic_loop.mjs` script simulates both the **user** and the **executor**.

1.  First, it acts as a **user**, calling `request_inference` and paying the fee into the contract's escrow.
2.  Then, it acts as the **executor**, calling `submit_result` with the ZK proof to complete the job and claim the fee as a reward.

```bash
# In packages/submitter/
node test_economic_loop.mjs
```

**Expected Outcome:**
You will see two successful transactions logged to the console:
1.  The first for creating the job and paying the fee.
2.  The second for submitting the result and receiving the reward.

A final success message will be printed:
`🎉 CONGRATULATIONS! Phase 3 Complete! 🎉 The full economic loop (Pay -> Escrow -> Work -> Reward) is working.`

This single script demonstrates that the entire on-chain system is functioning correctly.
