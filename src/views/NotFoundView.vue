<script setup>
import {useRouter} from 'vue-router';

const route = useRouter()
const redirectToHome = () => route.push({name: "HomeView"})
</script>

<template>
  <div class="flex flex-col w-screen h-screen justify-around items-center">
    <p class="text-7xl">Page non disponible</p>
    <v-btn @click="redirectToHome">Retourner à la page d'accueil</v-btn>
  </div>
</template>
