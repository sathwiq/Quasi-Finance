const NFTMarket = artifacts.require("NFTMarket");
const fs  = require('fs');
const NFT = artifacts.require("NFT");
const QuasiFI = artifacts.require("QuasiFI");
const QNFT = artifacts.require("QNFT");


module.exports = async (deployer)=>{
    await deployer.deploy(NFTMarket);
    await deployer.deploy(NFT, NFTMarket.address);
    await deployer.deploy(QuasiFI);
    await deployer.deploy(QNFT,QuasiFI.address);


    let s = {
        marketAddress: NFTMarket.address,
        nftAddress: NFT.address,
        quasiFIAddress: QuasiFI.address,
        quasiNFTAddress: QNFT.address
    }
    fs.writeFileSync('address.json',JSON.stringify(s), 'utf-8');
}