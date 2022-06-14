import {useNavigation} from "react-navi";
import AppBar from "@mui/material/AppBar";
import {Link, Stack, Typography} from "@mui/material";
import * as React from 'react';

export function TopNav() {
    let navigation = useNavigation();

    function navigateToHome() {
        navigation.navigate("/");
    }

    return (
        <AppBar position="fixed" sx={{zIndex: (theme) => theme.zIndex.drawer + 1}}>
            <div style={{padding: "1vh 1vw"}}>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                    <div>
                        <Typography variant="h6" noWrap component="div" style={{cursor: "pointer"}}
                                    onClick={navigateToHome}>
                            Quasi Finance
                        </Typography>
                    </div>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Link href={`/funded-items`} noWrap underline="hover">Funded Items</Link>
                        <Link href={`/market-place`} noWrap underline="hover">Market Place</Link>
                        <Link href={`/market-place/create-nft`} noWrap underline="hover">Create NFT</Link>
                    </Stack>
                </Stack>
            </div>
        </AppBar>
    )
}