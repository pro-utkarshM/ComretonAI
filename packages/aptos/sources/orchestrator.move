// In packages/aptos/sources/orchestrator.move (Corrected)
module comreton_verifier::orchestrator {
    use std::signer;
    use std::string::{String};
    use aptos_framework::event;
    use aptos_framework::table::{Self, Table};
    use aptos_framework::account;

    use comreton_verifier::mlp_verifier; // Will use this later

    // --- Error Codes ---
    const E_ALREADY_INITIALIZED: u64 = 1;
    const E_NOT_INITIALIZED: u64 = 2;
    const E_MODEL_NOT_FOUND: u64 = 3;

    // --- Structs and Events ---
    struct Model has key, store { id: u64, owner: address, ipfs_cid: String, fee: u64 }
    enum JobStatus has store { Pending, Completed }
    struct Job has store { id: u64, model_id: u64, requester: address, status: JobStatus, result: vector<u8> }
    struct JobCreatedEvent has drop, store { job_id: u64, model_id: u64, requester: address }
    struct ComretonManager has key {
        models: Table<u64, Model>,
        model_counter: u64,
        jobs: Table<u64, Job>,
        job_counter: u64,
        job_created_events: event::EventHandle<JobCreatedEvent>,
    }

    // --- Implemented Functions ---
    public entry fun initialize(signer: &signer) {
        let owner_addr = signer::address_of(signer);
        assert!(!exists<ComretonManager>(owner_addr), E_ALREADY_INITIALIZED);
        let manager = ComretonManager {
            models: table::new(),
            model_counter: 0,
            jobs: table::new(),
            job_counter: 0,
            job_created_events: account::new_event_handle<JobCreatedEvent>(signer),
        };
        move_to(signer, manager);
    }

    public entry fun register_model(signer: &signer, ipfs_cid: String, fee: u64) acquires ComretonManager {
        let owner_addr = signer::address_of(signer);
        assert!(exists<ComretonManager>(owner_addr), E_NOT_INITIALIZED);
        let manager = borrow_global_mut<ComretonManager>(owner_addr);
        let model_id = manager.model_counter;
        manager.model_counter = manager.model_counter + 1;
        let new_model = Model { id: model_id, owner: owner_addr, ipfs_cid: ipfs_cid, fee: fee };
        table::add(&mut manager.models, model_id, new_model);
    }

    // --- NEWLY IMPLEMENTED FUNCTION ---
    public entry fun request_inference(
        signer: &signer,
        model_id: u64,
        _input_data: vector<u8> // Ignoring input for now
    ) acquires ComretonManager {
        let requester_addr = signer::address_of(signer);
        let contract_owner_addr = @comreton_verifier;
        assert!(exists<ComretonManager>(contract_owner_addr), E_NOT_INITIALIZED);
        let manager = borrow_global_mut<ComretonManager>(contract_owner_addr);

        assert!(table::contains(&manager.models, model_id), E_MODEL_NOT_FOUND);

        let job_id = manager.job_counter;
        manager.job_counter = manager.job_counter + 1;

        let new_job = Job {
            id: job_id,
            model_id: model_id,
            requester: requester_addr,
            status: JobStatus::Pending,
            result: vector[],
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

    // In packages/aptos/sources/orchestrator.move

    // --- Function to be implemented next ---
    public entry fun submit_result(
        _signer: &signer, _job_id: u64, _result: vector<u8>, _proof_a: vector<u8>,
        _proof_b: vector<u8>, _proof_c: vector<u8>, _public_inputs: vector<vector<u8>>
    ) acquires ComretonManager {
        // THE FIX IS HERE: We borrow the resource to satisfy the 'acquires' clause.
        let contract_owner_addr = @comreton_verifier;
        assert!(exists<ComretonManager>(contract_owner_addr), E_NOT_INITIALIZED);
        let _manager = borrow_global_mut<ComretonManager>(contract_owner_addr);
        // We will add the verification logic here in the next step.
        // For now, borrowing the resource is enough to make the code compile.
    }
}