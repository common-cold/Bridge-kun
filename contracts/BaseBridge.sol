// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IBNFSCoin} from "contracts/IBNFSCoin.sol"; 
import {BNFSCoin} from "contracts/BNFSCoin.sol";


contract BaseBridge is Ownable{
    address private tokenAddress; 
    mapping(address => uint256) private balanceMapping;

    event Burn(address indexed sender, uint256 amount);

    constructor(address _tokenAddress) Ownable(msg.sender){
        tokenAddress = _tokenAddress;
    }

    function burn(IBNFSCoin _tokenAddress, uint256 _amount) public {
        require(_tokenAddress == IBNFSCoin(tokenAddress), "This contract only supports BNFSCoin deposits");
        _tokenAddress.burn(msg.sender, _amount);
        emit Burn(msg.sender, _amount); 
    }

    function withdraw(IBNFSCoin _tokenAddress, uint256 _amount) public {
        require(balanceMapping[msg.sender] >= _amount, "You don't have enough money to withdraw");
        _tokenAddress.mint(msg.sender, _amount);
        balanceMapping[msg.sender] -= _amount;
    }

    function depositedOnOppositeChain(address ownerAddress, uint256 _amount) public onlyOwner{
        balanceMapping[ownerAddress] += _amount;
    }

    function getBalance(address owneraddress) public view returns (uint256){
        return balanceMapping[owneraddress];
    }


}