const UptownPandaSwapTokenMock = artifacts.require('UptownPandaSwapTokenMock');
const UptownPandaSwap = artifacts.require('UptownPandaSwap');
const { expect } = require('chai');
const { BN, constants, ether } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const { shouldThrow } = require('./helpers/utils');

contract('UptownPandaSwap', (accounts) => {
    let uptownPandaSwapToken;
    let uptownPandaSwap;
    const [alice, bob, curtis, dick] = accounts;

    beforeEach(async () => {
        uptownPandaSwapToken = await UptownPandaSwapTokenMock.new();
        uptownPandaSwap = await UptownPandaSwap.new(uptownPandaSwapToken.address);
    });

    it('should receive eth only from owner', async () => {
        await shouldThrow(uptownPandaSwap.send(new BN('100000'), { from: bob }));
        await uptownPandaSwap.send(new BN('10000'), { from: alice });
    });

    it('should receive eth only from owner once', async () => {
        await uptownPandaSwap.send(new BN('10000'), { from: alice });
        await shouldThrow(uptownPandaSwap.send(new BN('10000'), { from: alice }));
    });

    it('should set the correct total eth supply', async () => {
        const ethAmount = '10000';
        await uptownPandaSwap.send(new BN(ethAmount), { from: alice });
        const contractBalance = await web3.eth.getBalance(uptownPandaSwap.address);
        expect(contractBalance).to.equal(ethAmount);
        const contractEthSupply = await uptownPandaSwap.totalEthSupply();
        expect(contractEthSupply.toString()).to.equal(ethAmount);
    });

    it('should set the corrent total ups supply', async () => {
        await uptownPandaSwapToken.generateSwapToken(alice, new BN('100'));
        await uptownPandaSwapToken.generateSwapToken(bob, new BN('200'));
        await uptownPandaSwapToken.generateSwapToken(curtis, new BN('300'));
        await uptownPandaSwapToken.generateSwapToken(dick, new BN('400'));
        await uptownPandaSwap.send(new BN('1000000000000000000'), { from: alice });
        const contractUpsSupply = await uptownPandaSwap.totalUpsSupply();
        expect(contractUpsSupply.toString()).to.equal('1000');
    });

    it('should allow only owner to withdraw eth for safety measures', async () => {
        await uptownPandaSwap.send(new BN('1000000'), { from: alice });
        let contractBalance = await web3.eth.getBalance(uptownPandaSwap.address);
        expect(contractBalance).to.equal('1000000');
        await shouldThrow(uptownPandaSwap.withdraw({ from: bob }));
        contractBalance = await web3.eth.getBalance(uptownPandaSwap.address);
        expect(contractBalance).to.equal('1000000');
        await uptownPandaSwap.withdraw();
        contractBalance = await web3.eth.getBalance(uptownPandaSwap.address);
        expect(contractBalance).to.equal('0');
    });

    it('should swap and burn tokens accordingly only if tokens were preapproved', async () => {
        await uptownPandaSwapToken.generateSwapToken(bob, new BN('200'));
        await uptownPandaSwapToken.generateSwapToken(bob, new BN('200'));
        await uptownPandaSwapToken.generateSwapToken(bob, new BN('200'));
        await uptownPandaSwapToken.generateSwapToken(curtis, new BN('300'));
        await uptownPandaSwapToken.generateSwapToken(curtis, new BN('300'));
        await uptownPandaSwapToken.generateSwapToken(dick, new BN('400'));

        let totalTokens = await uptownPandaSwapToken.totalSupply();
        expect(totalTokens.toString()).to.equal('6');

        await uptownPandaSwap.send(new BN('800'));

        await shouldThrow(uptownPandaSwap.swap({ from: bob }));
        await uptownPandaSwapToken.setApprovalForAll(uptownPandaSwap.address, true, { from: bob });
        await uptownPandaSwap.swap({ from: bob });
        let contractBalance = await web3.eth.getBalance(uptownPandaSwap.address);
        expect(contractBalance).to.equal('500');
        totalTokens = await uptownPandaSwapToken.totalSupply();
        expect(totalTokens.toString()).to.equal('3');

        await uptownPandaSwapToken.setApprovalForAll(uptownPandaSwap.address, true, { from: curtis });
        await uptownPandaSwap.swap({ from: curtis });
        contractBalance = await web3.eth.getBalance(uptownPandaSwap.address);
        expect(contractBalance).to.equal('200');
        totalTokens = await uptownPandaSwapToken.totalSupply();
        expect(totalTokens.toString()).to.equal('1');

        await uptownPandaSwapToken.setApprovalForAll(uptownPandaSwap.address, true, { from: dick });
        await uptownPandaSwap.swap({ from: dick });
        contractBalance = await web3.eth.getBalance(uptownPandaSwap.address);
        expect(contractBalance).to.equal('0');
        totalTokens = await uptownPandaSwapToken.totalSupply();
        expect(totalTokens.toString()).to.equal('0');
    });
});
