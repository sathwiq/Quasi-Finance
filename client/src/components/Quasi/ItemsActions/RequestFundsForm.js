import useNft from "../../../hooks/useNft";
import * as React from 'react';
import {useEffect, useState} from 'react';
import * as yup from 'yup';
import {useFormik} from "formik";
import {Alert, Button, InputAdornment, Paper, Stack, TextField, Typography} from "@mui/material";
import MuiSlider from "@material-ui/core/Slider";
import Web3 from "web3";
import SuccessModal from "../../../common/Modals/Success";
import ErrorModal from "../../../common/Modals/Error";
import {useNavigation} from "react-navi";

const percentBasedOnTenure = (tenure) => {
    let percent;
    switch (tenure) {
        case 2:
            percent = 24;
            break;
        case 3:
            percent = 28;
            break;
        case 4:
            percent = 32;
            break;
        case 5:
            percent = 38;
            break;
        case 6:
            percent = 45;
            break;
        default:
            percent = 20;
    }

    return percent;
}

const validationSchema = yup.object({
    tenure: yup
        .number('Select Tenure')
        .min(1, 'Too Short!')
        .max(6, 'Too Long!')
        .required('Tenure is required'),
    totalAmount: yup
        .number('Select total amount')
        .required('Tenure is required'),

    fundingAmount: yup
        .number("select amount")
        .when(['tenure', 'totalAmount'], (tenure, totalAmount, schema) => {

            let percent = percentBasedOnTenure(tenure);

            const minVal = totalAmount * (10 / 100);

            let maxVal = (totalAmount) * ((100 - percent) / 100);
            return schema.min(minVal, 'Minimum Funding is ' + minVal).max(maxVal, 'Max Funding amount is ' + maxVal).required('Funding Amount is required');
        })
});


const marks = [
    {
        value: 1,
        label: <Typography
            variant="caption"
            color="text.primary" gutterBottom>
            1 month
        </Typography>,
    },
    {
        value: 2,
        label: <Typography
            variant="caption"
            color="text.primary" gutterBottom>
            2 months
        </Typography>,
    },
    {
        value: 3,
        label: <Typography
            variant="caption"
            color="text.primary" gutterBottom>
            3 months
        </Typography>,
    },
    {
        value: 4,
        label: <Typography
            variant="caption"
            color="text.primary" gutterBottom>
            4 months
        </Typography>,
    },
    {
        value: 5,
        label: <Typography
            variant="caption"
            color="text.primary" gutterBottom>
            5 months
        </Typography>,
    },
    {
        value: 6,
        label: <Typography
            variant="caption"
            color="text.primary" gutterBottom>
            6 months
        </Typography>,
    },
];


