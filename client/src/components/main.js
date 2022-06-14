import * as React from 'react';
import {Router, View} from "react-navi";
import routes from "./routes";
import NftProvider from "../providers/nft.provider";
import {InitContracts} from "./initContracts";
import {TopNav} from "./topNav";

export default function Main() {
    return (
        <NftProvider>
            <InitContracts></InitContracts>
            <Router routes={routes}>
                <React.Suspense fallback={<div>Loading</div>}>

                    <TopNav/>
                    <div style={{minHeight: "100%", paddingTop: "10vh"}}>
                        <View/>
                    </div>
                </React.Suspense>
            </Router>
        </NftProvider>
    );
}

