<script setup>
import {ref} from "vue";
import {useStore} from "vuex";

import api from "../../services/api";

import {useRouter} from "vue-router";
import io from "socket.io-client";

const store = useStore();

const socket = io("http://localhost:3000"); // Remplacez par l'URL de votre serveur

// Références pour l'email, le mot de passe et un message d'erreur
const email = ref("");
const password = ref("");
const message = ref("");

const overlay = ref(true);
const showPassword = ref(false);
const route = useRouter();

// Règles de validation
const rules = {
  required: (value) => !!value || "Ce champ est requis.",
  minLength: (value) =>
      (value && value.length >= 6) || "Le mot de passe doit contenir au moins 6 caractères.",
  email: (value) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || "Email invalide.",
};

// Validation dynamique des champs
const emailError = ref("");
const passwordError = ref("");

const validateEmail = () => {
  const requiredError = rules.required(email.value);
  const emailFormatError = rules.email(email.value);

  emailError.value =
      requiredError !== true ? requiredError : emailFormatError !== true ? emailFormatError : "";
};

const validatePassword = () => {
  const requiredError = rules.required(password.value);
  const lengthError = rules.minLength(password.value);

  passwordError.value =
      requiredError !== true ? requiredError : lengthError !== true ? lengthError : "";
};

// Affichage ou masquage du mot de passe
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const connectSocket = (email) => {
  socket.on("connect", () => {
    socket.emit("join", email); // Rejoindre la salle spécifique
    socket.on("orderStatusUpdated", (data) => {
      console.log("Statut de la commande mis à jour :", data.status);
    });
  });
}

// Fonction pour gérer la soumission du formulaire
const submitForm = async () => {
  if (!email.value || !password.value) {
    message.value = "Veuillez remplir tous les champs.";
    return;
  }

  try {
    const response = await api.post("users/auth/login", {
      email: email.value,
      password: password.value,
    });

    if (response.status === 200) {
      connectSocket(response.data.user.email);
      message.value = "Connexion réussie !";
      // Sauvegarder les informations de l'utilisateur dans le store Vuex
      // Utilisation correcte de commit (sans `this`)
      store.commit("auth/USER_AUTHENTICATED", response.data.user); // Remplace `store` par ta référence à Vuex store
      if (response.data.user.role == "admin") {
        route.push({name: "UsersView"});
      } else if (response.data.user.role == "livreur") {
        route.push({name: "DeliveryView"});
      } else if (response.data.user.role == "restaurateur") {
        if (!response.data.user.restaurantId || response.data.user.restaurantId == null) { // if there is a restaurant for the user
          route.push({
            name: "RestaurantView",
            params: {restaurantId: "norestaurant"},
          });
        } // push to the correct route
        else {
          route.push({
            name: "RestaurantView",
            params: {restaurantId: response.data.user.restaurantId},
          });
        }
      } else { // si c'est un client
        route.push({name: "HomeView"});
      }
      console.log("Service Worker:", navigator.serviceWorker);
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;

        if (registration.active) {
          registration.active.postMessage({
            type: 'registerUser',
            userId: response.data.user.email,
          });
          console.log('Message envoyé au Service Worker avec userId:', response.data.user.email);
        } else {
          console.error('Service Worker non actif.');
        }
      } else {
        console.warn('Service Workers non pris en charge par le navigateur.');
      }
    } else {
      message.value = "Erreur lors de la connexion.";
    }
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    message.value = "Une erreur est survenue. Veuillez réessayer.";
  }
};


const closeOverlay = () => {
  overlay.value = !overlay.value;
  route.push({name: "HomeView"});
};
</script>

<template>
  <v-overlay v-model="overlay">
    <div class="flex justify-center items-center min-h-screen w-screen h-screen absolute">
      <div class="w-full max-w-sm p-8 bg-white rounded-lg shadow-md">
        <div class="flex justify-end w-full">
          <v-btn color="error" rounded @click="closeOverlay">X</v-btn>
        </div>
        <h2 class="text-3xl font-bold text-center text-black mb-6">
          Connexion
        </h2>

        <form @submit.prevent="submitForm">

          <v-text-field
              v-model="email"
              :error-messages="emailError"
              :rules="[rules.required, rules.email]"
              class="mb-2"
              clearable
              dense
              label="Adresse email"
              outlined
              placeholder="Entrez votre email"
              required
              type="email"
              @blur="validateEmail"
          ></v-text-field>

          <v-text-field
              v-model="password"
              :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              :error-messages="passwordError"
              :rules="[rules.required, rules.minLength]"
              :type="showPassword ? 'text' : 'password'"
              class="mb-2"
              clearable
              dense
              label="Mot de passe"
              outlined
              placeholder="Entrez votre mot de passe"
              required
              @blur="validatePassword"
              @click:append="togglePasswordVisibility"
          ></v-text-field>

          <!-- Message d'erreur ou de succès -->
          <div v-if="message" class="text-center text-red-500 mb-4">
            {{ message }}
          </div>

          <!-- Bouton de soumission -->
          <div class="w-full flex justify-center">
            <button class="w-1/2 py-2 px-4 bg-[#F36527] text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="submit">
              SE CONNECTER
            </button>
          </div>
        </form>
      </div>
    </div>
  </v-overlay>
</template>
