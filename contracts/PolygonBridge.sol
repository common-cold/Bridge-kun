// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract PolygonBridge is Ownable{
    address private tokenAddress; 
    mapping(address => uint256) private balanceMapping;

    //mint event for polygon-base bridging
    event Mint(address indexed sender, uint256 amount);

    //mint event between polygon-solana bridging
    event MintToSolana(address indexed sender, bytes32 solanaAddress, uint256 amount);

    constructor(address _tokenAddress) Ownable(msg.sender){
        tokenAddress = _tokenAddress;
    }

    //deposit fn for polygon-base bridging
    function deposit(IERC20 _tokenAddress, uint256 _amount) public {
        require(_tokenAddress == IERC20(tokenAddress), "This contract only supports NFSCoin bridging");
        require(_tokenAddress.allowance(msg.sender, address(this)) >= _amount, "You don't have enough amount approved");
        require(_tokenAddress.transferFrom(msg.sender, address(this), _amount));
        emit Mint(msg.sender, _amount);
    }

    //deposit fn for polygon-solana bridging 
    function depositSolana(IERC20 _tokenAddress, bytes32 _solanaAddress, uint256 _amount) public {
        require(_tokenAddress == IERC20(tokenAddress), "This contract only supports NFSCoin bridging");
        require(_tokenAddress.allowance(msg.sender, address(this)) >= _amount, "You don't have enough amount approved");
        require(_tokenAddress.transferFrom(msg.sender, address(this), _amount));
        emit MintToSolana(msg.sender, _solanaAddress, _amount);
    }

    function withdraw(IERC20 _tokenAddress, address _receiver, uint256 _amount) public onlyOwner {
        require(balanceMapping[_receiver] >= _amount, "You don't have enough money to withdraw");
        require(_tokenAddress.transfer(_receiver, _amount));
        balanceMapping[_receiver] -= _amount;
    }

    function burnedOnOppositeChain(address ownerAddress, uint256 _amount) public onlyOwner {
        balanceMapping[ownerAddress] += _amount;
    }
    
    function getBalance(address owneraddress) public view returns (uint256){
        return balanceMapping[owneraddress];
    }

}