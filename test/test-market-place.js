const BN = require("bn.js");
const assert = require("assert");
const ethers = require("ethers");

const NFT = artifacts.require("NFT");
const NFTMarket = artifacts.require("NFTMarket");
const QuasiFI = artifacts.require("QuasiFI");

const {nftAddress,marketAddress, quasiFIAddress} = require("../address.json");

contract("NFTMarket",(accounts)=>{
    let market;
    let nft;
    let quasiFi;

    beforeEach(async () => {
        market = await NFTMarket.at(marketAddress);
        nft = await NFT.at(nftAddress);
        quasiFi = await QuasiFI.at(quasiFIAddress);
    });

    it("should create and execute market sales", async () => {

        let id = await nft.createToken("some string",{from: accounts[2]});
        let id2 = await nft.createToken("some string2",{from: accounts[2]});

        console.log("========================");
        console.log("Token 1 id is ",id);
        console.log("Token 2 id is ",id2);
    });

    it('should create items', async () =>{
        let listingPrice = await market.getListingPrice();
        listingPrice = listingPrice.toString();
        const auctionPrice = ethers.utils.parseUnits('100','ether');

        await market.createMarketItem(nftAddress,1, auctionPrice, {from: accounts[2], value: listingPrice, gas: 5000000, gasPrice: 500000000 });
        await market.createMarketItem(nftAddress,2, auctionPrice, {from: accounts[2], value: listingPrice, gas: 5000000, gasPrice: 500000000 });
    });

    //
    // it('should sale', async ()=> {
    //     const auctionPrice = ethers.utils.parseUnits('1','ether');
    //
    //     await market.createMarketSale(nftAddress, 1, {from:accounts[2] , value: auctionPrice, gas: 5000000, gasPrice: 500000000 });
    //
    // });

    it('should fetch market items', async ()=> {
        let items = await market.fetchMarketItems();
        console.log("+++++++++++++++++ before financing NFT +++++++++++");

        console.log('items', items);
    });



    it('should request for funding', async () => {
        const price = ethers.utils.parseUnits('100', 'ether');
        const collateralPrice = ethers.utils.parseUnits('20', 'ether');
        const requestFunding = ethers.utils.parseUnits('80', 'ether');

        await quasiFi.requestFundingForNFT(nftAddress, 1, 1,
            price, requestFunding, collateralPrice, marketAddress,
            {
                from: accounts[1],
                value: collateralPrice,
                gas: 5000000, gasPrice: 500000000
            });
    });

    it('should fetch quasi items', async ()=> {
        let items = await quasiFi.fetchMarketItems();
        console.log("+++++++++++++++++ Quasi Items +++++++++++");

        console.log('items', items);
    });

    it('should fetch market items', async () => {
        let items = await market.fetchMarketItems();

        console.log("+++++++++++++++++ Market Items +++++++++++")
        console.log('items', items)

        let amount = await market.getBalance();

        console.log(`amount ${amount}`)

    });

    it('fund nft', async () => {

        let amount = await market.getBalance();

        console.log(`amount ${amount}`)

        const requestFunding = ethers.utils.parseUnits('80', 'ether');

        let a = await quasiFi.fundNFT(1,
            {
                from: accounts[2],
                value: requestFunding,
                gas: 5000000, gasPrice: 500000000
            });

        console.log('_______________________________________________')
        console.log("fund NFT", a);
        console.log('_______________________________________________')
        console.log('_______________________________________________')

        let amoun = await market.getBalance();

        console.log(`amount ${amoun}`)
    });
});