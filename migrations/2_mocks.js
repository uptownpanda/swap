const UptownPandaMock = artifacts.require('UptownPandaMock');

module.exports = async (deployer, network) => {
    if (network === 'mainnet') {
        return;
    }
    await deployer.deploy(UptownPandaMock);
};
