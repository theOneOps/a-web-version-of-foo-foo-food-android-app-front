import {db} from "../db";

export const orderController = {
    async addOrder(order) {
        return await db.orders.put(order);
    },

    async getOrderById(id) {
        return await db.orders.get(id);
    },

    async getOrdersByClient(clientEmail) {
        return await db.orders.where('clientEmail').equals(clientEmail).toArray();
    },

    async getOrdersByStatus(status) {
        return await db.orders.where('status').equals(status).toArray();
    },

    async deleteOrder(id) {
        return await db.orders.delete(id);
    }
};