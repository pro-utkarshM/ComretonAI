module comreton_ai::marketplace {
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::account;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::timestamp;

    // Error codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_ALREADY_INITIALIZED: u64 = 2;
    const E_MODEL_NOT_FOUND: u64 = 3;
    const E_MODEL_ALREADY_EXISTS: u64 = 4;
    const E_INSUFFICIENT_STAKE: u64 = 5;
    const E_NOT_AUDITOR: u64 = 6;
    const E_MODEL_NOT_VERIFIED: u64 = 7;
    const E_ALREADY_AUDITED: u64 = 8;

    // Constants
    const MINIMUM_STAKE: u64 = 1000000; // 0.01 APT
    const AUDIT_THRESHOLD: u64 = 3; // Need 3 auditors
    const CREATOR_FEE_PERCENT: u64 = 40;
    const AUDITOR_FEE_PERCENT: u64 = 30;
    const PLATFORM_FEE_PERCENT: u64 = 30;

    // Model status
    const STATUS_PENDING: u8 = 0;
    const STATUS_VERIFIED: u8 = 1;
    const STATUS_REJECTED: u8 = 2;

    struct Model has store, drop, copy {
        id: u64,
        creator: address,
        name: String,
        description: String,
        ipfs_hash: String,
        category: String,
        price_per_inference: u64,
        status: u8,
        auditor_count: u64,
        total_inferences: u64,
        created_at: u64,
    }

    struct Auditor has store, drop {
        address: address,
        stake_amount: u64,
        models_audited: vector<u64>,
        reputation: u64,
    }

    struct AuditRecord has store, drop {
        model_id: u64,
        auditor: address,
        approved: bool,
        feedback: String,
        timestamp: u64,
    }

    struct Marketplace has key {
        models: vector<Model>,
        auditors: vector<Auditor>,
        audits: vector<AuditRecord>,
        next_model_id: u64,
        treasury: Coin<AptosCoin>,
        
        // Events
        model_created_events: EventHandle<ModelCreatedEvent>,
        model_audited_events: EventHandle<ModelAuditedEvent>,
        inference_events: EventHandle<InferenceEvent>,
    }

    struct UserProfile has key {
        models_created: vector<u64>,
        total_earnings: u64,
        is_auditor: bool,
        auditor_stake: u64,
    }

    // Events
    struct ModelCreatedEvent has drop, store {
        model_id: u64,
        creator: address,
        name: String,
        timestamp: u64,
    }

    struct ModelAuditedEvent has drop, store {
        model_id: u64,
        auditor: address,
        approved: bool,
        timestamp: u64,
    }

    struct InferenceEvent has drop, store {
        model_id: u64,
        user: address,
        fee: u64,
        timestamp: u64,
    }

    // Initialize marketplace
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        assert!(!exists<Marketplace>(admin_addr), E_ALREADY_INITIALIZED);

        move_to(admin, Marketplace {
            models: vector::empty(),
            auditors: vector::empty(),
            audits: vector::empty(),
            next_model_id: 1,
            treasury: coin::zero<AptosCoin>(),
            model_created_events: account::new_event_handle<ModelCreatedEvent>(admin),
            model_audited_events: account::new_event_handle<ModelAuditedEvent>(admin),
            inference_events: account::new_event_handle<InferenceEvent>(admin),
        });
    }

    // Create user profile
    public entry fun create_profile(user: &signer) {
        let user_addr = signer::address_of(user);
        if (!exists<UserProfile>(user_addr)) {
            move_to(user, UserProfile {
                models_created: vector::empty(),
                total_earnings: 0,
                is_auditor: false,
                auditor_stake: 0,
            });
        }
    }

    // Register a new model
    public entry fun register_model(
        creator: &signer,
        marketplace_addr: address,
        name: vector<u8>,
        description: vector<u8>,
        ipfs_hash: vector<u8>,
        category: vector<u8>,
        price_per_inference: u64,
    ) acquires Marketplace, UserProfile {
        let creator_addr = signer::address_of(creator);
        
        // Ensure user has profile
        if (!exists<UserProfile>(creator_addr)) {
            create_profile(creator);
        };

        let marketplace = borrow_global_mut<Marketplace>(marketplace_addr);
        let model_id = marketplace.next_model_id;

        let model = Model {
            id: model_id,
            creator: creator_addr,
            name: string::utf8(name),
            description: string::utf8(description),
            ipfs_hash: string::utf8(ipfs_hash),
            category: string::utf8(category),
            price_per_inference,
            status: STATUS_PENDING,
            auditor_count: 0,
            total_inferences: 0,
            created_at: timestamp::now_seconds(),
        };

        vector::push_back(&mut marketplace.models, model);
        marketplace.next_model_id = model_id + 1;

        // Update user profile
        let profile = borrow_global_mut<UserProfile>(creator_addr);
        vector::push_back(&mut profile.models_created, model_id);

        // Emit event
        event::emit_event(
            &mut marketplace.model_created_events,
            ModelCreatedEvent {
                model_id,
                creator: creator_addr,
                name: string::utf8(name),
                timestamp: timestamp::now_seconds(),
            }
        );
    }

    // Become an auditor by staking
    public entry fun become_auditor(
        auditor: &signer,
        marketplace_addr: address,
        stake_amount: u64,
    ) acquires Marketplace, UserProfile {
        let auditor_addr = signer::address_of(auditor);
        assert!(stake_amount >= MINIMUM_STAKE, E_INSUFFICIENT_STAKE);

        // Ensure user has profile
        if (!exists<UserProfile>(auditor_addr)) {
            create_profile(auditor);
        };

        let marketplace = borrow_global_mut<Marketplace>(marketplace_addr);
        let stake_coin = coin::withdraw<AptosCoin>(auditor, stake_amount);
        coin::merge(&mut marketplace.treasury, stake_coin);

        // Add to auditors list
        let new_auditor = Auditor {
            address: auditor_addr,
            stake_amount,
            models_audited: vector::empty(),
            reputation: 100, // Start with base reputation
        };
        vector::push_back(&mut marketplace.auditors, new_auditor);

        // Update profile
        let profile = borrow_global_mut<UserProfile>(auditor_addr);
        profile.is_auditor = true;
        profile.auditor_stake = stake_amount;
    }

    // Audit a model
    public entry fun audit_model(
        auditor: &signer,
        marketplace_addr: address,
        model_id: u64,
        approved: bool,
        feedback: vector<u8>,
    ) acquires Marketplace, UserProfile {
        let auditor_addr = signer::address_of(auditor);
        let marketplace = borrow_global_mut<Marketplace>(marketplace_addr);
        
        // Verify auditor
        let profile = borrow_global<UserProfile>(auditor_addr);
        assert!(profile.is_auditor, E_NOT_AUDITOR);

        // Check if already audited
        let i = 0;
        let audits_len = vector::length(&marketplace.audits);
        while (i < audits_len) {
            let audit = vector::borrow(&marketplace.audits, i);
            assert!(!(audit.model_id == model_id && audit.auditor == auditor_addr), E_ALREADY_AUDITED);
            i = i + 1;
        };

        // Find and update model
        let j = 0;
        let models_len = vector::length(&marketplace.models);
        let model_found = false;
        
        while (j < models_len) {
            let model = vector::borrow_mut(&mut marketplace.models, j);
            if (model.id == model_id) {
                model_found = true;
                model.auditor_count = model.auditor_count + 1;
                
                // Check if enough auditors approved
                if (model.auditor_count >= AUDIT_THRESHOLD && approved) {
                    model.status = STATUS_VERIFIED;
                };
                break
            };
            j = j + 1;
        };
        
        assert!(model_found, E_MODEL_NOT_FOUND);

        // Record audit
        let audit_record = AuditRecord {
            model_id,
            auditor: auditor_addr,
            approved,
            feedback: string::utf8(feedback),
            timestamp: timestamp::now_seconds(),
        };
        vector::push_back(&mut marketplace.audits, audit_record);

        // Update auditor record
        let k = 0;
        let auditors_len = vector::length(&marketplace.auditors);
        while (k < auditors_len) {
            let auditor_record = vector::borrow_mut(&mut marketplace.auditors, k);
            if (auditor_record.address == auditor_addr) {
                vector::push_back(&mut auditor_record.models_audited, model_id);
                break
            };
            k = k + 1;
        };

        // Emit event
        event::emit_event(
            &mut marketplace.model_audited_events,
            ModelAuditedEvent {
                model_id,
                auditor: auditor_addr,
                approved,
                timestamp: timestamp::now_seconds(),
            }
        );
    }

    // Run inference and pay fees
    public entry fun run_inference(
        user: &signer,
        marketplace_addr: address,
        model_id: u64,
    ) acquires Marketplace, UserProfile {
        let user_addr = signer::address_of(user);
        let marketplace = borrow_global_mut<Marketplace>(marketplace_addr);

        // Find model
        let i = 0;
        let models_len = vector::length(&marketplace.models);
        let model_found = false;
        let inference_fee = 0u64;
        let creator_addr = @0x0;
        
        while (i < models_len) {
            let model = vector::borrow_mut(&mut marketplace.models, i);
            if (model.id == model_id) {
                model_found = true;
                assert!(model.status == STATUS_VERIFIED, E_MODEL_NOT_VERIFIED);
                inference_fee = model.price_per_inference;
                creator_addr = model.creator;
                model.total_inferences = model.total_inferences + 1;
                break
            };
            i = i + 1;
        };
        
        assert!(model_found, E_MODEL_NOT_FOUND);

        // Collect payment
        let payment = coin::withdraw<AptosCoin>(user, inference_fee);
        
        // Calculate fee splits
        let creator_fee = (inference_fee * CREATOR_FEE_PERCENT) / 100;
        let auditor_fee = (inference_fee * AUDITOR_FEE_PERCENT) / 100;
        let platform_fee = inference_fee - creator_fee - auditor_fee;

        // Pay creator
        let creator_payment = coin::extract(&mut payment, creator_fee);
        coin::deposit(creator_addr, creator_payment);

        // Update creator earnings
        if (exists<UserProfile>(creator_addr)) {
            let creator_profile = borrow_global_mut<UserProfile>(creator_addr);
            creator_profile.total_earnings = creator_profile.total_earnings + creator_fee;
        };

        // Distribute auditor fees
        let auditor_count = 0u64;
        let j = 0;
        let audits_len = vector::length(&marketplace.audits);
        
        // Count approved auditors for this model
        while (j < audits_len) {
            let audit = vector::borrow(&marketplace.audits, j);
            if (audit.model_id == model_id && audit.approved) {
                auditor_count = auditor_count + 1;
            };
            j = j + 1;
        };

        if (auditor_count > 0) {
            let per_auditor_fee = auditor_fee / auditor_count;
            
            // Pay each auditor
            let k = 0;
            while (k < audits_len) {
                let audit = vector::borrow(&marketplace.audits, k);
                if (audit.model_id == model_id && audit.approved) {
                    let auditor_payment = coin::extract(&mut payment, per_auditor_fee);
                    coin::deposit(audit.auditor, auditor_payment);
                };
                k = k + 1;
            };
        };

        // Remaining goes to treasury
        coin::merge(&mut marketplace.treasury, payment);

        // Emit event
        event::emit_event(
            &mut marketplace.inference_events,
            InferenceEvent {
                model_id,
                user: user_addr,
                fee: inference_fee,
                timestamp: timestamp::now_seconds(),
            }
        );
    }

    // View functions
    #[view]
    public fun get_model(marketplace_addr: address, model_id: u64): Model acquires Marketplace {
        let marketplace = borrow_global<Marketplace>(marketplace_addr);
        let i = 0;
        let len = vector::length(&marketplace.models);
        
        while (i < len) {
            let model = vector::borrow(&marketplace.models, i);
            if (model.id == model_id) {
                return *model
            };
            i = i + 1;
        };
        
        abort E_MODEL_NOT_FOUND
    }

    #[view]
    public fun get_all_models(marketplace_addr: address): vector<Model> acquires Marketplace {
        let marketplace = borrow_global<Marketplace>(marketplace_addr);
        marketplace.models
    }

    #[view]
    public fun get_user_profile(user_addr: address): (vector<u64>, u64, bool, u64) acquires UserProfile {
        if (exists<UserProfile>(user_addr)) {
            let profile = borrow_global<UserProfile>(user_addr);
            (profile.models_created, profile.total_earnings, profile.is_auditor, profile.auditor_stake)
        } else {
            (vector::empty(), 0, false, 0)
        }
    }
}