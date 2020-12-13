const UptownPandaSwap = artifacts.require('UptownPandaSwap');
const UptownPandaSwapTokenMock = artifacts.require('UptownPandaSwapTokenMock');

module.exports = async (deployer, network) => {
    const uptownPandaSwapTokenAddress =
        network === 'mainnet'
            ? '0xa2CadF11076fA2a33Ec8e599672B2a17A4A2023e'
            : (await UptownPandaSwapTokenMock.deployed()).address;
    await deployer.deploy(UptownPandaSwap, uptownPandaSwapTokenAddress);
    const uptownPandaSwapAddress = (await UptownPandaSwap.deployed()).address;

    console.log(`UptownPanda swap token contract address: ${uptownPandaSwapTokenAddress}`);
    console.log(`UptownPanda swap contract address: ${uptownPandaSwapAddress}`);
};
