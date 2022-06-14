import * as React from 'react';
import {useEffect, useState} from 'react';
import useNft from "../../hooks/useNft";
import NFTMarket from "../../contracts/NFTMarket.json";
import CollectionComponent from "../collection/collection";
import axios from "axios";
import {Button, Typography} from "@mui/material";
import Web3 from "web3";


export default function HomeComponent(props) {

    const [fundItems, setFundItems] = useState([]);
    const { nftState} = useNft();

    useEffect(() => {
        // Get network provider and web3 instance.
        if (nftState.loaded){
            getFundingItems();
        }
    }, [nftState.loaded]);

    async function getFundingItems() {
        let tx = await nftState.quasiFinance.methods.fetchMarketItems().call();

        console.log(tx);

        let data = await Promise.all(tx.map(async value =>{
            if (value.itemId > 0){
                let tokenURI = await nftState.nftContract.methods.tokenURI(value.oItemId).call();
                const meta = await axios.get(tokenURI);

                value = {
                    ...value,
                    name : meta.data.name,
                    description : meta.data.description,
                    tokenURI: meta.data.image,
                    marketAddress: NFTMarket.networks[nftState.networkId].address,
                    price: Web3.utils.fromWei(''+value.price),
                    collateral: Web3.utils.fromWei(''+value.collateral),
                    requestedFunding: Web3.utils.fromWei(''+value.requestedFunding),
                };
                console.log(value)
            }
            return value;
        }));

        setFundItems(data);
    }

    return(
        <div>
            <CollectionComponent heading={'Fund Items'} items={fundItems}/>
        </div>
    );
}