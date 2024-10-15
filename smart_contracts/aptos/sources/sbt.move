module DDW::DDWapproval {
    use std::string;
    use std::error;

    use aptos_framework::coin::{Self as basecoin, BurnCapability, FreezeCapability, MintCapability};

    friend DDW::DDWApp;

    //
    // Errors
    //

    /// Account has no capabilities (burn/mint).
    const ENO_CAPABILITIES: u64 = 1;

    //
    // Data structures
    //
    struct CoinType has store {}
    /// Capabilities resource storing mint and burn capabilities.
    /// The resource is stored on the account that initialized coin `CoinType`.
    struct Capabilities has key {
        burn_cap: BurnCapability<CoinType>,
        freeze_cap: FreezeCapability<CoinType>,
        mint_cap: MintCapability<CoinType>,
    }

    //
    // Public functions
    //

    /// Withdraw an `amount` of coin `CoinType` from `account` and burn it.
    public(friend) entry fun burn(
        account: &signer,
        amount: u64,
    ) acquires Capabilities {
        let account_addr = @DDW;

        assert!(
            exists<Capabilities>(account_addr),
            error::not_found(ENO_CAPABILITIES),
        );

        let capabilities = borrow_global<Capabilities>(account_addr);

        let to_burn = basecoin::withdraw<CoinType>(account, amount);
        basecoin::burn<CoinType>(to_burn, &capabilities.burn_cap);
    }

    /// Initialize new coin `CoinType` in Aptos Blockchain.
    /// Mint and Burn Capabilities will be stored under `account` in `Capabilities` resource.
    public entry fun initialize(
        account: &signer,
        name: vector<u8>,
        symbol: vector<u8>,
        decimals: u8,
        monitor_supply: bool,
    ) {
        let (burn_cap, freeze_cap, mint_cap) = basecoin::initialize<CoinType>(
            account,
            string::utf8(name),
            string::utf8(symbol),
            decimals,
            monitor_supply,
        );

        move_to(account, Capabilities {
            burn_cap,
            freeze_cap,
            mint_cap,
        });
    }

    /// Create new coins `CoinType` and deposit them into dst_addr's account.
    public(friend) fun mint(
        dst_addr: address,
        amount: u64,
    ) acquires Capabilities {
        let account_addr = @DDW;

        assert!(
            exists<Capabilities>(account_addr),
            error::not_found(ENO_CAPABILITIES),
        );

        let capabilities = borrow_global<Capabilities>(account_addr);
        let coins_minted = basecoin::mint<CoinType>(amount, &capabilities.mint_cap);
        basecoin::deposit<CoinType>(dst_addr, coins_minted);
    }

    /// Returns the balance of `owner` for provided `CoinType`.
    public entry fun balance(owner: address): u64 {
        basecoin::balance<CoinType>(owner)
    }

    /// Creating a resource that stores balance of `CoinType` on user's account, withdraw and deposit event handlers.
    /// Required if user wants to start accepting deposits of `CoinType` in his account.
    public(friend) fun register(account: &signer) {
        basecoin::register<CoinType>(account);
    }
}
