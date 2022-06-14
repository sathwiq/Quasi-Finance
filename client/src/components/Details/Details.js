import {Grid, Paper, Stack, Typography} from "@mui/material";
import * as React from "react";
import {useEffect, useState} from "react";
import Web3 from "web3";
import useNft from "../../hooks/useNft";
import RequestFundsForm from "../Quasi/ItemsActions/RequestFundsForm";
import Fund from "../Quasi/ItemsActions/Fund";
import Installments from "../Quasi/ItemsActions/Installments";
import BuyNow from "../MarketPlace/BuyNow";

export default function Details(props) {
    const [funding, setFunding] = useState({});
    const [installments, setInstallments] = useState([]);
    const {nftState} = useNft();

    useEffect(() => {
        if (nftState.nftItem) {
            if (props.funderView && nftState.nftItem.funded) {
                getFundingDetails();
            }
        }
    }, [nftState.nftItem]);

    const getFundingDetails = async () => {
        let tx = await nftState.quasiFinance.methods.fetchFunding(
            nftState.nftItem.itemId
        ).call();

        console.log(tx)

        let funds = {
            ...tx,
            amountDue: Web3.utils.fromWei(   '' +tx.amountDue),
            totalAmount: Web3.utils.fromWei(  '' +tx.totalAmount)

        }

        setFunding(funds)

        console.log(funds)

        if (nftState.nftItem.borrower === nftState.accounts[0]) {
            tx = await nftState.quasiFinance.methods.fetchMyInstallmentsForItem(
                nftState.nftItem.itemId
            ).call();

            console.log(tx)

            let data = tx.map(value => {
                if (value.amountDue){
                    value = {
                        ...value,
                        amountDue: Web3.utils.fromWei(   '' +value.amountDue),
                    }
                }
                return value;
            });
            setInstallments(data);
            console.log(tx);
            console.log(data);
        }
    }

    function displayPrice(value) {
        return value + " eth";
    }

    function PendingAmount() {
        return (
            <Paper style={{padding: "1vh 1vw", marginBottom: "2vh"}}>
                <Typography variant="h5" color="text.secondary" gutterBottom style={{borderBottom: "1px solid grey", paddingBottom: "1vh", marginBottom: "2vh"}}>
                    Funding Details
                </Typography>
                {
                    nftState.nftItem.price &&
                    <Typography color="text.secondary" gutterBottom>
                        Price : {displayPrice(nftState.nftItem.price)}
                    </Typography>
                }
                {
                    funding.totalAmount &&
                    <Typography color="text.secondary" gutterBottom>
                        Total Amount : {displayPrice(funding.totalAmount)}
                    </Typography>
                }
                {
                    funding.amountDue &&
                    <Typography color="text.secondary" gutterBottom>
                        Amount Due : {displayPrice(funding.amountDue)}
                    </Typography>
                }
                {
                    nftState.nftItem.collateral &&
                    <Typography color="text.secondary" gutterBottom>
                        Collateral Provided
                        : {displayPrice(nftState.nftItem.collateral)}
                    </Typography>
                }
            </Paper>
        )
    }

    function redactAddress(value) {
        if (value && value.length > 10)
            return value.slice(0, 5) + '...' + value.slice(value.length - 4, value.length);
        else
            return value;
    }

    return (
        <div style={{padding: "0vh 20vw"}}>
            <Grid container spacing={2}>
                <Grid item xs={4}>
                    <Stack spacing={1}>
                        <img style={{width: "100%", marginBottom: "1vh", borderRadius: "5px"}}
                             src={nftState.nftItem.tokenURI}
                             alt={" plane"}/>

                        <Paper style={{padding: "1vh 1vw"}}>
                            <Typography
                                style={{borderBottom: "1px solid grey", paddingBottom: "1vh", marginBottom: "1vh"}}
                                variant="h5" color="text.secondary" gutterBottom>
                                Description
                            </Typography>

                            <Typography sx={{fontSize: 14}} color="text.secondary" gutterBottom>
                                {nftState.nftItem.description}
                            </Typography>
                        </Paper>

                        <Paper style={{padding: "1vh 1vw"}}>
                            <Typography
                                style={{borderBottom: "1px solid grey", paddingBottom: "1vh", marginBottom: "1vh"}}
                                variant="h5" color="text.secondary" gutterBottom>
                                Details
                            </Typography>

                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Typography xs={6} sx={{fontSize: 14}} color="text.secondary" gutterBottom>
                                    Contract Address
                                </Typography>

                                {
                                    nftState.nftItem.nftContract &&
                                    <Typography xs={6} sx={{fontSize: 14}} color="text.secondary" gutterBottom>
                                        {redactAddress(nftState.nftItem.nftContract) || redactAddress(nftState.nftItem.oNftContract)}
                                    </Typography>
                                }
                                {
                                    nftState.nftItem.oNFTContract &&
                                    <Typography xs={6} sx={{fontSize: 14}} color="text.secondary" gutterBottom>
                                        {redactAddress(nftState.nftItem.oNFTContract)}
                                    </Typography>
                                }

                            </Stack>
                            <Stack direction="row" justifyContent="space-between"
                                   alignItems="center">
                                <Typography xs={6} sx={{fontSize: 14}} color="text.secondary" gutterBottom>
                                    Token ID
                                </Typography>

                                {
                                    nftState.nftItem.tokenId > 0 &&
                                    <Typography xs={6} sx={{fontSize: 14}} color="text.secondary" gutterBottom>
                                        {nftState.nftItem.tokenId}
                                    </Typography>
                                }
                                {
                                    nftState.nftItem.oTokenId > 0 &&
                                    <Typography xs={6} sx={{fontSize: 14}} color="text.secondary" gutterBottom>
                                        {nftState.nftItem.oTokenId}
                                    </Typography>
                                }
                            </Stack>
                            <Stack direction="row" justifyContent="space-between"
                                   alignItems="center">
                                <Typography xs={6} sx={{fontSize: 14}} color="text.secondary" gutterBottom>
                                    Token Standard
                                </Typography>

                                <Typography xs={6} sx={{fontSize: 14}} color="text.secondary" gutterBottom>
                                    ERC-1155
                                </Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between"
                                   alignItems="center">
                                <Typography xs={6} sx={{fontSize: 14}} color="text.secondary" gutterBottom>
                                    Blockchain
                                </Typography>

                                <Typography xs={6} sx={{fontSize: 14}} color="text.secondary" gutterBottom>
                                    Testnet
                                </Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between"
                                   alignItems="center">
                                <Typography xs={6} sx={{fontSize: 14}} color="text.secondary" gutterBottom>
                                    Metadata
                                </Typography>

                                <Typography xs={6} sx={{fontSize: 14}} color="text.secondary" gutterBottom>
                                    Decentralized
                                </Typography>
                            </Stack>

                        </Paper>
                    </Stack>
                </Grid>
                <Grid item xs>
                    <Stack spacing={2}>
                        <Typography variant="h5" color="text.secondary" gutterBottom>
                            {nftState.nftItem.name}
                        </Typography>

                        {/*<Typography color="text.secondary" gutterBottom>*/}
                        {/*    Owned by Sathwiq*/}
                        {/*</Typography>*/}


                        {
                            props.funderView &&

                            (nftState.nftItem.funded) ?
                                (
                                    <div>
                                        {
                                            nftState.nftItem.borrower === nftState.accounts[0] &&
                                            <div>
                                                <PendingAmount/>

                                                <Installments getFundingDetails={getFundingDetails}
                                                              installments={installments}/>
                                            </div>
                                        }

                                        {
                                            nftState.nftItem.lender === nftState.accounts[0] && funding &&
                                            <PendingAmount/>
                                        }
                                    </div>
                                )
                                :
                                <Fund/>
                        }
                        <div>
                            {
                                props.marketPlace && nftState.nftItem.price &&
                                <BuyNow price={nftState.nftItem.price}/>
                            }
                            {
                                props.marketPlace && nftState.nftItem.price &&
                                <RequestFundsForm/>
                            }
                        </div>
                    </Stack>
                </Grid>
            </Grid>
        </div>
    );
}