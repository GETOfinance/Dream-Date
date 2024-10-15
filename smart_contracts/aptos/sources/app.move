module DDW::DDWApp {
    use std::error;
    use std::signer;
    use std::string;
    use std::vector;
    use aptos_std::event::{Self, EventHandle};
    use aptos_framework::account;
    use aptos_framework::timestamp;

//:!:>resource
    struct UserInfo has key {
        ipfsCid: string::String,
    }

    struct LikesInfo has key {
        likedListOnChain: vector<address>,
        likedListOffChain: vector<string::String>,
        superLikedListOnChain: vector<address>,
        superLikedListOffChain: vector<string::String>,
        matchedListOnChain: vector<address>,
        matchedTimestampListOnChain: vector<u64>,
        matchedListOffChain: vector<string::String>,
        matchedTimestampListOffChain: vector<u64>,
    }

    struct LastMatchEvent has key {
        match_event: EventHandle<MatchEvent>,
    }

    struct LastPrivateSpaceCreateEvent has key {
        private_space_creation_event: EventHandle<PrivateSpaceCreationEvent>
    }
//<:!:resource

    struct MatchEvent has drop, store {
        matched_with_on_chain: address,
        matched_with_off_chain: string::String,
    }

    struct PrivateSpaceCreationEvent has drop, store {
        private_space_with_on_chain: address,
        private_space_with_off_chain: string::String,
        time_duration_mins: u64,
    }

    //rate constants
    const APPROVAL_TO_COIN_XR_RATE: u64 = 1000000000;
    const COINS_PER_MINUTE_OF_PRIVATE_SPACE: u64 = 6000000000;

    // Error Codes
    const EACCOUNT_ALREADY_REGISTERED: u64 = 0;
    const EACCOUNT_NOT_REGISTERED: u64 = 1;
    const ENO_USER_INFO: u64 = 2;
    const ENO_LIKES_INFO: u64 = 3;
    const ELIKED_ALREADY: u64 = 4;
    const ESUPER_LIKED_ALREADY: u64 = 5;
    const ENOT_OWNER: u64 = 6;
    const ESELF_LIKE: u64 = 7;
    const ENOT_MATCHED: u64 = 8;
    const ESAME_ADDRESS: u64 = 9;
    const EZERO_AMOUNT: u64 = 10;
    const ESENDER_NOT_REGISTERED: u64 = 11;

    public entry fun is_account_registered(account_addr: address): bool {
        exists<UserInfo>(account_addr)
    }

    public entry fun register(account: &signer, ipfs_cid: string::String) {
        let account_addr = signer::address_of(account);
        assert!(
            !is_account_registered(account_addr),
            error::already_exists(EACCOUNT_ALREADY_REGISTERED),
        );

        DDW::DDWcoin::register(account);
        DDW::DDWapproval::register(account);
        let user_info = UserInfo {
            ipfsCid: ipfs_cid
        };
        move_to(account, user_info);
        DDW::DDWcoin::mint(account_addr, 30000000000);
    }

    public entry fun ddw_coin_mint(account: &signer, amount: u64) {
        assert!(amount > 0, error::invalid_argument(EZERO_AMOUNT));
        let account_addr = signer::address_of(account);
        assert!(account_addr == @DDW, error::permission_denied(ENOT_OWNER));
        assert!(
            is_account_registered(account_addr),
            error::not_found(EACCOUNT_NOT_REGISTERED),
        );
        DDW::DDWcoin::mint(account_addr, amount);
    }

    public entry fun get_user_details(addr: address): string::String acquires UserInfo {
        assert!(
            is_account_registered(addr),
            error::not_found(EACCOUNT_NOT_REGISTERED),
        );
        *&borrow_global<UserInfo>(addr).ipfsCid
    }

    // Returns if Matched or not
    public entry fun like_on_chain(account: &signer, to: address) acquires LikesInfo, LastMatchEvent {
        let account_addr = signer::address_of(account);
        assert!(
            is_account_registered(account_addr),
            error::not_found(EACCOUNT_NOT_REGISTERED),
        );
         assert!(
            is_account_registered(to),
            error::not_found(ESENDER_NOT_REGISTERED),
        );
        assert!(account_addr!=to, error::invalid_argument(ESELF_LIKE));
        if(exists<LikesInfo>(account_addr)) {
            let likes_account = *&borrow_global<LikesInfo>(account_addr).likedListOnChain;
            assert!(!vector::contains(&likes_account, &to),  error::already_exists(ELIKED_ALREADY));
            let super_likes_account = *&borrow_global<LikesInfo>(account_addr).superLikedListOnChain;
            assert!(!vector::contains(&super_likes_account, &to),  error::already_exists(ESUPER_LIKED_ALREADY));
            let likes_info = borrow_global_mut<LikesInfo>(account_addr);
            vector::push_back(&mut likes_info.likedListOnChain, to);
        }
        else {
            let likes_info = LikesInfo {
                likedListOnChain: vector::singleton<address>(to),
                likedListOffChain: vector::empty<string::String>(),
                superLikedListOnChain: vector::empty<address>(),
                superLikedListOffChain: vector::empty<string::String>(),
                matchedListOnChain: vector::empty<address>(),
                matchedTimestampListOnChain: vector::empty<u64>(),
                matchedListOffChain: vector::empty<string::String>(),
                matchedTimestampListOffChain: vector::empty<u64>(),
            };
            move_to(account, likes_info);
        };
        DDW::DDWapproval::mint(to, 1);
        if(exists<LikesInfo>(to)) {
            let likes = *&borrow_global<LikesInfo>(to).likedListOnChain;
            let super_likes = *&borrow_global<LikesInfo>(to).superLikedListOnChain;
            let is_liked = vector::contains(&likes, &account_addr);
            let is_super_liked = vector::contains(&super_likes, &account_addr);
            if(is_liked || is_super_liked) {
                let likes_info = borrow_global_mut<LikesInfo>(to);
                vector::push_back(&mut likes_info.matchedListOnChain, account_addr);
                vector::push_back(&mut likes_info.matchedTimestampListOnChain, timestamp::now_seconds());
                let matched_likes_info = borrow_global_mut<LikesInfo>(account_addr);
                vector::push_back(&mut matched_likes_info.matchedListOnChain, to);
                vector::push_back(&mut matched_likes_info.matchedTimestampListOnChain, timestamp::now_seconds());
                if(exists<LastMatchEvent>(account_addr)) {
                    let last_match_event = borrow_global_mut<LastMatchEvent>(account_addr);
                    event::emit_event(&mut last_match_event.match_event, MatchEvent {
                        matched_with_on_chain: to,
                        matched_with_off_chain: string::utf8(b""),
                    });
                }
                else {
                    move_to(account, LastMatchEvent {
                        match_event: account::new_event_handle<MatchEvent>(account),
                    });
                };
            };
        };
    }

    // Returns if Matched or not
    public entry fun super_like_on_chain(account: &signer, to: address) acquires LikesInfo, LastMatchEvent {
        let account_addr = signer::address_of(account);
        assert!(
            is_account_registered(account_addr),
            error::not_found(EACCOUNT_NOT_REGISTERED),
        );
        assert!(
            is_account_registered(to),
            error::not_found(ESENDER_NOT_REGISTERED),
        );
        assert!(account_addr!=to, error::invalid_argument(ESELF_LIKE));
        if(exists<LikesInfo>(account_addr)) {
            let super_likes_account = *&borrow_global<LikesInfo>(account_addr).superLikedListOnChain;
            assert!(!vector::contains(&super_likes_account, &to),  error::already_exists(ESUPER_LIKED_ALREADY));
            let likes_account = *&borrow_global<LikesInfo>(account_addr).likedListOnChain;
            assert!(!vector::contains(&likes_account, &to),  error::already_exists(ELIKED_ALREADY));
            let likes_info = borrow_global_mut<LikesInfo>(account_addr);
            vector::push_back(&mut likes_info.superLikedListOnChain, to);
        }
        else {
            let likes_info = LikesInfo {
                likedListOnChain: vector::empty<address>(),
                likedListOffChain: vector::empty<string::String>(),
                superLikedListOnChain: vector::singleton<address>(to),
                superLikedListOffChain: vector::empty<string::String>(),
                matchedListOnChain: vector::empty<address>(),
                matchedTimestampListOnChain: vector::empty<u64>(),
                matchedListOffChain: vector::empty<string::String>(),
                matchedTimestampListOffChain: vector::empty<u64>(),
            };
            move_to(account, likes_info);
        };
        DDW::DDWapproval::mint(to, 3);
        if(exists<LikesInfo>(to)) {
            let likes = *&borrow_global<LikesInfo>(to).likedListOnChain;
            let super_likes = *&borrow_global<LikesInfo>(to).superLikedListOnChain;
            let is_liked = vector::contains(&likes, &account_addr);
            let is_super_liked = vector::contains(&super_likes, &account_addr);
            if(is_liked || is_super_liked) {
                let likes_info = borrow_global_mut<LikesInfo>(to);
                vector::push_back(&mut likes_info.matchedListOnChain, account_addr);
                vector::push_back(&mut likes_info.matchedTimestampListOnChain, timestamp::now_seconds());
                let matched_likes_info = borrow_global_mut<LikesInfo>(account_addr);
                vector::push_back(&mut matched_likes_info.matchedListOnChain, to);
                vector::push_back(&mut matched_likes_info.matchedTimestampListOnChain, timestamp::now_seconds());
                if(exists<LastMatchEvent>(account_addr)) {
                    let last_match_event = borrow_global_mut<LastMatchEvent>(account_addr);
                    event::emit_event(&mut last_match_event.match_event, MatchEvent {
                        matched_with_on_chain: to,
                        matched_with_off_chain: string::utf8(b""),
                    });
                }
                else {
                    move_to(account, LastMatchEvent {
                        match_event: account::new_event_handle<MatchEvent>(account),
                    });
                };
            };
        };
    }

    public entry fun transfer_ddw_coin_on_chain(
        from: &signer,
        to: address,
        amount: u64,
    ) {
        assert!(
            is_account_registered(signer::address_of(from)),
            error::not_found(EACCOUNT_NOT_REGISTERED),
        );
        assert!(
            is_account_registered(to),
            error::not_found(ESENDER_NOT_REGISTERED),
        );
        assert!(signer::address_of(from)!=to, error::invalid_argument(ESAME_ADDRESS));
        assert!(amount > 0, error::invalid_argument(EZERO_AMOUNT));
        DDW::DDWcoin::transfer(from, to, amount);
    }

    public entry fun exchange_approval_and_claim_coin(
        account: &signer,
        amount_of_approval: u64,
    ) {
        assert!(amount_of_approval > 0, error::invalid_argument(EZERO_AMOUNT));
        assert!(
            is_account_registered(signer::address_of(account)),
            error::not_found(EACCOUNT_NOT_REGISTERED),
        );
        DDW::DDWapproval::burn(account, amount_of_approval);
        DDW::DDWcoin::mint(signer::address_of(account), APPROVAL_TO_COIN_XR_RATE*amount_of_approval);
    }

    public entry fun create_private_space_on_chain(
        account: &signer,
        with: address,
        time_duration_in_minutes: u64,
    ) acquires LastPrivateSpaceCreateEvent, LikesInfo {
        assert!(
            is_account_registered(signer::address_of(account)),
            error::not_found(EACCOUNT_NOT_REGISTERED),
        );
        assert!(
            is_account_registered(with),
            error::not_found(ESENDER_NOT_REGISTERED),
        );
        assert!(exists<LikesInfo>(signer::address_of(account)), error::not_found(ENO_LIKES_INFO));
        assert!(time_duration_in_minutes > 0, error::invalid_argument(EZERO_AMOUNT));
        let account_addr = signer::address_of(account);
        let matched_list = *&borrow_global<LikesInfo>(account_addr).matchedListOnChain;
        assert!(vector::contains(&matched_list, &with), error::invalid_argument(ENOT_MATCHED));
        DDW::DDWcoin::transfer(account, @DDW, COINS_PER_MINUTE_OF_PRIVATE_SPACE*time_duration_in_minutes);
        if(exists<LastPrivateSpaceCreateEvent>(account_addr)) {
                    let last_private_space_create_event = borrow_global_mut<LastPrivateSpaceCreateEvent>(account_addr);
                    event::emit_event(&mut last_private_space_create_event.private_space_creation_event, PrivateSpaceCreationEvent {
                        private_space_with_on_chain: with,
                        private_space_with_off_chain: string::utf8(b""),
                        time_duration_mins: time_duration_in_minutes,
                    });
                }
                else {
                    move_to(account, LastPrivateSpaceCreateEvent {
                        private_space_creation_event: account::new_event_handle<PrivateSpaceCreationEvent>(account),
                    });
                };
    }

    public entry fun get_matches(account: &signer): (vector<address>, vector<u64>, vector<string::String>, vector<u64>)acquires LikesInfo {
        assert!(
            is_account_registered(signer::address_of(account)),
            error::not_found(EACCOUNT_NOT_REGISTERED),
        );
        assert!(exists<LikesInfo>(signer::address_of(account)), error::not_found(ENO_LIKES_INFO));
        let likes_info = borrow_global<LikesInfo>(signer::address_of(account));
        (*&likes_info.matchedListOnChain, *&likes_info.matchedTimestampListOnChain, *&likes_info.matchedListOffChain, *&likes_info.matchedTimestampListOffChain)
    }
}
