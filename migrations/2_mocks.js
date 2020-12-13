const UptownPandaMock = artifacts.require('UptownPandaMock');
const UptownPandaSwapTokenMock = artifacts.require('UptownPandaSwapTokenMock');

module.exports = async (deployer, network) => {
    if (network === 'mainnet') {
        return;
    }
    await deployer.deploy(UptownPandaMock);
    await deployer.deploy(UptownPandaSwapTokenMock);
};
