// // SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    uint8 private _decimals;

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        uint8 decimals_
    ) ERC20(_name, _symbol) {
        _mint(msg.sender, _totalSupply);
        _decimals = decimals_;
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
}
