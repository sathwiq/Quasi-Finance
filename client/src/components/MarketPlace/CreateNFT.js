import * as React from 'react';
import {useState} from 'react';
import * as yup from 'yup';
import {useFormik} from "formik";
import {Button, Grid, IconButton, InputAdornment, Stack, TextField, Typography} from "@mui/material";
import {create as ipfsHttpClient} from 'ipfs-http-client';
import ClearIcon from '@mui/icons-material/Clear';
import Web3 from "web3";
import NFT from "../../contracts/NFT.json";
import useNft from "../../hooks/useNft";
import ErrorModal from "../../common/Modals/Error";
import UploadIcon from '@mui/icons-material/Upload';
import SuccessModal from "../../common/Modals/Success";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RequestFunds from "../unUsed/RequestFunds";

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

const validationSchema = yup.object({
    name: yup
        .string('Enter name of the NFT')
        .min(2, 'Too Short!')
        .max(20, 'Too Long!')
        .required('Name is required'),
    description: yup
        .string('Enter description of the NFT')
        .min(10, 'Too Short!')
        .max(100, 'Too Long!')
        .required('Description is required'),
    price: yup
        .number('Enter price of the NFT')
        .min(0.1, 'Min value is 0.01')
        .max(100, 'Max value is 100')
        .required('Price is required'),
    image: yup
        .string().required("Image is required")
});

