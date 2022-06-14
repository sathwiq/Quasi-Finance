import {useContext} from "react";
import {NftContext} from "../providers/nft.provider";

export default function useNft(){
    const context = useContext(NftContext);
    return {...context}
}