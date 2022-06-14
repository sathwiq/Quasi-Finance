import { createContext, useReducer, ReactNode } from "react";
import * as React from "react";
import { nftReducer, nftIniSt} from '../reducers/nft.reducer'

export interface  ChildrenType {
    children: React.ReactNode
}

export interface NftIfc {
    NftDispatch: React.Dispatch<any>;
    nftState: NftReducerIfc
}

export interface NftReducerIfc {
    nftItem: Object,
    accounts: Array<string>,
    web3: Object,
    networkId: number,
    nftContract: Object,
    qNftContract: Object,
    quasiFinance: Object,
    marketContract: Object,
    loaded: boolean,
}

export const NftContext = createContext<NftIfc>({
    NftDispatch: () => {},
    nftState:{
        nftItem: {},
        accounts: [],
        web3: {},
        networkId: 0,
        nftContract: {},
        quasiFinance: {},
        marketContract: {},
        loaded: false,
        qNftContract: {}
    }
});

export default function NftProvider(props: ChildrenType) {
    const [nftState, NftDispatch] = useReducer(
        nftReducer,
        nftIniSt
    );
    return (
        <NftContext.Provider
            value={{ nftState,NftDispatch }}
        >
            {props.children}
        </NftContext.Provider>
    );
}

