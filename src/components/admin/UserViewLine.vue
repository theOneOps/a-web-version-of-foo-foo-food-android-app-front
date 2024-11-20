<script setup>
import {onBeforeUnmount, onMounted, ref, watch} from "vue";
import api from "../../services/api"

const props = defineProps({
  user: Object,
  idx: String,
  updateArray: Function
});

const windowWidth = ref(window.innerWidth);
const truncatedAddress = ref("");

const truncateId = ref("");

// Fonction pour formater l'adresse
function formatAddress(address) {
  return `${address.number} ${address.street}, ${address.city}, ${address.state}, ${address.zipCode}, ${address.country}`;
}

// Fonction pour tronquer l'adresse si la largeur est inférieure à 1000px
function truncateAddress(address) {
  if (!address) return "no Address"; // Vérifie si l'adresse est définie

  if (windowWidth.value < 1290) {
    let truncatedAdr = "";
    if (address.city !== undefined) truncatedAdr += address.city;
    if (address.state !== undefined) truncatedAdr += `, ${address.state}`;
    return truncatedAdr !== "" ? truncatedAdr : "no Address";
  }

  return formatAddress(address);
}

function truncateTheId() {
  return props.user && props.user._id
      ? props.user._id.slice(0, 8) + "..."
      : "no ID";
}

// Met à jour la largeur de la fenêtre à chaque redimensionnement
function handleResize() {
  windowWidth.value = window.innerWidth;
}

// Regarde si la taille de la fenêtre change
onMounted(() => {
  window.addEventListener("resize", handleResize);

  if (props.user && props.user.address) {
    truncatedAddress.value = truncateAddress(props.user.address);
  }

  if (props.user && props.user._id) {
    truncateId.value = truncateTheId();
  }
});

watch(windowWidth, () => {
  if (props.user && props.user.address) {
    truncatedAddress.value = truncateAddress(props.user.address);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});

// Regarder la largeur de la fenêtre pour mettre à jour l'adresse
watch(windowWidth, () => {
  truncatedAddress.value = truncateAddress(props.user.address);
});


async function deleteUser() {

  try {
    const response = await api.delete(
        `users/delete-account/${props.user._id}`);
    if (response.status === 200) {
      props.updateArray(props.user._id)
    } else {
      console.log("Erreur de suppression de l'utilisateur.");
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
  }
}
</script>

<template>
  <tr>
    <td>{{ truncateId }}</td>
    <td>{{ props.user.name }}</td>
    <td>{{ props.user.email }}</td>
    <td>{{ props.user.role }}</td>
    <td>{{ truncatedAddress }}</td>
    <!-- Utilisation de l'adresse tronquée -->
    <td class="flex space-x-2 items-center">
      <RouterLink
          :to="{ name: 'EditUserForm', params: { id: props.user._id } }">
        <v-btn small>Edit</v-btn>
      </RouterLink>

      <v-btn color="error" small @click="deleteUser">Supprimer</v-btn>
    </td>
  </tr>
</template>
