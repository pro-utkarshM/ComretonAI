// In packages/aptos/sources/orchestrator.move (Phase 3 Economics - Complete Code)
module comreton_verifier::orchestrator {
    use std::signer;
    use std::string::{String};
    use aptos_framework::event;
    use aptos_framework::table::{Self, Table};
    use aptos_framework::account;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;

    use comreton_verifier::mlp_verifier;

    // --- Error Codes ---
    const E_ALREADY_INITIALIZED: u64 = 1;
    const E_NOT_INITIALIZED: u64 = 2;
    const E_MODEL_NOT_FOUND: u64 = 3;
    const E_JOB_NOT_FOUND: u64 = 4;
    const E_JOB_ALREADY_COMPLETED: u64 = 5;
    const E_INSUFFICIENT_FUNDS: u64 = 6;
    const E_NOT_AUTHORIZED: u64 = 7;

    // --- Structs and Events ---
    struct Model has key, store {
        id: u64,
        owner: address,
        ipfs_cid: String,
        fee: u64,
    }

    enum JobStatus has store, copy, drop {
        Pending,
        Completed,
    }

    struct Job has store {
        id: u64,
        model_id: u64,
        requester: address,
        status: JobStatus,
        result: vector<u8>,
        fee: u64,
    }

    struct JobCreatedEvent has drop, store {
        job_id: u64,
        model_id: u64,
        requester: address,
    }
    
    struct ComretonManager has key {
        models: Table<u64, Model>,
        model_counter: u64,
        jobs: Table<u64, Job>,
        job_counter: u64,
        job_created_events: event::EventHandle<JobCreatedEvent>,
        fee_pot: Coin<AptosCoin>,
        allowed_executors: Table<address, bool>,
    }

    // --- Functions ---

    public entry fun initialize(signer: &signer) {
        let owner_addr = signer::address_of(signer);
        assert!(!exists<ComretonManager>(owner_addr), E_ALREADY_INITIALIZED);
        let manager = ComretonManager {
            models: table::new(),
            model_counter: 0,
            jobs: table::new(),
            job_counter: 0,
            job_created_events: account::new_event_handle<JobCreatedEvent>(signer),
            fee_pot: coin::zero<AptosCoin>(),
            allowed_executors: table::new(),
        };
        move_to(signer, manager);
    }
    
    public entry fun register_executor(signer: &signer, executor_addr: address) acquires ComretonManager {
        let owner_addr = signer::address_of(signer);
        assert!(owner_addr == @comreton_verifier, E_NOT_AUTHORIZED);
        let manager = borrow_global_mut<ComretonManager>(owner_addr);
        table::add(&mut manager.allowed_executors, executor_addr, true);
    }

    public entry fun register_model(signer: &signer, ipfs_cid: String, fee: u64) acquires ComretonManager {
        let owner_addr = signer::address_of(signer);
        assert!(exists<ComretonManager>(owner_addr), E_NOT_INITIALIZED);
        let manager = borrow_global_mut<ComretonManager>(owner_addr);
        let model_id = manager.model_counter;
        manager.model_counter = manager.model_counter + 1;
        let new_model = Model {
            id: model_id,
            owner: owner_addr,
            ipfs_cid: ipfs_cid,
            fee: fee,
        };
        table::add(&mut manager.models, model_id, new_model);
    }

    public entry fun request_inference(
        signer: &signer,
        model_id: u64,
        _input_data: vector<u8>
    ) acquires ComretonManager {
        let requester_addr = signer::address_of(signer);
        let contract_owner_addr = @comreton_verifier;
        assert!(exists<ComretonManager>(contract_owner_addr), E_NOT_INITIALIZED);
        let manager = borrow_global_mut<ComretonManager>(contract_owner_addr);
        assert!(table::contains(&manager.models, model_id), E_MODEL_NOT_FOUND);

        let model = table::borrow(&manager.models, model_id);
        let fee = model.fee;

        let payment = coin::withdraw<AptosCoin>(signer, fee);
        coin::merge(&mut manager.fee_pot, payment);

        let job_id = manager.job_counter;
        manager.job_counter = manager.job_counter + 1;
        let new_job = Job {
            id: job_id,
            model_id: model_id,
            requester: requester_addr,
            status: JobStatus::Pending,
            result: vector[],
            fee: fee,
        };
        table::add(&mut manager.jobs, job_id, new_job);
        
        event::emit_event(
            &mut manager.job_created_events,
            JobCreatedEvent {
                job_id: job_id,
                model_id: model_id,
                requester: requester_addr,
            }
        );
    }

    public entry fun submit_result(
        signer: &signer,
        job_id: u64,
        result: vector<u8>,
        proof_a: vector<u8>,
        proof_b: vector<u8>,
        proof_c: vector<u8>,
        public_inputs: vector<vector<u8>>
    ) acquires ComretonManager {
        let executor_addr = signer::address_of(signer);
        let contract_owner_addr = @comreton_verifier;
        assert!(exists<ComretonManager>(contract_owner_addr), E_NOT_INITIALIZED);
        let manager = borrow_global_mut<ComretonManager>(contract_owner_addr);
        
        assert!(table::contains(&manager.allowed_executors, executor_addr), E_NOT_AUTHORIZED);
        
        assert!(table::contains(&manager.jobs, job_id), E_JOB_NOT_FOUND);
        let job = table::borrow_mut(&mut manager.jobs, job_id);
        assert!(job.status == JobStatus::Pending, E_JOB_ALREADY_COMPLETED);

        mlp_verifier::verify_groth16_proof(proof_a, proof_b, proof_c, public_inputs);

        let reward = coin::extract(&mut manager.fee_pot, job.fee);
        coin::deposit(executor_addr, reward);
        
        job.status = JobStatus::Completed;
        job.result = result;
    }
}