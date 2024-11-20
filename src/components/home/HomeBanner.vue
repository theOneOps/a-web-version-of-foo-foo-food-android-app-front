<script setup>
import {onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import {menuController} from "../../services/OfflineFolder/Controllers/menuController.js";
import store from "../../store";
import api from "../../services/api";

const router = useRouter();
const isLoading = ref(true);
const someMenus = ref([]);
const randomRestaurantID = ref({});


const fetchMenus = async () => {
  isLoading.value = true;
  try {
    const response = await api.get("menus/someMenus");
    const menus = response.data.data;

    // Stocke les menus dans IndexedDB
    for (const menu of menus) {
      await menuController.addMenu(menu);
    }

    // Met à jour l'état local
    someMenus.value = menus;

    // récupère un restaurant aléatoire
    randomRestaurantID.value = menus[Math.floor(Math.random() * menus.length)].restaurantId;

    console.log("Restaurants récupérés de l'API:", menus);
  } catch (error) {
    console.error("Erreur lors de la récupération des restaurants :", error);
  } finally {
    isLoading.value = false;
  }
};

const loadFromIndexedDB = async () => {
  isLoading.value = true;
  try {
    const menus = await menuController.getSomeMenus()
    someMenus.value = [...menus];
    randomRestaurantID.value = menus[Math.floor(Math.random() * menus.length)].restaurantId;
    console.log("Menus récupérés de IndexedDB :", menus);
  } catch (error) {
    console.error("Erreur lors du chargement depuis IndexedDB:", error);
  } finally {
    isLoading.value = false;
  }
};

const redirectToRestaurantPage = (restaurantId) => {
  router.push({name: "RestaurantView", params: {restaurantId}});
};

onMounted(async () => {
  try {
    const isConnected = store.getters["connection/getIsConnected"];
    console.log("État de connexion:", isConnected);

    if (!isConnected) {
      await loadFromIndexedDB();
    } else {
      await fetchMenus();
    }
  } catch (error) {
    console.error(
        "Erreur lors de l'initialisation du get all restaurants sur la homepage:",
        error
    );
  } finally {
    isLoading.value = false;
  }
});

const handleImageError = (event) => {
  event.target.src = "/logo.svg";
};
</script>

<template>
  <div class="main-container mx-20 p-4 max-w-full lg:max-w-[1439px] mt-15 flex flex-row">
    <div
        class="flex flex-col lg:flex-row lg:justify-between items-start lg:items-center space-y-8 lg:space-y-0 lg:mt-8">
      <div class="text-content flex flex-col space-y-6">
        <h1 class="text-4xl lg:text-[55px] font-extrabold leading-tight lg:leading-[90px] text-left">
          <span class="text-[#000]">Bienvenue sur</span>
          <br>
          <span class="text-[#F36527]"> FouFouFood</span>
        </h1>
        <p class="text-lg lg:text-xl font-medium text-[#4a4a4a] leading-relaxed lg:leading-[44px]">
          Commandez vos plats préférés en un clic <br/>
          et faites-vous livrer directement chez vous
        </p>
        <div class="flex space-x-10 mt-10">
          <button class="w-[250px] h-[70px] bg-[#F36527] text-white rounded-full text-lg lg:text-[20px] font-semibold shadow-[-2px_22px_38px_0_rgba(243,101,39,0.5)]"
                  @click="redirectToRestaurantPage(randomRestaurantID)">
            Voir un restaurant<span class="ml-2">&#10140;</span>
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-2 gap-6 lg:w-1/2">
      <div
          v-for="(item, index) in someMenus.slice(0,4)"
          :key="index"
          class="product-card bg-white rounded-3xl shadow-lg p-6 flex flex-col justify-between h-full"
      >
        <!-- Contenu principal -->
        <div class="flex">
          <img :alt="item.name" :src="item.image" class="w-24 h-24 object-cover" @error="handleImageError"/>
          <div class="ml-3 mb-3">
            <h2 class="text-xl font-bold">{{ item.name }}</h2>
            <div class="text-[#F36527] font-bold">
              $ {{ item.price }}
            </div>
          </div>
        </div>

        <!-- Bouton fixé en bas -->
        <div class="flex justify-center mt-auto">
          <button
              class="w-10 h-10 bg-[#F36527] text-white rounded-full flex items-center justify-center"
              @click="redirectToRestaurantPage(item.restaurantId)"
          >
            <span>&#10140;</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-container {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
}

.product-card {
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
}
</style>