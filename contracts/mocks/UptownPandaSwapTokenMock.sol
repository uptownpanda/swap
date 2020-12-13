// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "../UptownPandaSwapToken.sol";

contract UptownPandaSwapTokenMock is UptownPandaSwapToken {
    constructor() public UptownPandaSwapToken(0x0000000000000000000000000000000000000000) {}

    function generateSwapToken(address _addr, uint256 _amount) external {
        uint256 tokenId = swapTokens.length;
        swapTokens.push(SwapToken(_amount));
        _safeMint(_addr, tokenId);
    }
}
