import * as React from 'react';
import {useFormik} from "formik";
import * as yup from 'yup';
import {Button, Stack, TextField, Typography} from "@mui/material";

const validationSchema = yup.object({
    minPrice: yup
        .number('Enter min amount')
        .min(0.1, 'Min value is 0.01')
        .max(100, 'Max price is 100')
        .required('Min is required'),
    maxPrice: yup
        .number('Enter max amount')
        .when('minPrice',(minPrice,schema)=>{
            return schema
                .min(minPrice, 'Minimum must be less than maximum')
                .max(100,'Max price is 100')
                .required('Max is required')
        })
});

export default function Filters(props) {

    const formikPrice = useFormik({
        initialValues: {
            minPrice: '',
            maxPrice: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            console.log(values);
        },
        onChange: (values)=>{
            console.log(values)
        }
    });

    return (
        <div>
            <Typography
                style={{borderBottom: "1px solid grey", paddingBottom: "1vh", marginBottom: "2vh"}}
                variant="h5" color="text.secondary" gutterBottom>
                Filters
            </Typography>


            <form onSubmit={formikPrice.handleSubmit}>
                <Stack spacing={2}>
                    <Typography color="text.secondary" gutterBottom>
                        Price
                    </Typography>

                    <Stack spacing={1} direction="row"   alignItems="center">
                        <TextField
                            fullWidth
                            id="minPrice"
                            name="minPrice"
                            label="Min"
                            variant="outlined"
                            size="small"
                            value={formikPrice.values.minPrice}
                            onChange={formikPrice.handleChange}
                            error={formikPrice.touched.minPrice && Boolean(formikPrice.errors.minPrice)}
                        />
                        <Typography color="text.secondary" gutterBottom>
                            to
                        </Typography>

                        <TextField
                            fullWidth
                            id="maxPrice"
                            name="maxPrice"
                            label="Max"
                            variant="outlined"
                            size="small"
                            value={formikPrice.values.maxPrice}
                            onChange={formikPrice.handleChange}
                            error={formikPrice.touched.maxPrice && Boolean(formikPrice.errors.maxPrice)}
                        />
                    </Stack>

                    <Typography
                        style={{color: "red",marginTop: "0.5vh"}}
                        color="text.error" gutterBottom>
                        {formikPrice.touched.minPrice && formikPrice.errors.minPrice}
                        {formikPrice.touched.minPrice && formikPrice.errors.minPrice && <br/>}

                        {formikPrice.touched.maxPrice && formikPrice.errors.maxPrice}
                    </Typography>

                    <Button disabled={formikPrice.isValid} color="primary" variant="contained" fullWidth type="submit">
                        Apply
                    </Button>
                </Stack>
            </form>
        </div>
    )
}