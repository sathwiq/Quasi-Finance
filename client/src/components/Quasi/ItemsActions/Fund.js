import * as React from "react";
import QNFT from "../../../contracts/QNFT.json";
import Web3 from "web3";
import useNft from "../../../hooks/useNft";
import {Button, Typography} from "@mui/material";
import SuccessModal from "../../../common/Modals/Success";
import ErrorModal from "../../../common/Modals/Error";
import {useNavigation} from "react-navi";
import {useState} from "react";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

export default function Fund(props) {
    const {nftState} = useNft();
    const [successDialog, setSuccessDialog] = useState(false);
    const [errorDialog, setErrorDialog] = useState(false);
    let navigation = useNavigation();

    const fund = async () => {
        let item = nftState.nftItem;

        try {
            let tx = await nftState.quasiFinance.methods.fundNFT(
                item.itemId,
                QNFT.networks[nftState.networkId].address
            ).send({
                from: nftState.accounts[0],
                value: Web3.utils.toWei(''+item.requestedFunding),
                gasLimit: Web3.utils.toHex(29999999)
            });

            setSuccessDialog(true);
            console.log(tx);
        } catch (e) {
            console.log(e);
            setErrorDialog(false);
        }
    }

    function displayPrice(value) {
        let temp = parseFloat(value).toFixed(4);
        return  temp + " eth";
    }

    const onSuccessClose = () => {
        navigation.navigate( "/funded-items");
    }

    const onErrorClose = () => {
        setErrorDialog(false);
    }

    return (
        <div>
            <SuccessModal open={successDialog} onClose={onSuccessClose}
                          message="NFT Funded Successfully"></SuccessModal>
            <ErrorModal open={errorDialog} onClose={onErrorClose} message="Failed"></ErrorModal>
            {
                nftState.nftItem.collateral &&
                <Typography color="text.secondary" gutterBottom>
                    Collateral : {displayPrice(nftState.nftItem.collateral)}
                </Typography>
            }
            {
                nftState.nftItem.requestedFunding &&
                <Typography color="text.secondary" gutterBottom>
                    Funding required : {displayPrice(nftState.nftItem.requestedFunding)}
                </Typography>
            }
            {
                nftState.nftItem.requestedFunding > 0 &&
                <div>
                    <Button variant={"contained"} onClick={fund} startIcon={<AccountBalanceWalletIcon/>}>
                        Fund {displayPrice(nftState.nftItem.requestedFunding)}
                    </Button>
                </div>
            }
        </div>
    );
}