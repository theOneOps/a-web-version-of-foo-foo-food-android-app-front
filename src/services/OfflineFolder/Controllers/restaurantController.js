import {db} from "../db";

export const restaurantController = {
    async addRestaurant(restaurant) {
        return await db.restaurants.put(restaurant);
    },

    async getRestaurantById(id) {
        return await db.restaurants.get(id);
    },

    async getAllRestaurants() {
        return await db.restaurants.toArray();
    },

    async updateRestaurant(id, updatedData) {
        return await db.restaurants.update(id, updatedData);
    },

    async deleteRestaurant(id) {
        return await db.restaurants.delete(id);
    }
};