// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract PolygonBridge is Ownable{
    address private tokenAddress; 
    mapping(address => uint256) private balanceMapping;

    event Mint(address indexed sender, uint256 amount);

    constructor(address _tokenAddress) Ownable(msg.sender){
        tokenAddress = _tokenAddress;
    }

    function deposit(IERC20 _tokenAddress, uint256 _amount) public {
        require(_tokenAddress == IERC20(tokenAddress), "This contract only supports NFSCoin bridging");
        require(_tokenAddress.allowance(msg.sender, address(this)) >= _amount, "You don't have enough amount approved");
        require(_tokenAddress.transferFrom(msg.sender, address(this), _amount));
        emit Mint(msg.sender, _amount);
    }

    function withdraw(IERC20 _tokenAddress, uint256 _amount) public {
        require(balanceMapping[msg.sender] >= _amount, "You don't have enough money to withdraw");
        require(_tokenAddress.transfer(msg.sender, _amount));
        balanceMapping[msg.sender] -= _amount;
    }

    function burnedOnOppositeChain(address ownerAddress, uint256 _amount) public onlyOwner {
        balanceMapping[ownerAddress] += _amount;
    }
    
    function getBalance(address owneraddress) public view returns (uint256){
        return balanceMapping[owneraddress];
    }

}