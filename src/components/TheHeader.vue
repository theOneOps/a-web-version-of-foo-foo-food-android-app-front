<template>
  <header>
    <div
        class="flex items-center justify-between h-[60px] mx-10 mt-[40px] px-[16px] z-[90]">
      <!-- Logo -->
      <RouterLink v-if="!isDeliveryMan" to="/" @click="closeMenus">
        <img alt="Logo" class="h-[60px]" src="/logo.svg"/>
      </RouterLink>

      <RouterLink v-else to="/delivery" @click="closeMenus">
        <img alt="Logo" class="h-[60px]" src="/logo.svg"/>
      </RouterLink>

      <!-- Bouton Hamburger pour les petits écrans -->
      <button class="block lg:hidden" @click="toggleMobileMenu">
        <img
            alt="menu"
            class="h-7 w-7"
            src="../assets/icons/menu-hamburger.svg"/>
      </button>

      <!-- Liens de navigation pour les écrans larges -->
      <div class="hidden lg:flex space-x-8">
        <RouterLink v-if="!isDeliveryMan" to="/" @click="closeMenus">
          <span
              :class="isActiveLink('/') ? 'text-[#F36527]' : 'text-[#000000]'"
              class="text-[21px] font-bold whitespace-nowrap"
          >Accueil</span>
        </RouterLink>
        <RouterLink v-if="isDeliveryMan" to="/delivery" @click="closeMenus">
          <span
              :class="isActiveLink('/delivery') ? 'text-[#F36527]' : 'text-[#000000]'"
              class="text-[21px] font-bold whitespace-nowrap"
          >Accueil</span>
        </RouterLink>
        <span
            class="text-[20px] font-medium leading-[30px] text-[#000000] whitespace-nowrap"
        >Contact</span
        >
      </div>

      <!-- Barre de recherche -->
      <div ref="searchBox" class="hidden lg:flex relative items-center">
        <input
            v-model="searchQuery"
            class="w-[350px] h-[50px] px-[15px] border border-[#E5E5E5] rounded-[30px] focus:outline-none focus:ring-1 focus:ring-[#F36527]"
            placeholder="Rechercher..."
            type="text"
            @focus="isSuggestionsOpen = true"
            @input="isSuggestionsOpen = true"
            @keydown.escape="isSuggestionsOpen = false"
        />
        <button
            class="absolute right-0 h-[50px] w-[50px] bg-[#F36527] rounded-[30px] flex items-center justify-center">
          <img alt="search" class="h-6 w-6" src="../assets/icons/search.svg"/>
        </button>

        <!-- dropdown pour les suggestions  -->
        <div v-if="isSuggestionsOpen && filteredSuggestions.length > 0"
             class="absolute top-[60px] left-0 w-[350px] bg-white rounded-lg shadow-lg z-50">
          <ul>
            <li
                v-for="suggestion in filteredSuggestions"
                :key="suggestion.id"
                class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                @click="selectSuggestion(suggestion)"
            >
              <!-- Afficher le nom et le type de suggestion -->
              {{ suggestion.name }} <span class="text-sm text-gray-500">({{ suggestion.type }})</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Icônes de notifications et profil pour les écrans larges -->
      <div class="hidden lg:flex relative space-x-10">
        <router-link to="/cart" @click="closeMenus">
          <img v-if="isLoggedIn && isClient" alt="cart" class="h-7 w-7 cursor-pointer" src="../assets/icons/cart.svg"/>
        </router-link>

        <!-- Menu déroulant du profil -->
        <div id="profileMenu" ref="profileMenuRef" class="relative">
          <img
              id="profileIcon"
              ref="profileIconRef"
              alt="profile"
              class="h-7 w-7 cursor-pointer"
              src="../assets/icons/profile.svg"
              @click="toggleProfileMenu"/>
          <div v-if="isProfileMenuOpen" class="absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-lg z-50">
            <RouterLink to="/profile" @click="closeMenus">
              <a class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Mon profil</a>
            </RouterLink>
            <RouterLink v-if="isClient" to="/orders" @click="closeMenus">
              <a class="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                Mes commandes
              </a>
            </RouterLink>
            <p></p>
            <RouterLink v-if="isRestaurantOwner" :to="`/restaurant/${idRestaurant}`" @click="closeMenus">
              <a class="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                Mon restaurant
              </a>
            </RouterLink>
            <RouterLink v-if="isDeliveryMan" to="/delivery" @click="closeMenus">
              <a class="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                Mes livraisons
              </a>
            </RouterLink>
          </div>
        </div>

        <!-- Menu déroulant de notifications -->
        <div id="notificationsMenu" ref="notificationsMenuRef" class="relative">
          <div class="relative">
            <!-- Icône de notification -->
            <img
                id="notificationsIcon"
                ref="notificationsIconRef"
                alt="notification"
                class="h-7 w-7 cursor-pointer"
                src="../assets/icons/notifications.svg"
                @click="toggleNotificationsMenu"
            />
            <!-- Badge pour le nombre de notifications -->
            <span
                v-if="unreadNotificationsCount > 0"
                class="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
            >{{ unreadNotificationsCount }}</span>
          </div>
          <div
              v-if="isNotificationsMenuOpen"
              class="absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-lg z-50"
          >
            <template v-if="notifications.length > 0">
              <div
                  v-for="notification in notifications"
                  :key="notification.id"
                  class="px-4 py-2 border-b border-gray-100 last:border-none"
              >
                <!-- Statut de la notification -->
                <p class="font-bold text-gray-800">{{ notification.status_order }}</p>

                <!-- Corps de la notification -->
                <p class="text-sm text-gray-600">{{ notification.body }}</p>

                <!-- Date de la notification -->
                <p class="text-xs text-gray-500 mt-1">
                  {{ formatDate(notification.createdAt) }}
                </p>
              </div>
              <div>
                <router-link to="/notifications" @click="closeMenus">
                  <a class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Voir toutes les notifications</a>
                </router-link>
              </div>
            </template>
            <p v-else class="px-4 py-2 text-gray-800">
              Vous n'avez aucune notification
            </p>
            <router-link v-else to="/notifications" @click="closeMenus">
              <a class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Voir toutes les notifications</a>
            </router-link>
          </div>
        </div>

        <!-- Boutons d'authentification pour les écrans larges -->
        <div class="hidden lg:flex space-x-6">
          <RouterLink v-if="!isLoggedIn" to="/auth/login">
            <button class="text-[#F36527] border border-[#F36527] rounded-[30px] px-[20px] py-[10px]">
              Connexion
            </button>
          </RouterLink>
          <RouterLink v-if="!isLoggedIn" to="/auth/registration">
            <button class="text-white bg-[#F36527] rounded-[30px] px-[20px] py-[10px]">
              Inscription
            </button>
          </RouterLink>
          <button
              v-if="isLoggedIn"
              class="text-[#F36527] border border-[#F36527] rounded-[30px] px-[20px] py-[10px]"
              @click="logout">
            Déconnexion
          </button>
        </div>
      </div>
    </div>
    <!-- Menu Mobile -->
    <div v-if="isMobileMenuOpen" class="lg:hidden mt-4 space-y-4 px-4">
      <RouterLink v-if="!isDeliveryMan" to="/" @click="closeMenus">
        <span
            class="block text-[21px] font-bold text-[#F36527]">Accueil</span>
      </RouterLink>
      <RouterLink v-if="isDeliveryMan" to="/delivery" @click="closeMenus">
        <span
            class="block text-[21px] font-bold text-[#F36527]">Accueil</span>
      </RouterLink>
      <span class="block text-[20px] font-medium text-[#000000]">Contact</span>

      <div class="relative flex items-center">
        <input
            class="w-full h-[50px] px-[15px] border border-[#E5E5E5] rounded-[30px] focus:outline-none focus:ring-1 focus:ring-[#F36527]"
            placeholder="Rechercher..."
            type="text"/>
        <button
            class="absolute right-0 h-[50px] w-[50px] bg-[#F36527] rounded-[30px] flex items-center justify-center">
          <img alt="search" class="h-6 w-6" src="../assets/icons/search.svg"/>
        </button>
      </div>

      <div class="flex space-x-4">
        <router-link to="/cart" @click="closeMenus">
          <img
              v-if="isClient && isLoggedIn"
              alt="cart"
              class="h-7 w-7"
              src="../assets/icons/cart.svg"/>
        </router-link>

        <div id="profileMenu" class="relative">
          <img
              id="profileIcon"
              alt="profile"
              class="h-7 w-7 cursor-pointer"
              src="../assets/icons/profile.svg"
              @click="toggleProfileMenu"/>
          <div
              v-if="isProfileMenuOpen"
              class="absolute left-0 mt-3 w-48 bg-white rounded-lg shadow-lg z-50">
            <RouterLink to="/profile" @click="closeMenus">
              <a class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Mon profil</a>
            </RouterLink>
            <RouterLink v-if="isClient" to="/orders" @click="closeMenus">
              <a class="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                Mes commandes
              </a>
            </RouterLink>
            <RouterLink v-if="isRestaurantOwner" :to="`/restaurant/${idRestaurant}`" @click="closeMenus">
              <a class="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                Mon restaurant
              </a>
            </RouterLink>
            <RouterLink v-if="isDeliveryMan" to="/delivery" @click="closeMenus">
              <a class="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                Mes livraisons
              </a>
            </RouterLink>
          </div>
        </div>

        <div id="notificationsMenu" class="relative">
          <img
              id="notificationsIcon"
              alt="notification"
              class="h-7 w-7 cursor-pointer"
              src="../assets/icons/notifications.svg"
              @click="toggleNotificationsMenu"/>
          <div
              v-if="isNotificationsMenuOpen"
              class="absolute left-0 mt-3 w-48 bg-white rounded-lg shadow-lg z-50">
            <template v-if="notifications.length > 0">
              <div
                  v-for="notification in notifications"
                  :key="notification.id"
                  class="px-4 py-2 border-b border-gray-100 last:border-none"
              >
                <!-- Statut de la notification -->
                <p class="font-bold text-gray-800">{{ notification.status_order }}</p>

                <!-- Corps de la notification -->
                <p class="text-sm text-gray-600">{{ notification.body }}</p>

                <!-- Date de la notification -->
                <p class="text-xs text-gray-500 mt-1">
                  {{ formatDate(notification.createdAt) }}
                </p>
              </div>
              <div>
                <router-link to="/notifications" @click="closeMenus">
                  <a class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Voir toutes les notifications</a>
                </router-link>
              </div>
            </template>
            <p v-else class="px-4 py-2 text-gray-800">
              Vous n'avez aucune notification
            </p>
            <router-link to="/notifications" @click="closeMenus">
              <a class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Voir toutes les notifications</a>
            </router-link>
          </div>
        </div>
      </div>

      <div class="flex space-x-4">
        <button
            v-if="isLoggedIn"
            class="text-[#F36527] border border-[#F36527] rounded-[30px] px-[20px] py-[10px]"
            @click="logout">
          Déconnexion
        </button>
      </div>
    </div>
  </header>

  <div v-if="isAdmin" class="flex justify-center items-center w-full p-2">
    <RouterLink to="/admin/Users">
      <v-btn
          :color="isActiveLink('/admin/Users') ? 'red-darken-2' : ''"
          class="h-36 w-36"
          variant="text">
        Users
      </v-btn>
    </RouterLink>

    <RouterLink to="/admin/Restaurants">
      <v-btn
          :color="isActiveLink('/admin/Restaurants') ? 'red-darken-2' : ''"
          class="h-36 w-36"
          variant="text">
        Restaurants
      </v-btn>
    </RouterLink>
  </div>
