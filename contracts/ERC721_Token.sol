// // SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";

contract ERC721Token is ERC721PresetMinterPauserAutoId {
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _baseUri
    ) ERC721PresetMinterPauserAutoId(_name, _symbol, _baseUri) {}
}
