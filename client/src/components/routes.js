import React from 'react'
import {map, mount, redirect, route} from 'navi'
import Details from "./Details/Details";
import MarketPlaceComponent from "./MarketPlace/MarketPlace";
import HomeComponent from "./Quasi/Home";
import MyItemsComponent from "./Quasi/MyItems";
import CreateNFT from "./MarketPlace/CreateNFT";
import Admin from "./Quasi/Admin";

const routes = mount({

    '/': route({
            view: <HomeComponent/>
        }
    ),
    '/funded-items': route({
            view: <MyItemsComponent/>
        }
    ),
    '/market-place': route({
            view: <MarketPlaceComponent/>
        }
    ),
    '/market-place/create-nft': route({
            view: <CreateNFT/>
        }
    ),

    '/market-place/details/:id': route(async req => {
        console.log('params', req.params);

        let {id} = req.params;

        return {
            view: <Details marketPlace={true} id={id}/>,
        }
    }),

    '/details/:id': map( req => {
        console.log('params', req.params);

        let {id} = req.params;

        return redirect("/funding/details/"+id);
    }),

    '/funded-items/details/:id': map( req => {
        console.log('params', req.params);

        let {id} = req.params;

        return redirect("/funding/details/"+id);
    }),

    '/funding/details/:id': route(async req => {
        console.log('params', req.params);

        let {id} = req.params;

        return {
            view: <Details id={id} funderView={true}/>,
        }
    }),

    '/admin': route(async req => {
        console.log('params', req.params);

        let {id} = req.params;

        return {
            view: <Admin/>,
        }
    })
});

export default routes