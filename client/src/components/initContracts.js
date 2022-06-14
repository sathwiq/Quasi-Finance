import * as React from 'react';
import useNft from "../hooks/useNft";
import getWeb3 from "../getWeb3";
import {
    update_accounts_ids,
    update_loaded,
    update_market,
    update_network_id,
    update_nft_contract,
    update_qNFT_loaded,
    update_quasi_finance,
    update_web3
} from "../reducers/nft.reducer";
import NFTMarket from "../contracts/NFTMarket.json";
import NFT from "../contracts/NFT.json";
import QuasiFI from "../contracts/QuasiFI.json";
import QNFT from "../contracts/QNFT.json";
import {useEffect} from "react";

export function InitContracts() {
    const {NftDispatch} = useNft()

    useEffect(() => {
        // Get network provider and web3 instance.
        init();
    }, []);

    const init = async () => {
        let web3 = await getWeb3();


        NftDispatch({
            type: update_web3,
            payload: web3
        });
        console.log(web3)

        const accounts = await web3.eth.getAccounts();

        NftDispatch({
            type: update_accounts_ids,
            payload: accounts
        });

        const netId = await web3.eth.net.getId();

        NftDispatch({
            type: update_network_id,
            payload: netId
        });

        const marketContract = new web3.eth.Contract(
            NFTMarket.abi, NFTMarket.networks[netId] && NFTMarket.networks[netId].address,
        );

        NftDispatch({
            type: update_market,
            payload: marketContract
        });


        const nftContract = new web3.eth.Contract(
            NFT.abi, NFT.networks[netId] && NFT.networks[netId].address,
        );


        NftDispatch({
            type: update_nft_contract,
            payload: nftContract
        });

        const quasiContract = new web3.eth.Contract(
            QuasiFI.abi, QuasiFI.networks[netId] && QuasiFI.networks[netId].address,
        );

        NftDispatch({
            type: update_quasi_finance,
            payload: quasiContract
        });

        const qNftContract = new web3.eth.Contract(
            QNFT.abi, QNFT.networks[netId] && QNFT.networks[netId].address,
        );

        NftDispatch({
            type: update_qNFT_loaded,
            payload: qNftContract
        });

        NftDispatch({
            type: update_loaded,
            payload: true
        });

    }

    return (
        <span></span>
    );
}