export default function RequestFundsForm(props) {
    let navigation = useNavigation();

    const {nftState} = useNft();
    const [successDialog, setSuccessDialog] = useState(false);
    const [errorDialog, setErrorDialog] = useState(false);
    const [instantFunding, setInstantFunding] = useState(false);
    const [fundsAvailable, setAvailableFunds] = useState(false);

    useEffect(()=>{
        getInstantFundingPrice();
    },[nftState.loaded]);

    async  function getInstantFundingPrice(){

        let tx = await nftState.quasiFinance.methods.getBalance().call();
        tx = Web3.utils.fromWei(''+tx);

        setAvailableFunds(tx);

        let t = await nftState.quasiFinance.methods.getAutoPayPrice().call();

        t = Web3.utils.fromWei(''+t);
        console.log(t)
        setInstantFunding(t)
    }

    const formik = useFormik({
        initialValues: {
            tenure: 1,
            totalAmount: Number(nftState.nftItem.price),
            fundingAmount: maxValue(20)
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            console.log(values);
            requestForFunding(values);
        },
    });

    const requestForFunding = async (values) => {
        console.log(nftState)

        await getInstantFundingPrice();

        let item = nftState.nftItem;

        console.log(values.fundingAmount)

        try {
            let tx;

            if (values.fundingAmount <= instantFunding && values.fundingAmount <= fundsAvailable) {
                tx = await nftState.quasiFinance.methods.requestFundingWithAutoPayForNFT(
                    item.itemId,
                    Web3.utils.toWei(''+values.fundingAmount),
                    item.marketAddress,
                    values.tenure
                ).send({
                    from: nftState.accounts[0],
                    value: Web3.utils.toWei(''+(values.totalAmount - values.fundingAmount)),
                    gasLimit: Web3.utils.toHex(29999999)
                });
            } else {
                tx = await nftState.quasiFinance.methods.requestFundingForNFT(
                    item.itemId,
                    Web3.utils.toWei(''+values.fundingAmount),
                    item.marketAddress,
                    values.tenure
                ).send({
                    from: nftState.accounts[0],
                    value: Web3.utils.toWei(''+(values.totalAmount - values.fundingAmount)),
                    gasLimit: Web3.utils.toHex(29999999)
                });
            }

            console.log(tx);

            setSuccessDialog(true);
        } catch (e) {
            console.log(e)
            setErrorDialog(true);
        }
    }

    function maxValue(percent) {
        return (nftState.nftItem.price) * ((100 - percent) / 100);
    }

    const percentVal = (value, percent) => {
        return Web3.utils.toWei((Web3.utils.fromWei(value) * (percent / 100)).toFixed(9));
    }


    const onTenureChange = async (_, value) => {
        formik.setFieldValue('tenure', value);
        let percent = percentBasedOnTenure(value);

        let number = maxValue(percent);

        formik.setFieldValue('fundingAmount', number)
    }
    const onSuccessClose = () => {
        navigation.navigate( "/funded-items");
    }

    const onErrorClose = () => {
        setErrorDialog(false);
    }

    function displayPrice(value) {
        return value + " eth";
    }

    return (
        <div>
            <SuccessModal open={successDialog} onClose={onSuccessClose}
                          message="Funds Requested Successfully"></SuccessModal>
            <ErrorModal open={errorDialog} onClose={onErrorClose} message="Failed"></ErrorModal>
            <Paper sx={{padding: 2}} elevation={3}>
                <Stack spacing={3}>
                    <Typography variant="h5" color="text.primary"
                                style={{borderBottom: "1px solid grey", paddingBottom: "1vh", marginBottom: "1vh"}}>
                        Finance this NFT
                    </Typography>
                    {
                        formik.values.fundingAmount <= instantFunding &&
                        <Alert severity="info" color="info">
                            NFT is eligible for Instant funding.
                        </Alert>
                    }
                    <Alert severity="info" color="info">
                        Collateral changes based on number of Installments.
                    </Alert>
                    <Typography>
                        How many installments do you want to repay this for? (Months)
                    </Typography>

                    <div style={{marginRight: "2vw", marginLeft: "2vw", paddingBottom: '2vh'}}>
                        <MuiSlider
                            defaultValue={1}
                            min={1}
                            max={6}
                            onChange={onTenureChange}
                            valueLabelDisplay="off"
                            steps={1}
                            marks={marks}
                        />
                    </div>
                </Stack>

                <form onSubmit={formik.handleSubmit}>
                    <Stack spacing={5}>
                        <Typography>
                            Collateral :
                            {
                                (formik.values.totalAmount >= formik.values.fundingAmount ) &&
                                displayPrice(formik.values.totalAmount - formik.values.fundingAmount)}
                        </Typography>

                        <TextField
                            fullWidth
                            id="fundingAmount"
                            name="fundingAmount"
                            label="Funding Amount"
                            variant="outlined"
                            type="number"
                            value={formik.values.fundingAmount}
                            InputProps={{
                                endAdornment: <InputAdornment position="start">eth</InputAdornment>
                            }}
                            onChange={formik.handleChange}
                            error={formik.touched.fundingAmount && Boolean(formik.errors.fundingAmount)}
                            helperText={formik.touched.fundingAmount && formik.errors.fundingAmount}
                        />


                        <Button color="primary" variant="contained" fullWidth type="submit">
                            Submit
                        </Button>
                    </Stack>
                </form>
            </Paper>
        </div>
    );
}
