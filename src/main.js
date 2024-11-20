import {createApp} from "vue";
import {Carousel3dPlugin} from "@nanoandrew4/vue3-carousel-3d";
import App from "./App.vue";
import store from "./store";
import "./style.css";
import "@nanoandrew4/vue3-carousel-3d/dist/style.css";
import "vuetify/styles";
import {createVuetify} from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import {mdi} from 'vuetify/iconsets/mdi';
import "@mdi/font/css/materialdesignicons.css";
import router from "./router";

const vuetify = createVuetify({
    components, directives, icons: {
        defaultSet: 'mdi', // Set default icon set to MDI
        sets: {
            mdi,
        },
    }
});

const app = createApp(App)
    .use(vuetify)
    .use(router)
    .use(store)
    .use(Carousel3dPlugin)
    .mount("#app");


// Enregistrer le Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/service-worker.js')
            .then((registration) => {
                console.log('Service Worker enregistré:', registration);
            })
            .catch((error) => {
                console.error('Erreur lors de l\'enregistrement du Service Worker:', error);
            });
    });
}


if ('Notification' in window && navigator.serviceWorker) {
    Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
            console.log('Permission pour les notifications accordée');
        }
    });
}

navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CONNECTIVITY_STATUS') {
        const isOffline = event.data.offline;

        // Si vous utilisez une bibliothèque de notification comme vue-toastification
        if (app.$toast) {
            app.$toast({
                type: isOffline ? 'warning' : 'success',
                title: isOffline ? 'Mode hors ligne' : 'Connexion rétablie',
                message: isOffline ? 'Vous êtes actuellement en mode hors ligne' : 'Vous êtes de nouveau connecté à Internet'
            });
        }
        // Alternative avec alert si vous n'avez pas de système de notification
        else {
            alert(isOffline ? 'Vous êtes actuellement en mode hors ligne' : 'Vous êtes de nouveau connecté à Internet');
        }
    }
});
