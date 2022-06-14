import * as React from 'react';
import {useEffect, useState} from 'react';
import useNft from "../../hooks/useNft";
import {Button, Typography} from "@mui/material";
import Web3 from "web3";


export default function Admin(props) {
    const [lockedFunds, setLockedFunds] = useState(0);
    const [instantFundingPrice, setInstantFundingPrice] = useState(0);
    const { nftState} = useNft();

    useEffect(() => {
        // Get network provider and web3 instance.
        if (nftState.loaded){
            getFundsAvailable();
        }
    }, [nftState.loaded]);

    function displayPrice(value) {
        return Web3.utils.fromWei(value.toString()).slice(0, 7) + " eth";
    }

    async function getFundsAvailable(){
        let tx = await nftState.quasiFinance.methods.getBalance().call();

        setLockedFunds(tx)
        console.log(tx)

        tx = await nftState.quasiFinance.methods.getAutoPayPrice().call();

        console.log(tx)

        setInstantFundingPrice(tx);
    }

    async function addFunds() {
        let tx = await nftState.quasiFinance.methods.pool().send({
            from: nftState.accounts[0],
            value: Web3.utils.toHex(100000000000000000000),
            gasLimit: Web3.utils.toHex(29999999)
        });

        console.log(tx)

        getFundsAvailable();
    }

    return (
        <div>
            <Button onClick={addFunds}>Add Funds to pool</Button>
            <Typography color="text.secondary" gutterBottom>Locked Funds - {displayPrice(lockedFunds)}</Typography>
            <Typography color="text.secondary" gutterBottom>Instant Funding Price - {displayPrice(instantFundingPrice)}</Typography>
        </div>
    )
}