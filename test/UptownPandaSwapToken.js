const UptownPandaMock = artifacts.require('UptownPandaMock');
const UptownPandaSwapToken = artifacts.require('UptownPandaSwapToken');
const { expect } = require('chai');
const { BN, constants, ether } = require('@openzeppelin/test-helpers');
const { shouldThrow } = require('./helpers/utils');

contract('UptownPandaTokenSwap', (accounts) => {
    let uptownPanda;
    let uptownPandaSwapToken;
    const [alice, bob, curtis, dick] = accounts;

    const aliceStartingBalance = ether('10');
    const bobStartingBalance = ether('5');
    const curtisStartingBalance = ether('3');

    beforeEach(async () => {
        uptownPanda = await UptownPandaMock.new();
        uptownPandaSwapToken = await UptownPandaSwapToken.new(uptownPanda.address);
        uptownPanda.mint(alice, aliceStartingBalance);
        uptownPanda.mint(bob, bobStartingBalance);
        uptownPanda.mint(curtis, curtisStartingBalance);
    });

    it('should have correct balances set', async () => {
        const aliceBalance = new BN(await uptownPanda.balanceOf(alice));
        expect(aliceBalance.toString()).to.equal(aliceStartingBalance.toString());
    });

    it('should revert if no balance on account', async () => {
        await shouldThrow(uptownPandaSwapToken.swap({ from: dick }));
    });

    it('should revet if no allowance set', async () => {
        await shouldThrow(uptownPandaSwapToken.swap({ from: curtis }));
    });

    it('should transfer tokens from sender to swap contract and create ERC721 token', async () => {
        await uptownPanda.approve(uptownPandaSwapToken.address, constants.MAX_INT256, { from: alice });
        await uptownPandaSwapToken.swap({ from: alice });
        let balance = new BN(await uptownPanda.balanceOf(uptownPandaSwapToken.address));
        expect(balance.toString()).to.equal(aliceStartingBalance.toString());
        let userBalance = new BN(await uptownPandaSwapToken.checkBalance(alice));
        expect(userBalance.toString()).to.equal(aliceStartingBalance.toString());

        await uptownPanda.approve(uptownPandaSwapToken.address, constants.MAX_INT256, { from: bob });
        await uptownPandaSwapToken.swap({ from: bob });
        balance = new BN(await uptownPanda.balanceOf(uptownPandaSwapToken.address));
        expect(balance.toString()).to.equal(aliceStartingBalance.add(bobStartingBalance).toString());
        userBalance = new BN(await uptownPandaSwapToken.checkBalance(bob));
        expect(userBalance.toString()).to.equal(bobStartingBalance.toString());
    });

    it('should revert on non-owner withdraw', async () => {
        await shouldThrow(uptownPandaSwapToken.withdraw({ from: bob }));
    });

    it('should revert on zero amount withdraw', async () => {
        await shouldThrow(uptownPandaSwapToken.withdraw());
    });

    it('should withdraw tokens to owner account successfully', async () => {
        await uptownPanda.approve(uptownPandaSwapToken.address, constants.MAX_INT256, { from: bob });
        await uptownPandaSwapToken.swap({ from: bob });
        await uptownPandaSwapToken.withdraw();
        const withdrawnBalance = new BN(await uptownPanda.balanceOf(alice)).sub(aliceStartingBalance);
        expect(withdrawnBalance.toString()).to.equal(bobStartingBalance.toString());
    });

    it('should check the correct balance after swap', async () => {
        await uptownPanda.approve(uptownPandaSwapToken.address, constants.MAX_INT256, { from: bob });
        await uptownPandaSwapToken.swap({ from: bob });
        const checkBalance = new BN(await uptownPandaSwapToken.checkBalance(bob));
        expect(checkBalance.toString()).to.equal(bobStartingBalance.toString());
    });

    it('should check the correct balance after swap and burn', async () => {
        await uptownPanda.approve(uptownPandaSwapToken.address, constants.MAX_INT256, { from: bob });
        await uptownPandaSwapToken.swap({ from: bob });
        const bobTokenCount = Number(await uptownPandaSwapToken.balanceOf(bob));
        for(let i = 0; i < bobTokenCount; i++) {
            const bobTokenId = Number(await uptownPandaSwapToken.tokenOfOwnerByIndex(bob, new BN(i)));
            await uptownPandaSwapToken.burn(new BN(bobTokenId), { from: bob });
        }
        const checkBalance = new BN(await uptownPandaSwapToken.checkBalance(bob));
        expect(checkBalance.isZero()).to.be.true;
    });
});
