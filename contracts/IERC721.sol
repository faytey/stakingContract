// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

interface IERC721 {
    function balanceOf(address owner) external view returns (uint256 balance);
}