// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "forge-std/Test.sol";

import "contracts/NFSCoin.sol";
import "contracts/BNFSCoin.sol";
import "contracts/PolygonBridge.sol";
import "contracts/BaseBridge.sol";


contract TestContract is Test {
    NFSCoin nfsCoin;
    BNFSCoin bnfsCoin;
    PolygonBridge polygonBridge;
    BaseBridge baseBridge;
    address myAddr;

    event Mint(address indexed sender, uint256 amount);
    event Burn(address indexed sender, uint256 amount);


    function setUp() public {
        nfsCoin = new NFSCoin();
        bnfsCoin = new BNFSCoin();
        polygonBridge = new PolygonBridge(address(nfsCoin));
        baseBridge = new BaseBridge(address(bnfsCoin));
        myAddr = 0x94A4abD13582A287ab7454866D1f6ccfd46Ae5c6;

        // //transfer ownership of BNFSCoin to baseBridge
        // bnfsCoin.transferOwnership(address(baseBridge));
        
        //mint coins to my address
        nfsCoin.mint(myAddr, 100);
        
        //approve polygonBridge to spned my coins
        vm.prank(myAddr);
        IERC20(nfsCoin).approve(address(polygonBridge), 10000);
    }

    function testBridging() public {
        assertEq(nfsCoin.balanceOf(myAddr), 100, "ok");
        assertEq(bnfsCoin.balanceOf(myAddr), 0);
        assertEq(bnfsCoin.totalSupply(), 0);

        
        //deposit on polygonBridge
        vm.startPrank(myAddr);
        //test event
        vm.expectEmit(true, false, false, true);
        emit Mint(myAddr, 30);
        polygonBridge.deposit(nfsCoin, 30);
        vm.stopPrank();
        baseBridge.depositedOnOppositeChain(myAddr, 30);

        assertEq(nfsCoin.balanceOf(myAddr), 70);
        assertEq(nfsCoin.balanceOf(address(polygonBridge)), 30);
        assertEq(bnfsCoin.balanceOf(myAddr), 0);
        assertEq(bnfsCoin.totalSupply(), 0);
        assertEq(polygonBridge.getBalance(myAddr), 0);
        assertEq(baseBridge.getBalance(myAddr), 30);


        
        
        //withdraw BNFSCoin from base bridge
        vm.prank(myAddr);
        baseBridge.withdraw(bnfsCoin, 10);

        assertEq(bnfsCoin.balanceOf(myAddr), 10);
        assertEq(bnfsCoin.totalSupply(), 10);
        assertEq(baseBridge.getBalance(myAddr), 20);
        assertEq(polygonBridge.getBalance(myAddr), 0);


        
        
        /////burn BNFSCoin and unlock from polygon bridge
        vm.startPrank(myAddr);
        //test event
        vm.expectEmit(true, false, false, true);
        emit Burn(myAddr, 3);
        baseBridge.burn(bnfsCoin, 3);
        vm.stopPrank();
        polygonBridge.burnedOnOppositeChain(myAddr, 3);
        assertEq(baseBridge.getBalance(myAddr), 20);
        assertEq(polygonBridge.getBalance(myAddr), 3);
        assertEq(bnfsCoin.totalSupply(), 7);


        //withdrawing from polygon bridge
        vm.prank(myAddr);
        polygonBridge.withdraw(nfsCoin, 2);
        assertEq(polygonBridge.getBalance(myAddr), 1);
        assertEq(nfsCoin.balanceOf(myAddr), 72);
        assertEq(nfsCoin.totalSupply(), 100);
           
    }

    
}
