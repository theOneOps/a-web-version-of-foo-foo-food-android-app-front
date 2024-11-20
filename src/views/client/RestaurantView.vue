<script setup>
import {useRoute, useRouter} from 'vue-router';
import Restaurant from "@/components/client/Restaurant.vue";
import {computed} from "vue";

const route = useRoute();
const restaurantId = computed(() => route.params.restaurantId);

const routes = useRouter()
const redirectToHome = () => routes.push({name: "HomeView"})

</script>

<template>
  <div v-if="restaurantId == 'norestaurant'">
    <div class="flex flex-col w-screen h-screen justify-around items-center">
      <p class="text-4xl text-center">En attente de l'admin pour vous attribuer le restaurant</p>
      <v-btn @click="redirectToHome">Retourner sur la page d'accueil</v-btn>
    </div>
  </div>
  <div v-else>
    <Restaurant :restaurantId="restaurantId"/>
  </div>
</template>

