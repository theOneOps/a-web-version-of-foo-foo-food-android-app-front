<script setup>
import {ref} from "vue";
import {useStore} from "vuex";
import {useRouter} from "vue-router";

import api from "../../services/api";
import io from "socket.io-client";

const store = useStore();
const router = useRouter();

// Références pour l'email, le rôle et un message d'erreur
const selectRole = ref("");
const message = ref("");
const overlay = ref(true);

const socket = io("http://localhost:3000"); // Remplacez par l'URL de votre serveur

const {email} = defineProps({
  email: String,
});

const connectSocket = (email) => {
  socket.on("connect", () => {
    socket.emit("join", email); // Rejoindre la salle spécifique
    socket.on("orderStatusUpdated", (data) => {
      console.log("Statut de la commande mis à jour :", data.status);
    });
  });
};

// Fonction pour gérer la soumission du formulaire
const submitForm = async () => {
  if (!selectRole.value) {
    message.value = "Veuillez choisir un rôle";
    return;
  }

  try {
    console.log(email, selectRole.value);

    // Simuler l'API ou utiliser la vraie API
    message.value = "";

    // Décommenter lorsque l'API est disponible
    const response = await api.post("users/auth/completeRegistration", {
      email: email,
      role: selectRole.value,
    });

    if (response.status === 200) {
      connectSocket(response.data.user.email);
      message.value = "Inscription réussie !"
      store.commit("auth/USER_AUTHENTICATED", response.data.user);
      if (response.data.user.role == "admin") {
        router.push({name: "UsersView"});
      } else if (response.data.user.role == "livreur") {
        router.push({name: "DeliveryView"});
      } else if (response.data.user.role == "restaurateur") {
        if (!response.data.user.restaurantId) { // if there is a restaurant for the user
          router.push({
            name: "RestaurantView",
            params: {restaurantId: "norestaurant"},
          });
        } // push to the correct route
        else {
          router.push({
            name: "RestaurantView",
            params: {restaurantId: response.data.user.restaurantId},
          });
        }
      } else {
        // si c'est un client
        router.push({name: "HomeView"});
      }
    } else {
      message.value = "Erreur lors de l'inscription.";
    }
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    message.value = "Une erreur est survenue. Veuillez réessayer.";
  }
};

const closeOverlay = () => {
  overlay.value = false;
  router.push({name: "HomeView"});
};
</script>
<template>
  <v-overlay v-model="overlay">
    <div
        class="flex justify-center items-center min-h-screen w-screen h-screen absolute">
      <div class="w-full max-w-sm p-8 rounded-lg bg-white shadow-md">
        <div class="flex justify-end w-full">
          <v-btn color="error" @click="closeOverlay">X</v-btn>
        </div>
        <h2 class="text-2xl font-bold text-center text-gray-700 mb-6">
          Choix du type de profil
        </h2>

        <form @submit.prevent="submitForm">
          <v-container>
            <!-- Groupe de radio buttons avec des marges -->
            <div class="radio-group">
              <label
                  :class="{ selected: selectRole === 'client' }"
                  class="radio-item">
                <input
                    v-model="selectRole"
                    class="radio-input"
                    type="radio"
                    value="client"/>
                Client
              </label>

              <label
                  :class="{ selected: selectRole === 'restaurateur' }"
                  class="radio-item">
                <input
                    v-model="selectRole"
                    class="radio-input"
                    type="radio"
                    value="restaurateur"/>
                Restaurateur
              </label>

              <label
                  :class="{ selected: selectRole === 'livreur' }"
                  class="radio-item">
                <input
                    v-model="selectRole"
                    class="radio-input"
                    type="radio"
                    value="livreur"/>
                Livreur
              </label>
            </div>
          </v-container>

          <!-- Bouton de soumission -->
          <button
              class="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4"
              type="submit"
              @click="submitForm">
            Valider
          </button>
        </form>
      </div>
    </div>
  </v-overlay>
</template>

<style scoped>
/* Style général des radio boutons */
.radio-group {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
}

.radio-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.radio-input {
  margin-right: 10px;
  accent-color: #3f51b5; /* Couleur par défaut du radio */
  transition: transform 0.3s ease;
}

.selected {
  font-weight: bold;
  color: #3f51b5; /* Couleur du texte sélectionné */
}

.selected .radio-input {
  transform: scale(1.2); /* Agrandir le radio lorsqu'il est sélectionné */
}

.radio-item:hover {
  background-color: #f0f0f0;
}

.radio-item.selected {
  background-color: #e0e0e0;
}
</style>
