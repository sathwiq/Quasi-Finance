import * as React from "react";
import {Grid, Typography} from "@mui/material";
import CardComponent from "../../common/CardComponent";
import {useNavigation,useCurrentRoute} from "react-navi";
import useNft from "../../hooks/useNft";
import {update_nft_item} from "../../reducers/nft.reducer";
import * as yup from "yup";
import Filters from "./Filters";



export default function CollectionComponent(props) {

    const {NftDispatch} = useNft()

    let navigation = useNavigation();
    let route = useCurrentRoute();


    function open(item) {
        console.log("open", item);
        NftDispatch({
            type: update_nft_item,
            payload: item
        });

        let router= route.url.pathname;

        if (router === '/'){
            router = "";
        }
        navigation.navigate(  router+"/details/" + item.itemId);
    }

    return (
        <Grid container spacing={5}>
            <Grid item xs={2}>
                <Filters/>
            </Grid>
            <Grid item xs>
                <Typography
                    style={{borderBottom: "1px solid grey", paddingBottom: "1vh", marginBottom: "2vh"}}
                    variant="h5" color="text.secondary" gutterBottom>
                    {props.heading}
                </Typography>
                <Grid container spacing={2}>
                    {
                        props.items.length > 0 ?
                            props.items.map(value =>
                                <Grid item xs={2}  key={value.itemId}>
                                    <div style={{cursor: "pointer"}} onClick={() => open(value)}>
                                        <CardComponent name={value.name} image={value.tokenURI} price={value.price}
                                                       requiredFunds={value.requestedFunding}
                                                       collateral={value.collateral}/>
                                    </div>
                                </Grid>
                            )
                            :
                            <Grid item xs={3}>
                                <Typography
                                    variant="h5" color="text.secondary" gutterBottom>
                                    No Items Available
                                </Typography>
                            </Grid>
                    }
                </Grid>
            </Grid>
        </Grid>
    );
}