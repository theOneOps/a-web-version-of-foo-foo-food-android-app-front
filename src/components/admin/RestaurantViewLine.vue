<script setup>
import api from "../../services/api"
import {RouterLink} from "vue-router";

// Déclarez vos props ici
const props = defineProps({
  restaurant: Object,
  idx: String,
  updateArray: Function
});

const getLinkStatus = (userId) => {
  return userId !== null ? "est déjà lié" : "n'est pas encore lié";
};

const transformedName = props.restaurant.name.replace(/\s/g, "_"); // Remplace les espaces par des underscores;


async function deleteRestaurant() {
  try {
    const response = await api.delete(`restaurants/${props.restaurant._id}`);
    if (response.status === 200) {
      props.updateArray(props.restaurant._id)
    } else {
      console.log("Erreur de suppression du restaurant.");
    }
  } catch (error) {
    console.error("Erreur lors de la suppression du restaurant:", error);
  }
}


</script>

<template>
  <tr>
    <td>{{ props.restaurant._id }}</td>
    <td>{{ transformedName }}</td>
    <td>{{ getLinkStatus(props.restaurant.userId) }}</td>
    <td class="flex space-x-2 items-center">
      <RouterLink :to="{ name: 'EditRestaurantForm', params: { id: props.restaurant._id } }">
        <v-btn small>Edit</v-btn>
      </RouterLink>
      <v-btn color="error" small @click="deleteRestaurant">Supprimer</v-btn>
    </td>
  </tr>
</template>
