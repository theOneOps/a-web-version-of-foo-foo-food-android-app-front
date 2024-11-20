<script setup>
import {computed, onMounted, ref} from "vue";
import RestaurantViewLine from "../../components/admin/RestaurantViewLine.vue";
import AddNewRestaurant from "./AddNewRestaurantView.vue";
import api from "../../services/api";

// Références et données
const restaurantsRef = ref([]);
const page = ref(1); // Page actuelle
const itemsPerPage = 15;

const searchByName = ref("");
const linkedResto = ref("tous les restaurants");

// Fonction pour filtrer les utilisateurs
const filteredResto = computed(() => {
  return restaurantsRef.value.filter((restaurant) => {
    // Vérifiez que l'objet restaurant est bien défini et possède la propriété 'name'
    if (!restaurant || !restaurant.name) {
      return false; // Exclure les éléments invalides
    }

    const matchesName = restaurant.name
        .toLowerCase()
        .includes(searchByName.value.toLowerCase());
    const matchesLinkStatus =
        linkedResto.value === "tous les restaurants" ||
        (linkedResto.value === "restaurants déjà liés" &&
            restaurant.userId !== null) ||
        (linkedResto.value === "restaurants pas encore liés" &&
            restaurant.userId === null);

    return matchesName && matchesLinkStatus;
  });
});

// Calcul du nombre total d'items
const totalItems = computed(() => filteredResto.value.length);

// Utilisateurs à afficher en fonction de la page courante
const paginatedResto = computed(() => {
  const start = (page.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredResto.value.slice(start, end);
});

const fetchResto = async () => {
  try {
    const response = await api.get("restaurants/admin/allRestaurants");
    restaurantsRef.value = response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);
  }
};

const updateArray = (idx) => {
  restaurantsRef.value = restaurantsRef.value.filter((el) => el._id !== idx);
};

const increaseUsersArray = (obj) => {
  restaurantsRef.value = [...restaurantsRef.value, obj];
};

onMounted(() => {
  fetchResto();
});
</script>
<template>
  <div class="flex justify-center w-full">
    <div class="flex justify-center items-center space-x-4 w-96">
      <v-select
          v-model="linkedResto"
          :items="[
          'restaurants déjà liés',
          'restaurants pas encore liés',
          'tous les restaurants',
        ]"
          label="Lien avec un restaurateur"
          min-width="240px"></v-select>
      <v-text-field
          v-model="searchByName"
          hint="Entre le nom d'un restaurant"
          label="Nom du restaurant"
          min-width="240px"
          type="input">
      </v-text-field>
    </div>
  </div>

  <div class="flex justify-center w-full">
    <AddNewRestaurant :increaseUsersArray="increaseUsersArray"/>
  </div>

  <v-form>
    <v-container>
      <v-table>
        <thead>
        <tr>
          <th class="text-left">ID du restaurant</th>
          <th class="text-left">Nom du restaurant</th>
          <th class="text-left">Status</th>
          <th class="text-left">Actions</th>
        </tr>
        </thead>
        <tbody>
        <RestaurantViewLine
            v-for="resto in paginatedResto"
            :key="resto._id"
            :idx="resto._id"
            :restaurant="resto"
            :updateArray="updateArray"/>
        </tbody>
      </v-table>

      <!-- Pagination -->
      <v-pagination
          v-model="page"
          :length="Math.ceil(totalItems / itemsPerPage)"
          :total-visible="5"
          class="mt-4"
          color="red"/>
    </v-container>
  </v-form>
</template>
