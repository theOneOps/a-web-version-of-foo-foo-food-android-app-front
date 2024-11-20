// store/modules/connection.js

import api from "../../services/api";

export const connectionModule = {
    namespaced: true, state: {
        isConnected: null, // True ou false selon l'état de la connexion
        notificationSent: false, // Pour suivre si la notification a déjà été envoyée
    },

    mutations: {
        setConnectionStatus(state, status) {
            state.isConnected = status;
        }, setNotificationSent(state, status) {
            state.notificationSent = status;
        }, sendNotification(title, body, icon) {
            // if (Notification.permission === "granted") {
            //     new Notification(title, {body, icon});
            // }
            //console.log(`${title} ${body}`)
        }
    }, actions: {
        async checkConnection({commit, state}) {
            try {
                const response = await api.get("status"); // Vérification de l'état de la connexion
                const isOfflineMode = response.data.modeOffline;

                // Fonction utilitaire pour envoyer des notifications

                if (state.isConnected === null) {
                    commit("setConnectionStatus", !isOfflineMode);
                    if (!isOfflineMode) {
                        commit("sendNotification", "Connexion réussie", "Vous êtes connecté au serveur.", "/path/to/icon.png");
                        commit("setNotificationSent", true);
                    }
                } else {
                    // Vérifications des changements d'état
                    if (state.isConnected !== !isOfflineMode) {
                        commit("setConnectionStatus", !isOfflineMode);

                        if (!isOfflineMode) {
                            commit("sendNotification", "Connexion réussie", "Vous êtes reconnecté au serveur.", "/path/to/icon.png");
                        } else {
                            commit("sendNotification", "Connexion échouée", "Vous êtes déconnecté du serveur.", "/path/to/icon.png");
                        }
                        commit("setNotificationSent", true);
                    }
                }
            } catch (err) {
                // Gestion des erreurs de connexion
                if (state.isConnected !== false) {
                    commit("setConnectionStatus", false);
                    commit("sendNotification", "Connexion échouée", "Impossible de joindre le serveur.", "/path/to/icon.png");
                }
            }
        },
    },

    getters: {
        getIsConnected(state) {
            return state.isConnected;
        }, getNotificationSent: (state) => {
            return state.notificationSent;
        },
    },
};

export default connectionModule