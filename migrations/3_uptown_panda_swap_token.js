const UptownPandaSwapToken = artifacts.require('UptownPandaSwapToken');
const UptownPandaMock = artifacts.require('UptownPandaMock');

module.exports = async (deployer, network) => {
    const uptownPandaAddress =
        network === 'mainnet'
            ? '0xE492FE6bb7Ce8E22F215DCa68773f38B2A82b711'
            : (await UptownPandaMock.deployed()).address;
    await deployer.deploy(UptownPandaSwapToken, uptownPandaAddress);
    const uptownPandaSwapTokenAddress = (await UptownPandaSwapToken.deployed()).address;

    console.log(`UptownPanda token contract address: ${uptownPandaAddress}`);
    console.log(`UptownPanda swap token contract address: ${uptownPandaSwapTokenAddress}`);
};
