import * as React from 'react';
import {useEffect, useState} from 'react';
import useNft from "../../hooks/useNft";
import NFTMarket from "../../contracts/NFTMarket.json";
import CollectionComponent from "../collection/collection";
import axios from "axios";
import Web3 from "web3";

export default function MarketPlaceComponent(props) {

    const [items, setItems] = useState([]);
    const {  nftState} = useNft();

    useEffect(() => {
        // Get network provider and web3 instance.
        if (nftState.loaded){
            getMarketItems();
        }
    }, [nftState.loaded]);

    async function getMarketItems() {
        let tx = await nftState.marketContract.methods.fetchMarketItems().call();

        console.log(tx)
        let data = await Promise.all(tx.map(async value =>{
            let tokenURI = await nftState.nftContract.methods.tokenURI(value.tokenId).call();
            const meta = await axios.get(tokenURI);

            console.log(meta)

            value = {
                ...value,
                name : meta.data.name,
                description : meta.data.description,
                tokenURI: meta.data.image,
                marketAddress: NFTMarket.networks[nftState.networkId].address,
                price : Web3.utils.fromWei(''+value.price)
            };
            return value;
        }));

        setItems(data);
    }

    return(
        <div>
            <CollectionComponent heading={'Market Place'} items={items} />
        </div>
    );
}