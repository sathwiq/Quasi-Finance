import * as React from 'react';
import * as yup from 'yup';
import {Field, Form, Formik, FormikProvider, useFormik} from "formik";
import {Box, Button, Grid, IconButton, Paper, Stack, TextField, Typography} from "@mui/material";
import Web3 from "web3";
import ErrorModal from "../../common/Modals/Error";
import SuccessModal from "../../common/Modals/Success";
import useNft from "../../hooks/useNft";
import {useState} from 'react';
import MuiSlider from '@material-ui/core/Slider';

const percentBasedOnTenure = (tenure)=>{
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

function getPastLogs(){
    Web3.eth.getPastLogs({fromBlock:'0x0',address:'0x9e3319636e2126e3c0bc9e3134AEC5e1508A46c7'})
        .then(res => {
            res.forEach(rec => {
                console.log(rec.blockNumber, rec.transactionHash, rec.topics);
            });
        }).catch(err => console.log("getPastLogs failed", err));
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
        .when(['tenure','totalAmount'], (tenure,totalAmount,schema) => {
            let percent = percentBasedOnTenure(tenure);

            const minVal = totalAmount * (percent/100);

            schema.min(minVal, 'Minimum Funding is '+minVal).max(totalAmount, 'Max Funding amount is '+totalAmount).required('Funding Amount is required');
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

export function fieldToSlider({field,form: {isSubmitting}, disabled = false,...props}) {
    return {
        disabled: isSubmitting || disabled,
        ...props,
        ...field,
        name: field.name,
        value: field.value,
    };
}

export const Slider = (props) => {
    const {nftState} = useNft();

    return (
        <MuiSlider
            defaultValue={props.field.value}
            min={1}
            max={6}
            {...fieldToSlider(props)}
            onChange={(e, value) => {
                props.form.setFieldValue(props.field.name, value);
                let percent = percentBasedOnTenure(value);
                props.form.setFieldValue('fundingAmount',nftState.nftItem.price * (percent/100))
            }}
            valueLabelDisplay="off"
            color="primary"
        />
    )
}


Slider.displayName = 'FormikMaterialUISlider';

const initialValues = {
    tenure: 1
}

export default function RequestFunds(props) {
    const {nftState} = useNft();
    const [successDialog, setSuccessDialog] = useState(false);
    const [errorDialog, setErrorDialog] = useState(false);


    const handleFormSubmit = (values) => {
        console.log(values);
    }

    const percentVal = (value, percent) => {
        return Web3.utils.toWei((Web3.utils.fromWei(value) * (percent / 100)).toFixed(9));
    }

    const requestForFunding = async () => {
        console.log(nftState)

        let item = nftState.nftItem;

        try {
            let tx = await nftState.quasiFinance.methods.requestFundingForNFT(
                item.itemId,
                percentVal(item.price, 80),
                item.marketAddress
            ).send({
                from: nftState.accounts[0],
                value: percentVal(item.price, 20),
                gasLimit: Web3.utils.toHex(29999999)
            });

            console.log(tx);

            setSuccessDialog(true);
        } catch (e) {
            console.log(e)
            setErrorDialog(true);
        }
    }

    return (
        <Paper sx={{padding: 2}} elevation={0} variant="outlined">
            <Formik
                initialValues={{...initialValues,fundingAmount: props.totalAmount * (percentBasedOnTenure(1)/100) , totalAmount: props.totalAmount}}
                onSubmit={(values)=>{
                    console.log('real submit'+values)
                }}
                validationSchema={validationSchema}
            >
                {
                    ({
                         values,
                         errors,
                         handleChange,
                         touched,
                         handleBlur
                    }) => (
                        <Form className="p-4 text-center">

                            <Stack spacing={2}>
                                <Typography>
                                    How many installments do you want to repay this for? (Months)
                                </Typography>

                                <div style={{marginRight: "2vw",marginLeft: "2vw"}}>
                                    <Field
                                        component={Slider}
                                        name="tenure"
                                        aria-labelledby="discrete-slider-restrict"
                                        step={null}
                                        valueLabelDisplay="on"
                                        marks={marks}
                                    />
                                </div>

                                <TextField
                                    fullWidth
                                    id="fundingAmount"
                                    name="fundingAmount"
                                    label="Funding Amount"
                                    variant="outlined"
                                    value={values.fundingAmount}
                                    onChange={handleChange}
                                    error={touched.fundingAmount && Boolean(errors.fundingAmount)}
                                    helperText={touched.fundingAmount && errors.fundingAmount}
                                />


                                <Button variant={"contained"} onClick={() => handleFormSubmit(values)}>
                                    Request For Fund
                                </Button>

                            </Stack>
                        </Form>
                    )
                }
            </Formik>
        </Paper>
    )
}