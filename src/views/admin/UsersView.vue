<script setup>
import {computed, onMounted, ref} from "vue";
import UserViewLine from "../../components/admin/UserViewLine.vue";
import api from "../../services/api"

const usersRef = ref([]);
const page = ref(1); // Page actuelle
const itemsPerPage = 15;

// Données des filtres
const searchByName = ref("");
const role = ref("tous les rôles");

// Calcul du nombre total d'items
const totalItems = computed(() => filteredUsers.value.length);

// Fonction pour filtrer les utilisateurs
const filteredUsers = computed(() => {
  return usersRef.value.filter((user) => {
    const matchesName = user.name
        .toLowerCase()
        .includes(searchByName.value.toLowerCase());
    const matchesRole =
        role.value === "tous les rôles" || user.role === role.value;
    return matchesName && matchesRole;
  });
});

// Utilisateurs à afficher en fonction de la page courante
const paginatedUsers = computed(() => {
  const start = (page.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredUsers.value.slice(start, end);
});

// Fonction pour récupérer les utilisateurs depuis le backend
const fetchUsers = async () => {
  try {
    const response = await api.get(
        "users/all"
    );
    usersRef.value = response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);
  }
};

const updateArray = (idx) => {
  usersRef.value = usersRef.value.filter((el) => el._id !== idx);
};

// Récupération initiale des utilisateurs
onMounted(async () => {
  await fetchUsers();
});

console.log(Math.ceil(totalItems.value / itemsPerPage));
</script>

<template>
  <div class="flex justify-center w-full">
    <div class="flex justify-center items-center space-x-4 w-96">
      <v-select
          min-width="240px"
          v-model="role"
          :items="['restaurateur', 'client', 'livreur', 'tous les rôles']"
          label="Rôle"></v-select>
      <v-text-field
          min-width="240px"
          v-model="searchByName"
          hint="Entre le nom d'un user"
          label="Nom de l'user"
          type="input"></v-text-field>
    </div>
  </div>

  <v-form>
    <v-container>
      <v-table>
        <thead>
        <tr>
          <th class="text-left">ID</th>
          <th class="text-left">Nom</th>
          <th class="text-left">Email</th>
          <th class="text-left">Rôle</th>
          <th class="text-left">Adresse</th>
          <th class="text-center">Actions</th>
        </tr>
        </thead>
        <tbody>
        <UserViewLine
            v-for="user in paginatedUsers"
            :key="user.email"
            :idx="user._id"
            :updateArray="updateArray"
            :user="user"/>
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
