export default {
    namespaced: true, state: {
        restaurants: [], // Stocke les restaurants
    }, mutations: {
        setRestaurants(state, restaurants) {
            state.restaurants = restaurants;
        },
    }, actions: {}, getters: {
        getRestaurants(state) {
            return state.restaurants;
        },
    },
};
