import Dexie from 'dexie';

export const db = new Dexie('myDatabase');
db.version(1).stores({
    restaurants: "_id, name, speciality, userId",
    menus: "_id, name, category, restaurantId, price",
    orders: "_id, clientEmail, restaurantName, status, createdAt"
});
