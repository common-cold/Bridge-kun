// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

interface IBNFSCoin {
    function mint(address _to, uint256 _amount) external;
    function burn(address _from, uint256 _amount) external;
}   