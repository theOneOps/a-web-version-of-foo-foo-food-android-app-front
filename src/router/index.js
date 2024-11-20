import {createRouter, createWebHistory} from "vue-router";
import UsersView from "../views/admin/UsersView.vue";
import RestaurantsView from "../views/admin/RestaurantsView.vue";
import EditUserFormView from "../views/admin/EditUserFormView.vue";
import EditRestaurantFormView from "../views/admin/EditRestaurantFormView.vue";
import LoginView from "../views/auth/LoginView.vue";
import RegistrationView from "../views/auth/RegistrationView.vue";
import DeliveryView from "../views/delivery/DeliveryView.vue";
import HomeView from "../views/HomeView.vue";
import NotFoundView from "../views/NotFoundView.vue";
import RestaurantView from "../views/client/RestaurantView.vue";
import OrderHistoryView from "../views/client/OrderHistoryView.vue";
import CartView from "../views/client/CartView.vue";
import ChooseRoleView from "../views/auth/ChooseRoleView.vue";
import ProfileView from "../views/client/ProfileView.vue";
import EditProfile from "../views/client/EditProfile.vue";
import NotificationsView from "@/views/NotificationsView.vue";

import store from "../store";

import api from "../services/api";

const isAuthenticated = async () => {
    try {
        const response = await api.get("users/auth/check");
        return {
            authenticated: response.data.authenticated, role: response.data.role, email: response.data.email,
        };
    } catch (error) {
        console.error("Authentication check error:", error);
        return false;
    }
};

const routes = [// Routes privées
    // Routes admin
    {
        path: "/admin/Users", name: "UsersView", component: UsersView, meta: {requiresAuth: true, role: "admin"},
    }, {
        path: "/admin/Users/:id",
        name: "EditUserForm",
        component: EditUserFormView,
        props: true,
        meta: {requiresAuth: true, role: "admin"},
    }, {
        path: "/admin/Restaurants",
        name: "RestaurantsView",
        component: RestaurantsView,
        meta: {requiresAuth: true, role: "admin"},
    }, {
        path: "/admin/Restaurants/:id",
        name: "EditRestaurantForm",
        component: EditRestaurantFormView,
        props: true,
        meta: {requiresAuth: true, role: "admin"},
    }, // routes pour le livreur
    {
        path: "/delivery", name: "DeliveryView", component: DeliveryView, meta: {requiresAuth: true, role: "livreur"},
    }, {
        path: "/auth/chooseRole/:email",
        name: "ChooseRoleView",
        component: ChooseRoleView,
        props: true,
        meta: {requiresAuth: false},
    }, // Routes publiques
    {
        path: "/", name: "HomeView", component: HomeView, meta: {requiresAuth: false},
    }, {
        path: "/auth/login", name: "LoginView", component: LoginView, meta: {requiresAuth: false},
    }, {
        path: "/auth/registration", name: "RegistrationForm", component: RegistrationView, meta: {requiresAuth: false},
    },

    {
        path: "/:pathMatch(.*)*", name: "notFound", component: NotFoundView, meta: {requiresAuth: false},
    }, {
        path: "/restaurant/:restaurantId",
        name: "RestaurantView",
        component: RestaurantView,
        meta: {requiresAuth: false},
        props: true,
    }, {
        path: "/orders",
        name: "OrderHistoryView",
        component: OrderHistoryView,
        meta: {requiresAuth: true, role: "client"},
    }, {
        path: "/cart", name: "CartView", component: CartView, meta: {
            requiresAuth: false, // role: 'client'
        },
    }, {
        path: "/profile", name: "ProfileView", component: ProfileView, meta: {requiresAuth: true},
    }, {
        path: "/profile/edit", name: "EditProfile", component: EditProfile, meta: {requiresAuth: true},
    }, {
        path: "/notifications", name: "Notifications", component: NotificationsView, meta: {requiresAuth: true},
    }];

const router = createRouter({
    history: createWebHistory(import.meta.BASE_URL), routes,
});

router.beforeEach(async (to, from, next) => {
    // Avant de vérifier la connexion, sauvegarder l'état actuel de la connexion
    // // Vérifiez la connexion à chaque changement de route
    await store.dispatch("connection/checkConnection");

    // Vérification de l'authentification
    if (to.meta.requiresAuth) {
        const {authenticated, role} = await isAuthenticated();
        if (!authenticated) {
            // Rediriger vers login si non authentifié
            next({name: "LoginView", query: {redirect: to.fullPath}});
        } else if (to.meta.role && to.meta.role !== role) {
            next({name: "notFound"}); // ou page not found quand l'user not allowed
        } else {
            next();
        }
    } else {
        next();
    }
});

export default router;
