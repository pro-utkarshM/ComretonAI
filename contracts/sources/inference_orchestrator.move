module comretonai::inference_orchestrator {
    use std::signer;
    use std::string::String;
    use std::vector;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::account;
    use comretonai::comai_token::{Self, COMAI};
    use comretonai::model_registry;
    use comretonai::audit_staking;
    use comretonai::zkp_verifier;

    /// Job status
    const STATUS_CREATED: u8 = 0;
    const STATUS_COMPLETED: u8 = 1;

    /// Errors
    const E_MODEL_NOT_VERIFIED: u64 = 1;
    const E_JOB_NOT_FOUND: u64 = 2;
    const E_INVALID_PROOF: u64 = 3;

    /// Inference job
    struct Job has store, copy, drop {
        job_id: u64,
        requester: address,
        model_id: u64,
        input_data: String,
        result: String,
        status: u8,
        fee_paid: u64,
    }

    /// Global orchestrator state
    struct OrchestratorState has key {
        jobs: vector<Job>,
        next_job_id: u64,
        job_created_events: EventHandle<JobCreatedEvent>,
        job_completed_events: EventHandle<JobCompletedEvent>,
    }

    /// Events
    struct JobCreatedEvent has drop, store {
        job_id: u64,
        requester: address,
        model_id: u64,
        fee: u64,
    }

    struct JobCompletedEvent has drop, store {
        job_id: u64,
        executor: address,
        result: String,
    }

    /// Initialize orchestrator
    public entry fun initialize(admin: &signer) {
        move_to(admin, OrchestratorState {
            jobs: vector::empty<Job>(),
            next_job_id: 1,
            job_created_events: account::new_event_handle<JobCreatedEvent>(admin),
            job_completed_events: account::new_event_handle<JobCompletedEvent>(admin),
        });
    }

    /// Request inference
    public entry fun request_inference(
        requester: &signer,
        model_id: u64,
        input: String,
        fee: u64,
    ) acquires OrchestratorState {
        // Check if model is verified
        assert!(model_registry::is_model_verified(model_id), E_MODEL_NOT_VERIFIED);

        let requester_addr = signer::address_of(requester);
        
        // Pay fee
        let fee_coins = coin::withdraw<COMAI>(requester, fee);
        coin::deposit(@comretonai, fee_coins);

        // Create job
        let state = borrow_global_mut<OrchestratorState>(@comretonai);
        let job_id = state.next_job_id;
        state.next_job_id = job_id + 1;

        let job = Job {
            job_id,
            requester: requester_addr,
            model_id,
            input_data: input,
            result: std::string::utf8(b""),
            status: STATUS_CREATED,
            fee_paid: fee,
        };

        vector::push_back(&mut state.jobs, job);

        // Emit event
        event::emit_event(&mut state.job_created_events, JobCreatedEvent {
            job_id,
            requester: requester_addr,
            model_id,
            fee,
        });
    }

    /// Submit inference result
    public entry fun submit_result(
        executor: &signer,
        job_id: u64,
        result: String,
        proof: vector<u8>,
    ) acquires OrchestratorState {
        let executor_addr = signer::address_of(executor);
        
        // Verify ZKP
        assert!(zkp_verifier::verify_proof(proof, vector::empty<u8>()), E_INVALID_PROOF);

        // Find and update job
        let state = borrow_global_mut<OrchestratorState>(@comretonai);
        let i = 0;
        let len = vector::length(&state.jobs);
        let job_found = false;
        let model_id = 0;
        let fee_paid = 0;
        
        while (i < len) {
            let job = vector::borrow_mut(&mut state.jobs, i);
            if (job.job_id == job_id) {
                job.result = result;
                job.status = STATUS_COMPLETED;
                model_id = job.model_id;
                fee_paid = job.fee_paid;
                job_found = true;
                break
            };
            i = i + 1;
        };
        
        assert!(job_found, E_JOB_NOT_FOUND);

        // Distribute fees
        let model = model_registry::get_model(model_id);
        let auditors = audit_staking::get_auditors_for_model(model_id);
        
        let fee_coins = coin::withdraw<COMAI>(@comretonai, fee_paid);
        comai_token::distribute_fee(fee_coins, model.owner, auditors, executor_addr);

        // Emit event
        event::emit_event(&mut state.job_completed_events, JobCompletedEvent {
            job_id,
            executor: executor_addr,
            result,
        });
    }

    /// View functions
    #[view]
    public fun get_job(job_id: u64): Job acquires OrchestratorState {
        let state = borrow_global<OrchestratorState>(@comretonai);
        let i = 0;
        let len = vector::length(&state.jobs);
        
        while (i < len) {
            let job = vector::borrow(&state.jobs, i);
            if (job.job_id == job_id) {
                return *job
            };
            i = i + 1;
        };
        abort E_JOB_NOT_FOUND
    }

    #[view]
    public fun get_all_jobs(): vector<Job> acquires OrchestratorState {
        let state = borrow_global<OrchestratorState>(@comretonai);
        state.jobs
    }
}