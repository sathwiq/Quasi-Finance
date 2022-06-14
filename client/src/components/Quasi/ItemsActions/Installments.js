import * as React from "react";
import Web3 from "web3";
import useNft from "../../../hooks/useNft";
import {Accordion, AccordionDetails, AccordionSummary, Button, Grid, Paper, Stack, Typography} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

export default function Installments(props) {
    const {nftState} = useNft();

    const payInstallment = async (installment) => {
        const tx = await nftState.quasiFinance.methods.repay(
            installment.id
        ).send({
            value: Web3.utils.toWei(''+installment.amountDue),
            from: nftState.accounts[0],
            gasLimit: Web3.utils.toHex(29999999)
        });

        console.log(tx);

        props.getFundingDetails();
    }

    function displayPrice(value) {
        return value + " eth";
    }

    return (
        <div>
            {
                props.installments.length > 0 &&
                <Accordion defaultExpanded={true}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon/>}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography variant="h5">Installments</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            {
                                props.installments.map((installment, index) =>
                                    <Grid item xs={8} key={installment.id}>
                                        <Paper elevation={0} style={{padding: "2vh 2vw"}}>
                                            <Stack spacing={2}>
                                                <Typography>Installment : #{index + 1}</Typography>

                                                {
                                                    !installment.paid && installment.amountDue &&
                                                    <Typography color="text.secondary" gutterBottom>
                                                        Amount Due : {displayPrice(installment.amountDue)}
                                                    </Typography>
                                                }
                                                {
                                                    installment.paid &&
                                                    <Typography color="text.secondary" gutterBottom>
                                                        Paid {displayPrice(installment.amountDue)}
                                                    </Typography>
                                                }
                                            </Stack>
                                            {
                                                !installment.paid &&
                                                <Button style={{marginTop: "2vh"}} variant={"contained"} size="large"
                                                        startIcon={<AccountBalanceWalletIcon/>} onClick={() => payInstallment(installment)}>
                                                    Pay
                                                </Button>
                                            }
                                        </Paper>
                                    </Grid>
                                )
                            }
                        </Grid>
                    </AccordionDetails>
                </Accordion>
            }
        </div>
    );
}