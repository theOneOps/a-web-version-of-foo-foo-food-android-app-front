<script setup>
import {onMounted, ref} from "vue";

import api from "../../services/api"

const props = defineProps({
  id: String, // Reçoit l'email en prop
});

function handleUserData(userData) {
  // Structure par défaut pour l'adresse
  const defaultAddress = {
    number: "No number",
    street: "No street",
    city: "No city",
    country: "No country",
    zipcode: "No zipcode",
  };

  // Utiliser l'adresse de userData ou l'objet par défaut
  const address = userData?.address ? {...defaultAddress, ...userData.address} : defaultAddress;

  return {
    ...userData,
    address,
  };
}

// Références pour stocker l'utilisateur et son adresse
const user = ref({});
const userAddress = ref({
  number: "",
  street: "",
  city: "",
  country: "",
  zipcode: "",
  state: "",
});

// Fonction pour récupérer l'utilisateur par son ID
async function fetchUserById() {
  try {
    const response = await api.get(`users/by/${props.id}`);
    user.value = handleUserData(response.data);

    // L'adresse est déjà traitée dans handleUserData
    userAddress.value = user.value.address;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
  }
}

// Récupérer l'utilisateur lors du montage
onMounted(async () => {
  await fetchUserById();
});

function submitForm() {
  // URL avec l'email dans le chemin
  const url = `users/${user.value.email}/role`;

  // Préparez le corps de la requête avec le rôle mis à jour
  const data = {
    newRole: user.value.role, // Assurez-vous que le rôle mis à jour est bien dans user.value
  };

  // Envoie de la requête PUT pour mettre à jour le rôle
  api.put(url, data) // Utilisation de PUT pour mettre à jour le rôle
      .then((response) => {
        console.log("Rôle mis à jour avec succès :", response.data);
      })
      .catch((error) => {
        console.error(
            "Erreur lors de la mise à jour du rôle :",
            error.response?.data || error
        );
      });
}

// :submit.prevent="submitForm"
</script>

<template>
  <v-form>
    <v-container>
      <!-- Informations de l'utilisateur -->
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
              v-model="user.name"
              disabled
              label="Nom"
              required></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
              v-model="user.email"
              disabled
              label="Email"
              required
              type="email"></v-text-field>
        </v-col>
      </v-row>

      <!-- Rôle de l'utilisateur -->
      <v-row>
        <v-col cols="12" md="6">
          <v-select
              v-model="user.role"
              :items="['restaurateur', 'client', 'livreur']"
              label="Rôle"
              required></v-select>
        </v-col>
      </v-row>

      <!-- Adresse de l'utilisateur -->
      <v-divider class="my-4"></v-divider>
      <h3>Adresse</h3>
      <v-row>
        <v-col cols="12" md="4">
          <v-text-field
              v-model="userAddress.number"
              disabled
              label="Numéro"></v-text-field>
        </v-col>
        <v-col cols="12" md="8">
          <v-text-field
              v-model="userAddress.street"
              disabled
              label="Rue"></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
              v-model="userAddress.city"
              disabled
              label="Ville"></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
              v-model="userAddress.zipCode"
              disabled
              label="Code Postal"></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
              v-model="userAddress.state"
              disabled
              label="État"></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
              v-model="userAddress.country"
              disabled
              label="Pays"></v-text-field>
        </v-col>
      </v-row>

      <!-- Disponibilité pour livraison (affichage conditionnel) -->
      <v-divider class="my-4"></v-divider>
      <v-row>
        <v-col cols="12" md="6">
          <v-checkbox
              v-if="user.role === 'livreur'"
              v-model="user.deliveryAvailability"
              :label="
              user.deliveryAvailability
                ? 'Disponible pour livraison'
                : 'Indisponible pour livraison'
            "
              disabled></v-checkbox>
        </v-col>
      </v-row>

      <!-- Bouton de soumission -->
      <v-row>
        <v-col cols="12">
          <v-btn color="primary" @click="submitForm">Soumettre</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>
