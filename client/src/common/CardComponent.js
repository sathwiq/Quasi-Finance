import * as React from 'react';
import {Card, CardContent, Typography} from "@mui/material";
import Web3 from "web3";


export default function CardComponent(props) {

    function displayPrice(value) {
        let temp = parseFloat(value).toFixed(4);
        return  temp + " eth";
    }

    return (
        <Card sx={{minWidth: 275}} style={{cursor: "pointer"}}>
            <CardContent>
                <img style={{height: "250px", width: "100%", marginBottom: "1vh", borderRadius: "5px"}} src={props.image}
                     alt={"  plane"}/>
                <Typography sx={{fontSize: 14}} color="text.secondary" gutterBottom>
                    {props.name}
                </Typography>
                {props.price &&
                    <Typography sx={{fontSize: 14}} color="text.secondary" gutterBottom>
                        Price : {displayPrice(props.price)}
                    </Typography>
                }
                {props.requiredFunds &&
                    <Typography sx={{fontSize: 14}} color="text.secondary" gutterBottom>
                        Required Funds : {displayPrice(props.requiredFunds)}
                    </Typography>
                }
                {props.collateral &&
                    <Typography sx={{fontSize: 14}} color="text.secondary" gutterBottom>
                        Collateral : {displayPrice(props.collateral)}
                    </Typography>
                }
            </CardContent>
        </Card>
    );
}