</template>

<script>
import {RouterLink, useRoute, useRouter} from "vue-router";
import {menuController} from "../services/OfflineFolder/Controllers/menuController.js";
import {restaurantController} from "../services/OfflineFolder/Controllers/restaurantController.js";
import store from "../store";
import api from "../services/api";
import io from "socket.io-client";
import dayjs from 'dayjs';

const loadFromIndexedDB = async () => {
  try {
    await menuController.getAllMenus();
    await restaurantController.getAllRestaurants();
  } catch (error) {
    console.error("Erreur lors de la récupération des données depuis IndexedDB:", error);
  }
};

const fetchMenus = async () => {
  try {
    const response = await api.get("/menus/getAll");
    const menus = response.data;
    store.commit("menu/setMenus", menus);
  } catch (error) {
    console.error("Erreur lors de la récupération des menus:", error);
  }
};

const fetchRestaurants = async () => {
  try {
    const restaurants = await api.get("/restaurants");
    store.commit("restaurant/setRestaurants", restaurants);
  } catch (error) {
    console.error("Erreur lors de la récupération des restaurants:", error);
  }
};

export default {
  name: "TheHeader",
  computed: {
    authState() {
      return this.$store.getters["auth/getAuthState"];
    },
    filteredSuggestions() {
      const query = this.searchQuery.trim().toLowerCase();
      if (!query) {
        return [];
      }
      const menus = this.$store.getters['menu/getMenus'].data;
      const restaurants = this.$store.getters['restaurant/getRestaurants'].data;

      const menuSuggestions = menus.filter(menu =>
          menu.name.toLowerCase().includes(query)
      );
      const restaurantSuggestions = restaurants.filter(restaurant =>
          restaurant.name.toLowerCase().includes(query)
      );

      return [
        ...menuSuggestions.map(item => ({...item, type: 'menu'})),
        ...restaurantSuggestions.map(item => ({...item, type: 'restaurant'})),
      ];
    },
    unreadNotificationsCount() {
      return this.notifications.filter(notification => notification.status_notif === "unread").length;
    },
  },
  components: {RouterLink},
  data() {
    return {
      isMobileMenuOpen: false,
      isLoggedIn: false,
      isDeliveryMan: false,
      isAdmin: false,
      isClient: false,
      isRestaurantOwner: false,
      isProfileMenuOpen: false,
      isNotificationsMenuOpen: false,
      notifications: [],
      route: useRouter(),
      current_route: useRoute(),
      searchQuery: '',
      isSuggestionsOpen: false,
      searchBox: null,
      profileMenuRef: null,
      notificationsMenuRef: null,
      profileIconRef: null,
      notificationsIconRef: null,
      socket: null,
      idUser: null,
      idRestaurant: null,
    };
  },
  methods: {
    formatDate(dateString) {
      return dayjs(dateString).format('DD MMMM YYYY à HH:mm');
    },
    isActiveLink(routePath) {
      return this.current_route.path == routePath;
    },
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
    },
    async logout() {
      try {
        await this.$store.dispatch("auth/disconnectState");
        this.isLoggedIn = false;
        this.isDeliveryMan = false;
        this.isAdmin = false;
        this.isClient = false;
        this.isRestaurantOwner = false;
        this.idUser = null;
        this.socket.disconnect();
        this.route.push({name: "HomeView"});
      } catch (err) {
        console.error("Erreur lors de la déconnexion:", err);
      }
    },
    toggleProfileMenu() {
      this.isProfileMenuOpen = !this.isProfileMenuOpen;
      this.isNotificationsMenuOpen = false; // Ferme le menu Notifications si le Profil est ouvert
    },
    async toggleNotificationsMenu() {
      this.isNotificationsMenuOpen = !this.isNotificationsMenuOpen;
      this.isProfileMenuOpen = false; // Ferme le menu Profil si les Notifications sont ouvertes

      if (this.isNotificationsMenuOpen) {
        await this.fetchNotifications(); // Charger les notifications si le menu est ouvert
      } else {
        await api.put(`notifications/markAsRead/${this.idUser}`);
        await this.fetchNotifications();
      }
    },
    closeMenus() {
      this.isProfileMenuOpen = false;
      this.isNotificationsMenuOpen = false;
    },
    handleClickOutside(event) {
      if (
          this.searchBox &&
          !this.searchBox.contains(event.target)
      ) {
        this.isSuggestionsOpen = false;
      }

      const clickedOutsideProfileMenu =
          this.profileMenuRef &&
          !this.profileMenuRef.contains(event.target);
      const clickedOutsideNotificationsMenu =
          this.notificationsMenuRef &&
          !this.notificationsMenuRef.contains(event.target);
      const clickedOutsideProfileIcon =
          this.profileIconRef &&
          !this.profileIconRef.contains(event.target);
      const clickedOutsideNotificationsIcon =
          this.notificationsIconRef &&
          !this.notificationsIconRef.contains(event.target);

      if (
          clickedOutsideProfileMenu &&
          clickedOutsideNotificationsMenu &&
          clickedOutsideProfileIcon &&
          clickedOutsideNotificationsIcon
      ) {
        this.closeMenus();
      }
    },
    selectSuggestion(suggestion) {
      this.isSuggestionsOpen = false;
      this.searchQuery = ""
      if (suggestion.type === 'menu') {
        const id = suggestion.restaurantId;
        // Rediriger vers la page du menu
        this.$router.push({name: 'RestaurantView', params: {restaurantId: id}});
      } else if (suggestion.type === 'restaurant') {
        // Rediriger vers la page du restaurant
        const id = suggestion._id;
        this.$router.push({name: 'RestaurantView', params: {restaurantId: id}});
      }
    },
    // Charger les notifications pour un utilisateur connecté
    async fetchNotifications() {
      const userId = this.idUser
      if (!userId) return;
      try {
        const response = await api.get(`notifications/unread/${userId}`);
        this.notifications = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des notifications :', error);
      }
    },

    connectSocket(email) {
      this.socket = io("http://localhost:3000");
      this.socket.on("connect", () => {
        this.socket.emit("join", email);
      });

      this.socket.on("newNotification", (notification) => {
        this.fetchNotifications();
      });
    },
  },
  watch: {
    authState: {
      immediate: true, // Exécute immédiatement la fonction lors de la création du composant
      handler(newAuthState) {
        if (!newAuthState || Object.keys(newAuthState).length === 0) {
          this.isLoggedIn = false;
          return; // Ignorer l'état initial vide
        }

        if (!newAuthState.connected) {
          this.isLoggedIn = false;
        } else {
          this.idUser = newAuthState.id;

          if (this.idUser == null) {
            this.isLoggedIn = false;
          } else {
            this.isLoggedIn = true;
            this.isAdmin = newAuthState.role === "admin";
            this.isClient = newAuthState.role === "client";
            this.isDeliveryMan = newAuthState.role === "livreur";
            this.isRestaurantOwner = newAuthState.role === "restaurateur";
            this.idRestaurant = newAuthState.restaurantId;
          }

          this.fetchNotifications();
          this.connectSocket(newAuthState.email);
        }
      }
    }
  },
  mounted() {
    // Ajoute un écouteur pour fermer les menus lorsqu'on clique en dehors
    if (window.innerWidth >= 1024) {
      document.addEventListener("click", this.handleClickOutside);
    }

    // Initialiser l'état d'authentification depuis localStorage
    this.$store.dispatch("auth/initializeAuthState");

    const authState = this.$store.getters["auth/getAuthState"];
    // verifier si on est connecté
    if (Object.keys(authState).length === 0 || !authState.connected) {
      this.isLoggedIn = false;
    } else {

      this.idUser = authState.id;

      if (this.idUser == null) {
        this.isLoggedIn = false;
      } else {
        this.isLoggedIn = true;
        if (authState.role === "admin") {
          this.isAdmin = true;
        } else if (authState.role === "client") {
          this.isClient = true;
        } else if (authState.role === "livreur") {
          this.isDeliveryMan = true;
        } else {
          this.isRestaurantOwner = true;
          this.idRestaurant = authState.restaurantId;
        }
      }

      // Connecter le socket
      this.connectSocket(authState.email);
    }

    this.searchBox = this.$refs.searchBox;
    this.profileMenuRef = this.$refs.profileMenu;
    this.notificationsMenuRef = this.$refs.notificationsMenu;
    this.profileIconRef = this.$refs.profileIcon;
    this.notificationsIconRef = this.$refs.notificationsIcon;

    // Charger les données depuis IndexedDB
    loadFromIndexedDB();
    // Charger les données depuis l'API
    fetchMenus();
    fetchRestaurants();
    this.fetchNotifications();
  },
  beforeDestroy() {
    document.removeEventListener("click", this.handleClickOutside);
    if (this.socket) {
      this.socket.disconnect();
    }
  },
};
</script>