export default function CreateNFT(props) {
    const [imagePreview, setImagePreview] = useState('');
    const [successDialog, setSuccessDialog] = useState(false);
    const [errorDialog, setErrorDialog] = useState(false);
    const {nftState} = useNft();
    const [imageUploadProgress, setImageUploadProgress] = useState(0);


    async function uploadToIPFS(values) {
        const {name, description, price, image} = values;
        if (!name || !description || !price || !image) return
        /* first, upload metadata to IPFS */
        const data = JSON.stringify({
            name, description, image
        })
        try {
            const added = await client.add(data)
            /* after metadata is uploaded to IPFS, return the URL to use it in the transaction */
            return `https://ipfs.infura.io/ipfs/${added.path}`
        } catch (error) {
            console.log('Error uploading file: ', error)
        }
    }

    async function createNFT(url) {
        let temp = await nftState.nftContract.methods.createToken(url)
            .send({
                from: nftState.accounts[0],
                gasLimit: Web3.utils.toHex(29999999)
            });

        console.log(temp)

        let tokenId = temp.events.Transfer.returnValues.tokenId;
        console.log(tokenId)
        return tokenId;
    }

    async function createSale(tokenId, price) {
        let tx = await nftState.marketContract.methods.createMarketItem(
            NFT.networks[nftState.networkId].address,
            tokenId,
            Web3.utils.toHex(Web3.utils.toWei('' + price, 'ether'))
        ).send({
            value: Web3.utils.toHex(Web3.utils.toWei('0.025', 'ether')),
            from: nftState.accounts[0],
            gasLimit: Web3.utils.toHex(29999999)
        });

        console.log(tx)

    }


    const formik = useFormik({
        initialValues: {
            name: '',
            description: '',
            price: '',
            image: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            console.log(values);
            try {
                const url = await uploadToIPFS(values);
                const tokenId = await createNFT(url);
                await createSale(tokenId, values.price);
                setSuccessDialog(true);
            } catch (e) {
                setErrorDialog(true);
            }

        },
    });

    const clearImage = () => {
        formik.setFieldValue('image', '');
        setImagePreview('');
    }

    const onSuccessClose = () => {
        setSuccessDialog(false);
        formik.resetForm({
            name: '',
            description: '',
            price: '',
            image: '',
        });
        setImagePreview('');
    }

    const onErrorClose = () => {
        setErrorDialog(false);
    }

    const uploadToIPFSonChange = async (e) => {
        setImageUploadProgress(0);
        const file = e.target.files[0]

        if (file) {
            try {
                console.log(file)
                const totalSize  = file.size;
                const added = await client.add(
                    file,
                    {
                        progress: (prog) => {
                            setImageUploadProgress((prog/totalSize)*100);
                            console.log(`received: ${prog}`);
                        }
                    }
                )
                const url = `https://ipfs.infura.io/ipfs/${added.path}`
                setImagePreview(url);
                formik.setFieldValue('image', url);
            } catch (error) {
                console.log('Error uploading file: ', error)
            }
        }
    }

    return (
        <div>
            <SuccessModal open={successDialog} onClose={onSuccessClose} message="NFT created Successfully"></SuccessModal>
            <ErrorModal open={errorDialog} onClose={onErrorClose} message="Failed to upload image"></ErrorModal>
            <Grid container justifyContent="center">
                <Grid item xs={4}>
                    <Typography
                        style={{borderBottom: "1px solid grey", paddingBottom: "1vh", marginBottom: "2vh"}}
                        variant="h5" color="text.secondary" gutterBottom>
                        Create NFT
                    </Typography>
                </Grid>
            </Grid>

            <Grid container justifyContent="center">
                <Grid item xs={4}>
                    <form onSubmit={formik.handleSubmit}>

                        <Stack spacing={2}>
                            <TextField
                                fullWidth
                                id="name"
                                name="name"
                                label="Name"
                                variant="outlined"
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                error={formik.touched.name && Boolean(formik.errors.name)}
                                helperText={formik.touched.name && formik.errors.name}
                            />
                            <TextField
                                fullWidth
                                id="description"
                                name="description"
                                label="Description"
                                variant="outlined"
                                value={formik.values.description}
                                onChange={formik.handleChange}
                                error={formik.touched.description && Boolean(formik.errors.description)}
                                helperText={formik.touched.description && formik.errors.description}
                            />

                            <TextField
                                fullWidth
                                id="price"
                                name="price"
                                label="Price"
                                variant="outlined"
                                type="number"
                                InputProps={{
                                    endAdornment: <InputAdornment position="start">eth</InputAdornment>
                                }}
                                value={formik.values.price}
                                onChange={formik.handleChange}
                                error={formik.touched.price && Boolean(formik.errors.price)}
                                helperText={formik.touched.price && formik.errors.price}
                            />

                            {
                                imagePreview &&

                                <Stack direction="row" justifyContent="center" alignItems="flex-start">
                                    <img src={imagePreview}
                                         style={{width: "200px", height: "200px", borderRadius: "5px"}}
                                         alt="Uploaded NFT"/>

                                    <IconButton aria-label="Delete" onClick={clearImage}
                                                style={{transform: "translate(-1vw,-1vh)", padding: "0"}}>
                                        <ClearIcon color="primary" style={{cursor: "pointer"}}/>
                                    </IconButton>
                                </Stack>
                            }

                            <Button
                                variant='outlined'
                                component='label'
                                color={((formik.touched.image || formik.isSubmitting) &&formik.errors.image )
                                    ? "error" : (imagePreview)? "success" :"warning"}
                                endIcon={(imagePreview)? <CheckCircleIcon/> : <UploadIcon/>}>
                                {(imagePreview) ? "NFT Image" : "Select NFT Image"}

                                <input
                                    name='image'
                                    accept='image/*'
                                    id='contained-button-file'
                                    type='file'
                                    hidden
                                    onChange={uploadToIPFSonChange}
                                />
                            </Button>

                            {/*<Typography*/}
                            {/*    variant="caption"*/}
                            {/*    color="text.primary" gutterBottom>*/}
                            {/*    {imageUploadProgress}*/}
                            {/*</Typography>*/}


                            {
                                (formik.touched.image || formik.isSubmitting) &&
                                formik.errors.image ?
                                    <Typography
                                        variant="caption"
                                        style={{color: "red", marginLeft: "1vw",marginTop: "0"}}
                                        color="text.error" gutterBottom>
                                        {formik.errors.image}
                                    </Typography>
                                    : null
                            }

                            <Button color="primary" variant="contained" fullWidth type="submit">
                                Submit
                            </Button>
                        </Stack>
                    </form>
                </Grid>
            </Grid>
        </div>

    );
}