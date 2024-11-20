import {createStore} from "vuex";
import {cartModule} from "./store_modules/cartModule";
import {authModule} from "./store_modules/authModule";
import {connectionModule} from "./store_modules/connectionModule";
import menuModule from "@/store/store_modules/menuModule.js";
import restaurantModule from "@/store/store_modules/restaurantModule.js";

export default createStore({
    modules: {
        cart: cartModule,
        auth: authModule,
        connection: connectionModule,
        menu: menuModule,
        restaurant: restaurantModule,
    },
});
