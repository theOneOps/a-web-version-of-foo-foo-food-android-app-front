export const cartModule = {
    namespaced: true, state() {
        return {
            cartItems: JSON.parse(localStorage.getItem("cartItems")) || [],
            currentRestaurantId: localStorage.getItem("currentRestaurantId") || null,
        };
    }, mutations: {
        ADD_TO_CART(state, dish) {
            const item = state.cartItems.find((item) => item.id === dish.id);
            if (item) {
                item.quantity += dish.quantity || 1;
            } else {
                state.cartItems.push({...dish, quantity: dish.quantity || 1});
            }
            localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
        }, SET_CURRENT_RESTAURANT_ID(state, restaurantId) {
            state.currentRestaurantId = restaurantId;
            localStorage.setItem("currentRestaurantId", restaurantId);
        }, CLEAR_CART(state) {
            state.cartItems = [];
            state.currentRestaurantId = null;
            localStorage.removeItem("cartItems");
            localStorage.removeItem("currentRestaurantId");
        }, UPDATE_QUANTITY(state, {dishId, quantity}) {
            const item = state.cartItems.find((item) => item.id === dishId);
            if (item) {
                item.quantity = quantity;
                if (item.quantity <= 0) {
                    state.cartItems = state.cartItems.filter((item) => item.id !== dishId);
                }
            }
            localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
        }, REMOVE_FROM_CART(state, dishId) {
            state.cartItems = state.cartItems.filter((item) => item.id !== dishId);
            localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
        },
    }, getters: {
        cartItems: (state) => state.cartItems,
        cartTotalPrice: (state) => state.cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
        cartItemCount: (state) => state.cartItems.reduce((count, item) => count + item.quantity, 0),
        currentRestaurantId: (state) => state.currentRestaurantId,
    },
};
