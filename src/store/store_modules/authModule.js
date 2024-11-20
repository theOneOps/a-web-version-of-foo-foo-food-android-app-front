import api from "../../services/api"

export const authModule = {
    namespaced: true, state: {
        user: {
            id: null, name: "", email: "", role: "", connected: "no", restaurantId: null, address: null,
        },
    }, mutations: {
        USER_AUTHENTICATED(state, user) {
            state.user = {
                id: user.id || user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                connected: "yes",
                restaurantId: user.role === 'restaurateur' ? user.restaurantId : null,
                address: user.address ? user.address : null,
            };
            localStorage.setItem("user", JSON.stringify(state.user));
        }, USER_DISCONNECTED(state) {
            state.user = {};
            localStorage.removeItem("user");
        },
    }, getters: {
        getAuthState(state) {
            return state.user;
        }, getUserRole(state) {
            return state.user.role;
        }, getUserRestaurantId(state) {
            return state.user.role === 'restaurateur' ? state.user.restaurantId : null;
        }, getUserName(state) {
            return state.user.name;
        }, getUserAddress(state) {
            return state.user.address;
        }, getUserEmail(state) {
            return state.user.email;
        },
    }, actions: {
        initializeAuthState({commit}) {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                commit("USER_AUTHENTICATED", JSON.parse(storedUser)); // Charger l'utilisateur
            }
        },

        async disconnectState({commit}) {
            try {
                // 1. Appel à l'API pour effectuer la déconnexion côté serveur
                await this.dispatch("auth/logOutBeforeDisconnectState");

                // 2. Nettoyage du localStorage et de l'état du store
                commit("cart/CLEAR_CART", null, {root: true});
                commit("USER_DISCONNECTED");
            } catch (err) {
                console.error("Erreur lors de la déconnexion côté serveur:", err);
            }
        },

        async logOutBeforeDisconnectState() {
            try {
                // Envoi de la requête de déconnexion au back-end avec withCredentials
                const response = await api.post("users/auth/logout")

                if (response.status === 200) {
                    console.log("Déconnexion réussie du côté serveur !");
                } else {
                    console.log("Erreur, déconnexion échouée côté serveur !");
                }
            } catch (err) {
                console.error("Erreur de déconnexion côté serveur:", err);
            }
        },
    },
};
