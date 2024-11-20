import {db} from "../db";


export const menuController = {
    async addMenu(menu) {
        return await db.menus.put(menu);
    },

    async getMenuById(id) {
        return await db.menus.get(id);
    },

    async getSomeMenus() {
        return await db.menus.toArray();
    },

    async getAllMenus() {
        return await db.menus.toArray();
    },

    async getMenusByRestaurant(restaurantId) {
        return await db.menus.where('restaurantId').equals(restaurantId).toArray();
    },

    async getMenusByCategory(category) {
        return await db.menus.where('category').equals(category).toArray();
    },

    async deleteMenu(id) {
        return await db.menus.delete(id);
    }
};