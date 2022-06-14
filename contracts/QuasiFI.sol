// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./NFTMarket.sol";
import "./NFT.sol";
import "./QNFT.sol";

contract QuasiFI is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemFunded;
    Counters.Counter private _installmentIds;

    address payable owner;
    uint256 autoFundPrice = 5 ether;

    constructor(){
        owner = payable(msg.sender);
    }

    struct Item {
        uint256 oItemId;
        address payable marketContract;
        uint256 itemId;
        address NFTContract;
        uint256 tokenId;
        address payable lender;
        address payable borrower;
        uint256 price;
        uint256 requestedFunding;
        uint256 collateral;
        bool funded;
        address owner;
        address oNFTContract;
        uint256 oTokenId;
    }

    struct Funding {
        uint256 itemId;
        uint256 totalAmount;
        uint256 amountDue;
        uint256 totalInstalments;
        uint256 completedInstalments;
        uint256[] installmentIds;
    }

    event Funded (
        uint256 itemId,
        uint256 amoountFunded
    );

    struct Installments {
        uint256 id;
        bool paid;
        uint256 amountDue;
        uint dueDate;
        uint256 fundingId;
    }

    mapping(uint256 => Item) private idToItem;
    mapping(uint256 => Funding) private idToFunding;
    mapping(uint256 => Installments) private idToInstallments;

    event ItemCreated(
        uint256 oItemId,
        uint256 itemId,
        address payable borrower,
        uint256 price,
        uint256 requestedFunding,
        uint256 collateral
    );

    function requestFundingForNFT(
        uint256 oItemId,
        uint256 requestedFunding,
        address payable marketAddress,
        uint tenure
    ) public payable nonReentrant {

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        NFTMarket.MarketItem memory item = NFTMarket(marketAddress).getMarketItem(oItemId);

        require(requestedFunding < item.price, "Requested funding must be less than price");

        uint256 collateral = item.price - requestedFunding;
        require(msg.value == collateral, "Please submit collateral amount to request funding");
        require(collateral >= (item.price * 20) / 100, "Collateral must be minimum 20% of the price");
        require(collateral + requestedFunding == item.price, "Funding amount and collateral does not match price");

        idToItem[itemId] = Item(
            oItemId,
            marketAddress,
            itemId,
            address(0),
            0,
            payable(address(0)),
            payable(msg.sender),
            item.price,
            requestedFunding,
            collateral,
            false,
            address(0),
            item.nftContract,
            item.tokenId
        );

        uint256[] memory installmentIds = new uint256[](tenure);

        idToFunding[itemId] = Funding(
            itemId,
            0,
            0,
            tenure,
            0,
            installmentIds
        );


        emit ItemCreated(
            oItemId,
            itemId,
            payable(msg.sender),
            item.price,
            requestedFunding,
            collateral
        );
    }

    function requestFundingWithAutoPayForNFT(
        uint256 oItemId,
        uint256 requestedFunding,
        address payable marketAddress,
        uint tenure
    ) public payable nonReentrant {

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        NFTMarket.MarketItem memory item = NFTMarket(marketAddress).getMarketItem(oItemId);

        require(requestedFunding < item.price, "Requested funding must be less than price");

        uint256 collateral = item.price - requestedFunding;

        require(msg.value == collateral, "Please submit collateral amount to request funding");
        require(collateral >= (item.price * 20) / 100, "Collateral must be minimum 20% of the price");
        require(collateral + requestedFunding == item.price, "Funding amount and collateral does not match price");
//        require( autoFundPrice >= requestedFunding , "Exceeded Auto fund amount");
//        require(address(this).balance >= requestedFunding , "No sufficient funds in pool");

        NFTMarket(marketAddress).createMarketSale{value : item.price, gas : 5000000}(item.nftContract, oItemId);

        idToItem[itemId] = Item(
            oItemId,
            marketAddress,
            itemId,
            address(0),
            0,
            payable(address(this)),
            payable(msg.sender),
            item.price,
            requestedFunding,
            collateral,
            true,
            address(0),
            item.nftContract,
            item.tokenId
        );

        uint256[] memory installmentIds = new uint256[](tenure);

        idToFunding[itemId] = Funding(
            itemId,
            0,
            0,
            tenure,
            0,
            installmentIds
        );
        _itemFunded.increment();

        _prepareInstallments(itemId);

    }

    function cancelFunding(uint256 itemId) external payable nonReentrant{
        Item storage item = idToItem[itemId];

        require(item.borrower == msg.sender, "Buyer not matched");
        require(item.funded == false, "Funded");
        require(item.collateral > 0, "Funded");

        item.collateral = 0;

        item.borrower.transfer(item.collateral);

        delete idToItem[itemId];
        delete idToFunding[itemId];
    }

    function fundNFT(
        uint256 itemId,
        address nftContract
    ) public payable nonReentrant {
        Item storage item = idToItem[itemId];
        require(item.funded == false, "Funded");
        require(item.requestedFunding >= msg.value, "Please submit requested funds");

        NFTMarket(item.marketContract).createMarketSale{value : item.price, gas : 5000000}(item.oNFTContract, item.oItemId);

        idToItem[itemId].funded = true;
        idToItem[itemId].lender = payable(msg.sender);
        idToItem[itemId].owner = idToItem[itemId].borrower;
        idToItem[itemId].NFTContract = nftContract;

        emit Funded(
            itemId, msg.value);

        _itemFunded.increment();

        _prepareInstallments(itemId);
    }


    function mintNFT(
        uint256 itemId,
        address nftContract
    ) external {
        Item memory item = idToItem[itemId];
        string memory tokenURI = NFT(item.oNFTContract).tokenURI(item.oTokenId);
        uint tokenId = QNFT(nftContract).createToken(tokenURI);
        idToItem[itemId].tokenId = tokenId;
    }

    function getItem(uint256 itemId) external view returns (Item memory){
        return idToItem[itemId];
    }

    function getTokenURI(uint256 itemId) external view returns (string memory){
        Item memory item = idToItem[itemId];
        return NFT(item.oNFTContract).tokenURI(item.oTokenId);
    }

    function mint(
        uint256 itemId, address nftContract, string memory tokenURI
    ) external returns (uint){
        uint tokenId = QNFT(nftContract).createToken(tokenURI);
        idToItem[itemId].tokenId = tokenId;
        return tokenId;
    }

    function _prepareInstallments(uint256 itemId) internal {
        Item storage item = idToItem[itemId];
        Funding storage funding = idToFunding[itemId];

        uint256 amountToBePaid = item.requestedFunding + ((item.requestedFunding * 15) / 100);

        uint256 amountPerInstallment = amountToBePaid / funding.totalInstalments;

        uint256[] storage installmentIds = funding.installmentIds;

        uint256 time = block.timestamp;

        for (uint i = 0; i < funding.totalInstalments; i++) {
            _installmentIds.increment();
            uint256 id = _installmentIds.current();

            // Add due dates
            idToInstallments[id] = Installments(id, false, amountPerInstallment, time, itemId);
            installmentIds[i] = id;

            //Add 1 month
            time += 2629743;
        }

        idToFunding[itemId].totalAmount = amountToBePaid;
        idToFunding[itemId].amountDue = amountToBePaid;
        idToFunding[itemId].installmentIds = installmentIds;
    }

    function repay(uint256 installmentId) public payable {
        Installments storage installment = idToInstallments[installmentId];
        require(msg.value >= installment.amountDue, "Please send amount to repay");

        address payable lender = idToItem[installment.fundingId].lender;

        if(payable(address(this))  != lender){
            lender.transfer(msg.value);
        }

        installment.paid = true;

        idToFunding[installment.fundingId].amountDue = idToFunding[installment.fundingId].amountDue - msg.value;
        if (idToFunding[installment.fundingId].amountDue == 0) {
            fullyPaid(installment.fundingId);
        }
        idToFunding[installment.fundingId].completedInstalments++;
    }

    function fullyPaid(uint itemId) public {
        Funding memory funding = idToFunding[itemId];
        require(funding.amountDue == 0, "Please clear balance due");

        Item storage item = idToItem[itemId];

        NFTMarket(item.marketContract).transfer(item.oItemId, item.borrower);

    }


    function fetchMarketItems() public view returns (Item[] memory){
        uint itemCount = _itemIds.current();
        uint itemFundedCount = _itemFunded.current();
        uint unFundedItems = itemCount - itemFundedCount;
        uint currentIndex = 0;

        Item[] memory items = new Item[](unFundedItems);

        for (uint i = 0; i < itemCount; i++) {
            if (!idToItem[i + 1].funded) {
                uint currentId = idToItem[i + 1].itemId;
                Item storage currentItem = idToItem[currentId];

                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }

    function fetchMyItems() public view returns (Item[] memory){
        uint itemCount = _itemIds.current();
        uint currentIndex = 0;

        uint myItemCount = 0;

        for (uint i = 0; i < itemCount; i++) {
            if (idToItem[i + 1].borrower == msg.sender || idToItem[i + 1].lender == msg.sender) {
                myItemCount += 1;
            }
        }

        Item[] memory items = new Item[](myItemCount);


        for (uint i = 0; i < itemCount; i++) {
            if (idToItem[i + 1].borrower == msg.sender || idToItem[i + 1].lender == msg.sender) {
                uint currentId = idToItem[i + 1].itemId;
                Item storage currentItem = idToItem[currentId];

                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }

    function fetchFunding(uint itemId) external view returns (Funding memory){
        return idToFunding[itemId];
    }

    function fetchMyInstallmentsForItem(uint256 itemId) public view returns (Installments[] memory){
        require(idToItem[itemId].funded, "Item is not funded");

        Funding memory funding = idToFunding[itemId];

        Installments[] memory installments = new Installments[](funding.totalInstalments);

        for (uint i = 0; i < funding.totalInstalments; i++) {
            Installments memory installment = idToInstallments[funding.installmentIds[i]];

            installments[i] = installment;
        }

        return installments;
    }


    function pool() external payable {
    }

    function getAutoPayPrice() external view returns (uint){
        return autoFundPrice;
    }

    function getBalance() external view returns (uint){
        return address(this).balance;
    }
}