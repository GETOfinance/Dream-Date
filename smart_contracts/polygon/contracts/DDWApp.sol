// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4 <0.9.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./DDWToken.sol";
import "./ApprovalToken.sol";
import "./chainlink.sol";

contract DDWApp {

using SafeERC20 for IERC20;

struct UserInfo {
    string ipfsCid;
}

struct LikesInfo {
    address[] likedListOnChain;
    string[] likedListOffChain;
    address[] superLikedListOnChain;
    string[] superLikedListOffChain;
    address[] matchedListOnChain;
    uint256[] matchedTimestampListOnChain;
    string[] matchedListOffChain;
    uint256[] matchedTimestampListOffChain;
}

event NewUserRegistered(address indexed _user);
event MatchEvent(address indexed _user, address indexed _matched_with_on_chain, string _matched_with_off_chain);
event PrivateSpaceCreated(address indexed _user, address indexed _matched_with_on_chain, string _matched_with_off_chain, uint256 indexed _duration);

modifier notPaused {
      require(contractPaused == false, "Contract is Paused");
      _;
   }

modifier onlyOwner {
      require(msg.sender == owner, "Only Owner");
      _;
    }

address public owner;
bool public contractPaused;
address public DDW_CONTRACT_ADDRESS;
address public APP_CONTRACT_ADDRESS;
address public CHAINLINK_CONTRACT_ADDRESS;

uint256 public constant COINS_PER_MINUTE_OF_PRIVATE_SPACE = 60e18;

constructor(address ddw_contract, address app_contract, address chainlink_contract) {
    owner = msg.sender;
    contractPaused = false;
    DDW_CONTRACT_ADDRESS = ddw_contract;
    APP_CONTRACT_ADDRESS = app_contract;
    CHAINLINK_CONTRACT_ADDRESS = chainlink_contract;
}

mapping(address => UserInfo) private userIDtoUserInfo;

mapping(address => LikesInfo) private userIDtoLikesInfo;

    function is_account_registered(address _user) external view returns(bool) {
        if(StringCompare(userIDtoUserInfo[_user].ipfsCid, ""))
        return false;
        return true;
    }

    function register(string memory _ipfs_cid) external notPaused {
        require(StringCompare(userIDtoUserInfo[msg.sender].ipfsCid, ""), "User Already Registered");
        userIDtoUserInfo[msg.sender].ipfsCid = _ipfs_cid;
        DDWToken(DDW_CONTRACT_ADDRESS).mint(msg.sender, 300e18);
        emit NewUserRegistered(msg.sender);
    }

    function get_user_details(address _user) external view returns(string memory) {
        return userIDtoUserInfo[_user].ipfsCid;
    }

    function like_on_chain(address to) external notPaused {
        require(!StringCompare(userIDtoUserInfo[msg.sender].ipfsCid, ""), "You are not Registered");
        require(!StringCompare(userIDtoUserInfo[to].ipfsCid, ""), "They are not Registered");
        require(msg.sender!=to, "Cannot Like Yourself");
        require(!arrayContainsAddress(userIDtoLikesInfo[msg.sender].likedListOnChain, to), "Already Liked this person");
        require(!arrayContainsAddress(userIDtoLikesInfo[msg.sender].superLikedListOnChain, to), "Already Super Liked this person");
        userIDtoLikesInfo[msg.sender].likedListOnChain.push(to);
        ApprovalToken(APP_CONTRACT_ADDRESS).mint(to, 1e18);
        bool is_liked = arrayContainsAddress(userIDtoLikesInfo[to].likedListOnChain, msg.sender);
        bool is_super_liked = arrayContainsAddress(userIDtoLikesInfo[to].superLikedListOnChain, msg.sender);
        if(is_liked || is_super_liked) {
            uint256 match_time = block.timestamp;
            userIDtoLikesInfo[msg.sender].matchedListOnChain.push(to);
            userIDtoLikesInfo[to].matchedListOnChain.push(msg.sender);
            userIDtoLikesInfo[msg.sender].matchedTimestampListOnChain.push(match_time);
            userIDtoLikesInfo[to].matchedTimestampListOnChain.push(match_time);
            emit MatchEvent(msg.sender, to, "");
        }

    }

    function super_like_on_chain(address to) external notPaused {
        require(!StringCompare(userIDtoUserInfo[msg.sender].ipfsCid, ""), "You are not Registered");
        require(!StringCompare(userIDtoUserInfo[to].ipfsCid, ""), "They are not Registered");
        require(msg.sender!=to, "Cannot Like Yourself");
        require(!arrayContainsAddress(userIDtoLikesInfo[msg.sender].likedListOnChain, to), "Already Liked this person");
        require(!arrayContainsAddress(userIDtoLikesInfo[msg.sender].superLikedListOnChain, to), "Already Super Liked this person");
        userIDtoLikesInfo[msg.sender].superLikedListOnChain.push(to);
        ApprovalToken(APP_CONTRACT_ADDRESS).mint(to, 3e18);
        bool is_liked = arrayContainsAddress(userIDtoLikesInfo[to].likedListOnChain, msg.sender);
        bool is_super_liked = arrayContainsAddress(userIDtoLikesInfo[to].superLikedListOnChain, msg.sender);
        if(is_liked || is_super_liked) {
            uint256 match_time = block.timestamp;
            userIDtoLikesInfo[msg.sender].matchedListOnChain.push(to);
            userIDtoLikesInfo[to].matchedListOnChain.push(msg.sender);
            userIDtoLikesInfo[msg.sender].matchedTimestampListOnChain.push(match_time);
            userIDtoLikesInfo[to].matchedTimestampListOnChain.push(match_time);
            emit MatchEvent(msg.sender, to, "");
        }
    }

    function exchange_approval_and_claim_coin(uint256 amount) external notPaused {
        require(amount>0,"Amount cannot be zero");
        ApprovalToken(APP_CONTRACT_ADDRESS).burn(msg.sender, amount);
        DDWToken(DDW_CONTRACT_ADDRESS).mint(msg.sender, APIConsumer(CHAINLINK_CONTRACT_ADDRESS).APPROVAL_TO_COIN_XR_RATE()*amount);
    }

    function create_private_space_on_chain(address with, uint256 duration_in_minutes) external notPaused {
        require(!StringCompare(userIDtoUserInfo[msg.sender].ipfsCid, ""), "You are not Registered");
        require(!StringCompare(userIDtoUserInfo[with].ipfsCid, ""), "They are not Registered");
        require(duration_in_minutes>0,"Duration cannot be zero");
        require(arrayContainsAddress(userIDtoLikesInfo[msg.sender].matchedListOnChain, with), "Not matched with this person");
        IERC20(DDW_CONTRACT_ADDRESS).safeTransferFrom(msg.sender, address(this), COINS_PER_MINUTE_OF_PRIVATE_SPACE*duration_in_minutes);

        emit PrivateSpaceCreated(msg.sender, with, "", duration_in_minutes);

    }

    function get_matches() external view returns(address[] memory, uint256[] memory, string[] memory, uint256[] memory) {
        return (userIDtoLikesInfo[msg.sender].matchedListOnChain, userIDtoLikesInfo[msg.sender].matchedTimestampListOnChain, userIDtoLikesInfo[msg.sender].matchedListOffChain, userIDtoLikesInfo[msg.sender].matchedTimestampListOffChain);
    }

    function StringCompare(string memory a, string memory b) internal pure returns(bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }

    function withdrawFunds() external onlyOwner {
        uint256 amount = IERC20(DDW_CONTRACT_ADDRESS).balanceOf(address(this));
        IERC20(DDW_CONTRACT_ADDRESS).safeTransfer(msg.sender, amount);
    }

    function togglePause() external onlyOwner {
        contractPaused = !contractPaused;
    }

    function arrayContainsAddress(address[] memory _list, address _value) internal pure returns(bool) {
        for (uint256 i = 0; i < _list.length; i++) {
            if (_list[i] == _value) {
                return true;
            }
        }
        return false;
    }

}
