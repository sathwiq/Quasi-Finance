import {NftReducerIfc} from '../providers/nft.provider'

const nftIniSt: NftReducerIfc = {
    nftItem: {},
    accounts: [],
    networkId: 0,
    web3: {},
    nftContract: {},
    quasiFinance: {},
    marketContract: {},
    loaded: false,
    qNftContract: {}
};

const update_nft_item = "UPDATE_NFT_ITEM";
const update_accounts_ids = "UPDATE_ACCOUNTS_IDS"
const update_web3 = "UPDATE_WEB3"
const update_network_id = "UPDATE_NETWORK_ID"
const update_nft_contract = "UPDATE_NFT_CONTRACT"
const update_quasi_finance = "UPDATE_QUASI_FI"
const update_market = "UPDATE_MARKET"
const update_loaded = "UPDATE_LOADED"
const update_qNFT_loaded = "UPDATE_QNFT_LOADED"

const nftReducer = (state: any, action: any) => {
    switch (action.type) {
        case update_nft_item:
            return {...state, nftItem: action.payload}
        case update_accounts_ids:
            return {...state, accounts: action.payload}
        case update_web3:
            // console.log(action.payload)
            return {...state, web3: action.payload}
        case update_network_id:
            return {...state, networkId: action.payload}
        case update_nft_contract:
            return {...state, nftContract: action.payload}
        case update_quasi_finance:
            return {...state, quasiFinance: action.payload}
        case update_market:
            return {...state, marketContract: action.payload}
        case update_loaded:
            return {...state, loaded: action.payload}
        case update_qNFT_loaded:
            return {...state, qNftContract: action.payload}
        default:
            return {...state};
    }
};

export {
    nftIniSt,
    nftReducer,
    update_nft_item,
    update_accounts_ids,
    update_web3,
    update_network_id,
    update_market,
    update_nft_contract,
    update_quasi_finance,
    update_loaded,
    update_qNFT_loaded
};