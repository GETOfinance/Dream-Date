// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ApprovalToken is ERC20, Ownable {
    address private operator;
    constructor() ERC20("Approval Token", "APP") {}

     modifier onlyOwnerOrOperator() {
        require(owner() == msg.sender || operator == msg.sender, "Only Owner or Operator allowed");
        _;
    }

    function mint(address to, uint256 amount) external onlyOwnerOrOperator {
        _mint(to, amount);
    }

   function burn(address user, uint256 amount) external onlyOwnerOrOperator {
        _burn(user, amount);
    }

    function transfer(address to, uint256 amount) public override onlyOwnerOrOperator returns (bool) {
        return super.transfer(to, amount);
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override onlyOwnerOrOperator returns (bool) {
        return super.transferFrom(from, to, amount);
    }

    function setOperator(address _operator) external onlyOwner {
        operator = _operator;
    }

}
