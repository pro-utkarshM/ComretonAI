module comretonai::comai_token {
    use std::signer;
    use std::string::{Self, String};
    use aptos_framework::coin::{Self, Coin, BurnCapability, FreezeCapability, MintCapability};
    use aptos_framework::event;

    /// COMAI token for the ComretonAI platform
    struct COMAI {}

    /// Capabilities for managing COMAI token
    struct TokenCapabilities has key {
        mint_cap: MintCapability<COMAI>,
        burn_cap: BurnCapability<COMAI>,
        freeze_cap: FreezeCapability<COMAI>,
    }

    /// Initialize COMAI token
    public entry fun initialize(admin: &signer) {
        let (burn_cap, freeze_cap, mint_cap) = coin::initialize<COMAI>(
            admin,
            string::utf8(b"ComretonAI Token"),
            string::utf8(b"COMAI"),
            8,
            true,
        );

        move_to(admin, TokenCapabilities {
            mint_cap,
            burn_cap,
            freeze_cap,
        });
    }

    /// Mint COMAI tokens (for demo purposes)
    public entry fun mint(
        admin: &signer,
        to: address,
        amount: u64
    ) acquires TokenCapabilities {
        let caps = borrow_global<TokenCapabilities>(signer::address_of(admin));
        let coins = coin::mint(amount, &caps.mint_cap);
        coin::deposit(to, coins);
    }

    /// Distribute inference fees
    public fun distribute_fee(
        fee: Coin<COMAI>,
        creator: address,
        auditors: vector<address>,
        executor: address
    ) {
        let total_fee = coin::value(&fee);
        let creator_share = total_fee * 40 / 100;  // 40%
        let executor_share = total_fee * 20 / 100; // 20%
        let auditor_total = total_fee - creator_share - executor_share; // 40%
        
        // Pay creator
        let creator_coins = coin::extract(&mut fee, creator_share);
        coin::deposit(creator, creator_coins);
        
        // Pay executor
        let executor_coins = coin::extract(&mut fee, executor_share);
        coin::deposit(executor, executor_coins);
        
        // Pay auditors equally
        let num_auditors = std::vector::length(&auditors);
        if (num_auditors > 0) {
            let per_auditor = auditor_total / num_auditors;
            let i = 0;
            while (i < num_auditors) {
                let auditor = *std::vector::borrow(&auditors, i);
                let auditor_coins = coin::extract(&mut fee, per_auditor);
                coin::deposit(auditor, auditor_coins);
                i = i + 1;
            };
        };
        
        // Burn any remaining dust
        let (burn_cap, _, _) = coin::initialize<COMAI>(
            @comretonai,
            string::utf8(b""),
            string::utf8(b""),
            0,
            false,
        );
        coin::burn(fee, &burn_cap);
    }
}