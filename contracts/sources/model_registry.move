module comretonai::model_registry {
    use std::signer;
    use std::string::String;
    use std::vector;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::account;

    /// Model status enum
    const STATUS_PENDING: u8 = 0;
    const STATUS_VERIFIED: u8 = 1;
    const STATUS_REJECTED: u8 = 2;

    /// Errors
    const E_MODEL_NOT_FOUND: u64 = 1;
    const E_NOT_MODEL_OWNER: u64 = 2;
    const E_INVALID_STATUS: u64 = 3;

    /// Model information
    struct Model has store, copy, drop {
        model_id: u64,
        owner: address,
        ipfs_hash: String,
        status: u8,
        name: String,
        description: String,
    }

    /// Global registry state
    struct Registry has key {
        models: vector<Model>,
        next_model_id: u64,
        model_registered_events: EventHandle<ModelRegisteredEvent>,
        model_status_updated_events: EventHandle<ModelStatusUpdatedEvent>,
    }

    /// Events
    struct ModelRegisteredEvent has drop, store {
        model_id: u64,
        owner: address,
        ipfs_hash: String,
        name: String,
    }

    struct ModelStatusUpdatedEvent has drop, store {
        model_id: u64,
        old_status: u8,
        new_status: u8,
    }

    /// Initialize the registry
    public entry fun initialize(admin: &signer) {
        move_to(admin, Registry {
            models: vector::empty<Model>(),
            next_model_id: 1,
            model_registered_events: account::new_event_handle<ModelRegisteredEvent>(admin),
            model_status_updated_events: account::new_event_handle<ModelStatusUpdatedEvent>(admin),
        });
    }

    /// Register a new model
    public entry fun register_model(
        owner: &signer,
        ipfs_hash: String,
        name: String,
        description: String,
    ) acquires Registry {
        let registry = borrow_global_mut<Registry>(@comretonai);
        let model_id = registry.next_model_id;
        registry.next_model_id = model_id + 1;

        let model = Model {
            model_id,
            owner: signer::address_of(owner),
            ipfs_hash,
            status: STATUS_PENDING,
            name,
            description,
        };

        vector::push_back(&mut registry.models, model);

        event::emit_event(&mut registry.model_registered_events, ModelRegisteredEvent {
            model_id,
            owner: signer::address_of(owner),
            ipfs_hash,
            name,
        });
    }

    /// Update model status (called by audit staking contract)
    public fun update_model_status(model_id: u64, new_status: u8) acquires Registry {
        let registry = borrow_global_mut<Registry>(@comretonai);
        let i = 0;
        let len = vector::length(&registry.models);
        
        while (i < len) {
            let model = vector::borrow_mut(&mut registry.models, i);
            if (model.model_id == model_id) {
                let old_status = model.status;
                model.status = new_status;
                
                event::emit_event(&mut registry.model_status_updated_events, ModelStatusUpdatedEvent {
                    model_id,
                    old_status,
                    new_status,
                });
                return
            };
            i = i + 1;
        };
        abort E_MODEL_NOT_FOUND
    }

    /// Get model by ID
    public fun get_model(model_id: u64): Model acquires Registry {
        let registry = borrow_global<Registry>(@comretonai);
        let i = 0;
        let len = vector::length(&registry.models);
        
        while (i < len) {
            let model = vector::borrow(&registry.models, i);
            if (model.model_id == model_id) {
                return *model
            };
            i = i + 1;
        };
        abort E_MODEL_NOT_FOUND
    }

    /// Check if model is verified
    public fun is_model_verified(model_id: u64): bool acquires Registry {
        let model = get_model(model_id);
        model.status == STATUS_VERIFIED
    }

    /// View functions
    #[view]
    public fun get_all_models(): vector<Model> acquires Registry {
        let registry = borrow_global<Registry>(@comretonai);
        registry.models
    }

    #[view]
    public fun get_model_status(model_id: u64): u8 acquires Registry {
        let model = get_model(model_id);
        model.status
    }
}