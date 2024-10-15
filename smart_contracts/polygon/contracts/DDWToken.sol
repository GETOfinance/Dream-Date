// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DDWToken is ERC20, ERC20Burnable, Ownable {
    address private operator;
    constructor() ERC20("DDW Token", "DDW") {}

     modifier onlyOwnerOrOperator() {
        require(owner() == msg.sender || operator == msg.sender, "Only Owner or Operator allowed");
        _;
    }

    function mint(address to, uint256 amount) external onlyOwnerOrOperator {
        _mint(to, amount);
    }

    function setOperator(address _operator) external onlyOwner {
        operator = _operator;
    }

}
