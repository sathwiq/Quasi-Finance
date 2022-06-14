import * as React from 'react';
import {Button, Paper, Typography} from "@mui/material";
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

export default function BuyNow(props) {

    function displayPrice(value) {
        return value + " eth";
    }

    return(
        <Paper style={{padding: "2vw 2vh ", marginBottom: "2vh"}}>
            <Typography color="text.secondary" gutterBottom>
                Current Price
            </Typography>
            <Typography variant={"h5"}  color="text.secondary" gutterBottom>
                {displayPrice(props.price)}
            </Typography>
            <Button color="info" variant="contained" size="large" style={{marginTop: "2vh"}}
                    startIcon={<AccountBalanceWalletIcon/>}>
                Buy Now
            </Button>
        </Paper>
    )
}