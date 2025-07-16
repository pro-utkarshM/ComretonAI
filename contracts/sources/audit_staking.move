module comretonai::audit_staking {
    use std::signer;
    use std::vector;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::account;
    use comretonai::comai_token::COMAI;
    use comretonai::model_registry;

    /// Errors
    const E_INSUFFICIENT_STAKE: u64 = 1;
    const E_ALREADY_ATTESTED: u64 = 2;
    const E_MODEL_NOT_FOUND: u64 = 3;

    /// Minimum stake required to verify a model
    const VERIFICATION_THRESHOLD: u64 = 100000000; // 1000 COMAI (8 decimals)

    /// Attestation record
    struct Attestation has store, copy, drop {
        model_id: u64,
        auditor: address,
        staked_amount: u64,
    }

    /// Global staking state
    struct StakingState has key {
        attestations: vector<Attestation>,
        attestation_events: EventHandle<AttestationEvent>,
        verification_events: EventHandle<VerificationEvent>,
    }

    /// Events
    struct AttestationEvent has drop, store {
        model_id: u64,
        auditor: address,
        amount: u64,
    }

    struct VerificationEvent has drop, store {
        model_id: u64,
        total_stake: u64,
    }

    /// Initialize staking
    public entry fun initialize(admin: &signer) {
        move_to(admin, StakingState {
            attestations: vector::empty<Attestation>(),
            attestation_events: account::new_event_handle<AttestationEvent>(admin),
            verification_events: account::new_event_handle<VerificationEvent>(admin),
        });
    }

    /// Stake tokens to attest to a model
    public entry fun attest(
        auditor: &signer,
        model_id: u64,
        stake_amount: u64,
    ) acquires StakingState {
        let auditor_addr = signer::address_of(auditor);
        
        // Check if model exists
        let _ = model_registry::get_model(model_id);
        
        // Check if already attested
        let state = borrow_global<StakingState>(@comretonai);
        let i = 0;
        let len = vector::length(&state.attestations);
        while (i < len) {
            let attestation = vector::borrow(&state.attestations, i);
            assert!(!(attestation.model_id == model_id && attestation.auditor == auditor_addr), E_ALREADY_ATTESTED);
            i = i + 1;
        };

        // Transfer stake
        let stake_coins = coin::withdraw<COMAI>(auditor, stake_amount);
        coin::deposit(@comretonai, stake_coins);

        // Record attestation
        let state = borrow_global_mut<StakingState>(@comretonai);
        let attestation = Attestation {
            model_id,
            auditor: auditor_addr,
            staked_amount: stake_amount,
        };
        vector::push_back(&mut state.attestations, attestation);

        // Emit event
        event::emit_event(&mut state.attestation_events, AttestationEvent {
            model_id,
            auditor: auditor_addr,
            amount: stake_amount,
        });

        // Check if verification threshold is met
        check_verification_threshold(model_id);
    }

    /// Check if model has enough stake to be verified
    fun check_verification_threshold(model_id: u64) acquires StakingState {
        let total_stake = get_total_stake_for_model(model_id);
        
        if (total_stake >= VERIFICATION_THRESHOLD) {
            // Update model status to verified
            model_registry::update_model_status(model_id, 1); // STATUS_VERIFIED
            
            // Emit verification event
            let state = borrow_global_mut<StakingState>(@comretonai);
            event::emit_event(&mut state.verification_events, VerificationEvent {
                model_id,
                total_stake,
            });
        }
    }

    /// Get total stake for a model
    public fun get_total_stake_for_model(model_id: u64): u64 acquires StakingState {
        let state = borrow_global<StakingState>(@comretonai);
        let total = 0;
        let i = 0;
        let len = vector::length(&state.attestations);
        
        while (i < len) {
            let attestation = vector::borrow(&state.attestations, i);
            if (attestation.model_id == model_id) {
                total = total + attestation.staked_amount;
            };
            i = i + 1;
        };
        total
    }

    /// Get auditors for a model
    public fun get_auditors_for_model(model_id: u64): vector<address> acquires StakingState {
        let state = borrow_global<StakingState>(@comretonai);
        let auditors = vector::empty<address>();
        let i = 0;
        let len = vector::length(&state.attestations);
        
        while (i < len) {
            let attestation = vector::borrow(&state.attestations, i);
            if (attestation.model_id == model_id) {
                vector::push_back(&mut auditors, attestation.auditor);
            };
            i = i + 1;
        };
        auditors
    }

    /// View functions
    #[view]
    public fun get_all_attestations(): vector<Attestation> acquires StakingState {
        let state = borrow_global<StakingState>(@comretonai);
        state.attestations
    }
}