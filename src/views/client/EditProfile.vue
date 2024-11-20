<script setup>
import {ref} from "vue";
import {useStore} from "vuex";
import api from "../../services/api";

const store = useStore();

// Récupération des données utilisateur depuis le store Vuex
const user = ref(store.getters["auth/getAuthState"]);
const email = ref(store.getters["auth/getUserEmail"]);
const address = ref(store.getters["auth/getUserAddress"] || {
  number: "",
  street: "",
  city: "",
  zipCode: "",
  state: "",
  country: "",
});

const noAddress = address.value.number === "";

// État pour afficher les messages de validation ou d'erreur
const emailMessage = ref("");
const addressMessage = ref("");

// Règles de validation
const rules = {
  required: (value) => !!value || "Ce champ est requis.",
  email: (value) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || "Email invalide.",
};

// Fonction pour enregistrer l'email
const saveEmail = async () => {
  if (!email.value) {
    emailMessage.value = "Veuillez fournir une adresse email valide.";
    return;
  }

  try {
    const response = await api.put("users/auth/update-email", {previousEmail: user.value.email, email: email.value});
    if (response.status === 200) {
      emailMessage.value = "Email mis à jour avec succès !";
      store.commit("auth/USER_AUTHENTICATED", {...user.value, email: email.value});
      user.value = store.getters["auth/getAuthState"];
    } else {
      emailMessage.value = "Une erreur est survenue lors de la mise à jour de l'email.";
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'email :", error);
    emailMessage.value = "Impossible de mettre à jour l'email. Réessayez.";
  }
};

// Fonction pour enregistrer l'adresse
const saveAddress = async () => {
  if (!address.value || !address.value.street || !address.value.city || !address.value.country) {
    addressMessage.value = "Veuillez remplir tous les champs obligatoires.";
    return;
  }

  try {
    console.log("Adresse:", address.value);
    const response = await api.put("users/auth/update-address", {
      number: address.value.number,
      street: address.value.street,
      city: address.value.city,
      zipCode: address.value.zipCode,
      state: address.value.state,
      country: address.value.country,
    })

    if (response.status === 200) {
      addressMessage.value = "Adresse mise à jour avec succès !";
      // Met à jour l'utilisateur dans Vuex
      store.commit("auth/USER_AUTHENTICATED", {...user.value, address: address.value});
      user.value = store.getters["auth/getAuthState"];
    } else {
      addressMessage.value = "Une erreur est survenue lors de la mise à jour de l'adresse.";
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'adresse :", error);
    addressMessage.value = "Impossible de mettre à jour l'adresse. Réessayez.";
  }
};
</script>

<template>
  <div class="flex justify-center mt-10 mb-10">
    <div class="w-50 p-6 bg-white rounded-lg shadow-md">
      <h1 class="text-2xl font-bold mb-6 text-center">Modifier mon profil</h1>

      <!-- Section pour modifier l'email -->
      <div class="mb-6 w-50">
        <h2 class="text-lg font-semibold mb-2">Modifier l'email</h2>
        <v-text-field
            v-model="email"
            :rules="[rules.required, rules.email]"
            clearable
            dense
            outlined
            placeholder="Entrez votre nouvel email"
            required
            type="email"
        ></v-text-field>

        <!-- Bouton pour enregistrer l'email -->
        <button
            class="mt-4 bg-[#F36527] text-white px-4 py-2 rounded hover:bg-[#F36527]"
            @click="saveEmail"
        >
          Enregistrer l'email
        </button>

        <!-- Message de succès ou d'erreur pour l'email -->
        <div v-if="emailMessage" class="mt-2 text-center text-red-500">
          {{ emailMessage }}
        </div>
      </div>

      <!-- Section pour modifier l'adresse -->
      <div>
        <h2 class="text-lg font-semibold mb-2">Modifier l'adresse</h2>
        <div v-if="noAddress">
          <p class="text-gray-500 mb-2">Aucune adresse n'est actuellement enregistrée.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Numéro et rue -->
          <v-text-field
              v-model="address.number"
              class="md:col-span-1"
              dense
              label="Numéro *"
              outlined
              placeholder="Entrez le numéro de rue"
          ></v-text-field>
          <v-text-field
              v-model="address.street"
              class="md:col-span-1"
              dense
              label="Rue *"
              outlined
              placeholder="Entrez le nom de la rue"
          ></v-text-field>

          <!-- Ville et code postal -->
          <v-text-field
              v-model="address.city"
              class="md:col-span-1"
              dense
              label="Ville *"
              outlined
              placeholder="Entrez la ville"
          ></v-text-field>
          <v-text-field
              v-model="address.zipCode"
              class="md:col-span-1"
              dense
              label="Code postal"
              outlined
              placeholder="Entrez le code postal"
          ></v-text-field>

          <!-- Etat ou région et pays -->
          <v-text-field
              v-model="address.state"
              class="md:col-span-1"
              dense
              label="Etat ou région"
              outlined
              placeholder="Entrez l'état ou la région"
          ></v-text-field>
          <v-text-field
              v-model="address.country"
              class="md:col-span-1"
              dense
              label="Pays *"
              outlined
              placeholder="Entrez le pays"
          ></v-text-field>
        </div>

        <!-- Bouton pour enregistrer l'adresse -->
        <button
            class="mt-4 bg-[#F36527] text-white px-4 py-2 rounded hover:bg-[#F36527]"
            @click="saveAddress"
        >
          Enregistrer l'adresse
        </button>

        <!-- Message de succès ou d'erreur pour l'adresse -->
        <div v-if="addressMessage" class="mt-2 text-center text-red-500">
          {{ addressMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
