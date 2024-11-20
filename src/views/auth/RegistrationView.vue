<script setup>
import {ref} from "vue";
import {useRouter} from "vue-router";
import api from "../../services/api";

// Références pour les champs d'inscription
const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");

// Références pour les messages d'erreur par champ
const nameError = ref("");
const emailError = ref("");
const passwordError = ref("");
const confirmPasswordError = ref("");

// Références pour l'état général
const showPassword = ref(false);
const showPasswordConfirm = ref(false);
const message = ref(""); // Message global
const overlay = ref(true);
const router = useRouter();

// Règles de validation
const rules = {
  required: (value) => !!value || "Ce champ est requis.",
  minLength: (value) =>
      (value && value.length >= 6) || "Le mot de passe doit contenir au moins 6 caractères.",
  email: (value) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || "Email invalide.",
  matchPassword: (value) =>
      value === password.value || "Les mots de passe ne correspondent pas.",
};

// Validation dynamique des champs
const validateName = () => {
  const requiredError = rules.required(name.value);
  nameError.value = requiredError !== true ? requiredError : "";
};

const validateEmail = () => {
  const requiredError = rules.required(email.value);
  const emailFormatError = rules.email(email.value);

  emailError.value = requiredError !== true ? requiredError : emailFormatError !== true ? emailFormatError : "";
};

const validatePassword = () => {
  const requiredError = rules.required(password.value);
  const lengthError = rules.minLength(password.value);

  passwordError.value = requiredError !== true ? requiredError : lengthError !== true ? lengthError : "";
};

const validateConfirmPassword = () => {
  const requiredError = rules.required(confirmPassword.value);
  const matchError = rules.matchPassword(confirmPassword.value);

  confirmPasswordError.value = requiredError !== true ? requiredError : matchError !== true ? matchError : "";
};

// Affichage ou masquage du mot de passe
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const togglePasswordConfirmVisibility = () => {
  showPasswordConfirm.value = !showPasswordConfirm.value;
};

// Fonction pour gérer la soumission du formulaire
const submitForm = async () => {
  // Réinitialiser les erreurs avant la validation
  message.value = "";
  validateName();
  validateEmail();
  validatePassword();
  validateConfirmPassword();

  if (nameError.value || emailError.value || passwordError.value || confirmPasswordError.value) {
    message.value = "Veuillez corriger les erreurs avant de soumettre.";
    return;
  }

  try {
    const response = await api.post("users/auth/register", {
      name: name.value,
      email: email.value,
      password: password.value,
    });

    if (response.status === 201) {
      message.value = "Inscription réussie !";
      router.push({name: "ChooseRoleView", params: {email: email.value}});
    } else {
      message.value = "Erreur lors de l'inscription.";
    }
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    message.value = error.response?.data?.message || "Une erreur est survenue. Veuillez réessayer.";
  }
};

// Fermer l'overlay
const closeOverlay = () => {
  overlay.value = false;
  router.push({name: "HomeView"});
};
</script>

<template>
  <v-overlay v-model="overlay" absolute>
    <div class="flex justify-center items-center min-h-screen w-screen h-screen absolute">
      <div class="w-full max-w-sm p-8 bg-white rounded-lg shadow-md">
        <div class="flex justify-end w-full">
          <v-btn color="error" rounded @click="closeOverlay">X</v-btn>
        </div>
        <h2 class="text-3xl font-bold text-center text-black mb-6">
          Inscription
        </h2>

        <form @submit.prevent="submitForm">
          <!-- Champ Nom -->
          <v-text-field
              v-model="name"
              label="Nom"
              placeholder="Entrez votre nom"
              outlined
              dense
              clearable
              required
              :error-messages="nameError"
              @blur="validateName"
              class="mb-2"
          ></v-text-field>

          <!-- Champ Email -->
          <v-text-field
              v-model="email"
              label="Email"
              placeholder="Entrez votre email"
              type="email"
              outlined
              dense
              clearable
              required
              :error-messages="emailError"
              @blur="validateEmail"
              class="mb-2"
          ></v-text-field>

          <!-- Champ Mot de Passe -->
          <v-text-field
              v-model="password"
              label="Mot de passe"
              placeholder="Entrez votre mot de passe"
              :type="showPassword ? 'text' : 'password'"
              outlined
              dense
              clearable
              required
              :error-messages="passwordError"
              @blur="validatePassword"
              class="mb-2"
              :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append="togglePasswordVisibility"
          ></v-text-field>

          <!-- Champ Confirmation Mot de Passe -->
          <v-text-field
              v-model="confirmPassword"
              label="Confirmez le mot de passe"
              placeholder="Confirmez votre mot de passe"
              :type="showPasswordConfirm ? 'text' : 'password'"
              outlined
              dense
              clearable
              required
              :error-messages="confirmPasswordError"
              @blur="validateConfirmPassword"
              class="mb-2"
              :append-icon="showPasswordConfirm ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append="togglePasswordConfirmVisibility"
          ></v-text-field>

          <!-- Message d'erreur global -->
          <div v-if="message" class="text-center text-red-500 mb-4">
            {{ message }}
          </div>

          <!-- Bouton d'inscription -->
          <div class="w-full flex justify-center items-center">
            <v-btn color="#F36527" class="p-5" type="submit">
              Suivant
            </v-btn>
          </div>
        </form>
      </div>
    </div>
  </v-overlay>
</template>
