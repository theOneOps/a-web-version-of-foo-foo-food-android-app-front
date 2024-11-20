<script setup>
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { restaurantController } from "../../services/OfflineFolder/Controllers/restaurantController";
import store from "../../store";
import api from "../../services/api";
import lottie from "lottie-web";

const router = useRouter();
const isLoading = ref(true);
const allRestaurants = ref([]);
const lottieContainer = ref(null); // Correctement défini pour ref

function formatAddress(address) {
  let formattedAddress = "";
  if (address) {
    if (address.number) formattedAddress += `${address.number}, `;
    if (address.street) formattedAddress += `${address.street}, `;
    if (address.city) formattedAddress += `${address.city}, `;
    if (address.state) formattedAddress += `${address.state}, `;
    if (address.zipCode) formattedAddress += `${address.zipCode}, `;
    if (address.country) formattedAddress += address.country;
  } else {
    formattedAddress = "No address";
  }
  return formattedAddress;
}

const fetchRestaurants = async () => {
  isLoading.value = true;
  try {
    const response = await api.get("restaurants");
    const restaurants = response.data;

    // Stocke les restaurants dans IndexedDB
    for (const restaurant of restaurants) {
      await restaurantController.addRestaurant(restaurant);
    }

    // Met à jour l'état local
    allRestaurants.value = restaurants;
  } catch (error) {
    console.error("Erreur lors de la récupération des restaurants :", error);
  } finally {
    isLoading.value = false;
  }
};

const loadFromIndexedDB = async () => {
  isLoading.value = true;
  try {
    const restaurants = await restaurantController.getAllRestaurants();
    allRestaurants.value = [...restaurants];
  } catch (error) {
    console.error("Erreur lors du chargement depuis IndexedDB:", error);
  } finally {
    isLoading.value = false;
  }
};

const redirectToRestaurantPage = (restaurantId) => {
  router.push({ name: "RestaurantView", params: { restaurantId } });
};

onMounted(async () => {
  try {
    initLottie(); // Initialisation Lottie
    const isConnected = store.getters["connection/getIsConnected"];

    if (!isConnected) {
      await loadFromIndexedDB();
    } else {
      await fetchRestaurants();
    }
  } catch (error) {
    console.error(
      "Erreur lors de l'initialisation du get all restaurants sur la homepage:",
      error
    );
  }
});

watch(isLoading, (newValue) => {
  if (newValue) {
    initLottie();
  }
});

function initLottie() {
  if (lottieContainer.value) {
    lottie.loadAnimation({
      container: lottieContainer.value, // Correctement défini
      renderer: "svg", // rendu SVG
      loop: true, // animation en boucle
      autoplay: true, // démarre automatiquement
      path: "/loading.json", // chemin vers le fichier JSON
    });
  }
}

const handleImageError = (event) => {
  event.target.src = "/logo.svg";
};
</script>

<template>
  <div class="flex align-center justify-center mt-20">
    <div class="w-75">
      <div v-if="isLoading" class="flex justify-center items-center">
        <div ref="lottieContainer" class="w-64 h-64"></div>
      </div>
      <div v-else class="mb-10">
        <div class="text-center">
          <h1 class="text-3xl font-semibold">Nos restaurants</h1>
          <p class="text-gray-500">Découvrez nos restaurants partenaires</p>
        </div>
        <Carousel3d
          v-if="allRestaurants.length > 0"
          :controls-height="30"
          :controls-visible="true"
          :display="3"
          :height="400"
          :width="600">
          <Slide
            v-for="(restaurant, index) in allRestaurants"
            :key="restaurant._id"
            :index="index">
            <div
              class="bg-white p-4 shadow-lg h-full cursor-pointer"
              role="button"
              tabindex="0"
              @click="redirectToRestaurantPage(restaurant._id)"
              @keydown.enter="redirectToRestaurantPage(restaurant._id)"
              @keydown.space.prevent="redirectToRestaurantPage(restaurant._id)">
              <img
                :src="restaurant.imageUrl"
                alt="restaurant image"
                class="w-full h-[280px] object-cover rounded-lg"
                @error="handleImageError" />
              <div class="mt-4">
                <h2 class="text-xl font-semibold">{{ restaurant.name }}</h2>
                <p class="text-gray-500">{{ restaurant.openingHours }}</p>
                <p class="text-gray-500">
                  {{ formatAddress(restaurant.address) }}
                </p>
              </div>
            </div>
          </Slide>
        </Carousel3d>
        <div v-else class="text-center text-gray-500">
          Aucun restaurant disponible
        </div>
      </div>
    </div>
  </div>
</template>
