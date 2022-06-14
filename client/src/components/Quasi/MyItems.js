import * as React from 'react';
import {useEffect, useState} from "react";
import useNft from "../../hooks/useNft";
import NFTMarket from "../../contracts/NFTMarket.json";
import CollectionComponent from "../collection/collection";
import axios from "axios";
import Web3 from "web3";


export default function MyItemsComponent(props) {

    const { nftState} = useNft();
    const [myItems, setMyItems] = useState([]);

    useEffect(() => {
        // Get network provider and web3 instance.
        if (nftState.loaded){
            fetchMyItems();
        }
    }, [nftState.loaded]);

    async function fetchMyItems(){
        let tx = await nftState.quasiFinance.methods.fetchMyItems().call({
            from: nftState.accounts[0]
        });

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

        setMyItems(data);

        console.log(tx)
    }

    return(
        <div>
            <CollectionComponent heading={'My Borrowed or Funded Items'} items={myItems}/>
        </div>
    );
}