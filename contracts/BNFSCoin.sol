// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IBNFSCoin} from "contracts/IBNFSCoin.sol"; 

contract BNFSCoin is IBNFSCoin, ERC20{
    constructor() ERC20("BNFSCOIN", "BNFS") {}

    function mint(address _to, uint256 _amount) public {
        _mint(_to, _amount);
    }

    function burn(address _from, uint256 _amount) public {
        _burn(_from, _amount);
    }

}