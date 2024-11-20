<script setup>
import {ref} from "vue";
import api from "../../services/api"
// Déclarez les variables nécessaires
const restaurantName = ref("");
const message = ref("");

const {increaseUsersArray} = defineProps({
  increaseUsersArray: Function
})

// Fonction pour soumettre le formulaire
const submitForm = async () => {
  try {
    if (!restaurantName.value.trim()) {
      message.value = "Veuillez entrer un nom de restaurant.";
      return;
    }

    // Appel API avec les champs attendus
    const response = await api.post(
        "restaurants",
        {
          name: restaurantName.value,
          // Ajoutez ici d'autres champs si nécessaire
          address: {
            country: "No country",
            city: "No city",
            number: "No number",
            street: "No street",
          }, // Par exemple, si vous avez des données d'adresse
          speciality: "Aucune",
          phone: "+33612345678",
          openingHours: "10:00 - 22:00",
          items: [],
          rating: 0,
          imageUrl: "",
          userId: null,
        }
    );

    if (response.status === 201) {
      message.value = "Restaurant ajouté avec succès !";
      restaurantName.value = ""; // Réinitialisez le champ après succès
      increaseUsersArray(response.data.restaurant)
    } else {
      message.value = "Erreur lors de l’ajout du restaurant.";
    }
  } catch (error) {
    console.error("Erreur lors de l’ajout du restaurant :", error);
    message.value = "Une erreur est survenue. Veuillez réessayer.";
  }
};
</script>

<template>
  <v-form class="pa-4">
    <!-- Champ de saisie pour le nom du restaurant -->
    <v-container>
      <v-row class="mb-4" justify="center">
        <v-col cols="12" md="6">
          <v-text-field
              v-model="restaurantName"
              dense
              label="Nom du Restaurant"
              outlined
              placeholder="Entrez le nom du restaurant"
              required></v-text-field>
        </v-col>
      </v-row>

      <!-- Bouton de soumission -->
      <v-row class="mt-4" justify="center">
        <v-col cols="12" md="4">
          <v-btn block color="primary" @click="submitForm">Ajouter</v-btn>
        </v-col>
      </v-row>

      <!-- Message d'erreur ou de succès -->
      <v-row class="mt-2" justify="center">
        <v-col cols="12" md="6">
          <p
              :class="{
              'text-success': message === 'Restaurant ajouté avec succès !',
              'text-error': message !== 'Restaurant ajouté avec succès !',
            }"
              class="text-center">
            {{ message }}
          </p>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>
