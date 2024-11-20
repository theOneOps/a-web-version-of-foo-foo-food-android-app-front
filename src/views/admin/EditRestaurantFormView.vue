<script setup>
import {onMounted, ref} from "vue";
import api from "../../services/api"

const props = defineProps({
  id: String, // id du restaurant passé en prop
});

const usersRef = ref([]);
const selectId = ref("")
const message = ref("")

// Références pour le restaurant actuel et les utilisateurs non liés
const restaurant = ref({});
const filteredNonRestaurateurs = ref([]);

// Filtrer les utilisateurs sans restaurant lié
function getAllRestaurateursNonLinked() {
  return usersRef.value.filter(
      (el) => !el.restaurantId && el.role === "restaurateur"
  );
}

async function fetchRestaurantById() {
  try {
    const response = await api.get(`restaurants/${props.id}`);
    restaurant.value = response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération du restaurant:", error);
  }
}

const fetchUsers = async () => {
  try {
    const response = await api.get("users/all");
    usersRef.value = response.data; // Assurez-vous que la structure des données correspond
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);
  }
};

const submitForm = async () => {
  try {
    // Vérifiez que l'utilisateur est bien sélectionné
    const selectedUser = usersRef.value.find((el) => el._id === selectId.value);
    if (!selectedUser) {
      message.value = "Aucun utilisateur sélectionné."
      return;
    }

    // Faites un appel API avec l'ID de l'utilisateur et du restaurant
    const response = await api.put(
        `restaurants/linkarestorer/${selectedUser._id}/${props.id}`);

    if (response.status == 200) {
      message.value = "Restaurant lié avec succès !"
    } else {
      message.value = "Échec de la liaison du restaurant"
    }
  } catch (error) {
    console.error(
        "Erreur lors de l'association d'un restaurateur à un restaurant:",
        error
    );
  }
};

// Initialiser les données lors du montage du composant
onMounted(async () => {
  await fetchUsers();
  await fetchRestaurantById();
  filteredNonRestaurateurs.value = getAllRestaurateursNonLinked();
});
</script>

<template>
  <v-form class="pa-4">
    <!-- Section titre avec entête stylisée -->
    <v-container>
      <v-row class="mb-4" justify="center">
        <h2 class="text-center text-lg font-bold">
          Restaurant :
          <span class="text-primary">{{
              restaurant.name || "Non spécifié"
            }}</span>
        </h2>
      </v-row>

      <!-- Sélecteur des utilisateurs non liés -->
      <v-row justify="center">
        <v-col cols="12" md="6">
          <v-select
              v-model="selectId"
              :items="filteredNonRestaurateurs"
              dense
              item-title="name"
              item-value="_id"
              label="Assigner un utilisateur"
              outlined
              placeholder="Choisissez un utilisateur non lié">
          </v-select>
        </v-col>
      </v-row>

      <!-- Bouton de soumission aligné au centre -->
      <v-row class="mt-4" justify="center">
        <v-col cols="12" md="4">
          <v-btn block color="primary" @click="submitForm"> Soumettre</v-btn>
        </v-col>
      </v-row>
    </v-container>
    <p class="text-red-400 text-lg text-center">{{ message }}</p>
  </v-form>
</template>
