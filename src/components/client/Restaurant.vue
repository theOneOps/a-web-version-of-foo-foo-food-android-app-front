<script>
import axios from '@/axiosConfig';
import DishDetail from '../../components/client/DishDetail.vue';
import {mapGetters, mapMutations} from 'vuex';
import {restaurantController} from "../../services/OfflineFolder/Controllers/restaurantController.js"
import {menuController} from "../../services/OfflineFolder/Controllers/menuController.js"
import store from "../../store"

export default {
  props: {
    restaurantId: {
      type: String,
      required: true
    }
  },
  components: {
    DishDetail,
  },
  data() {
    return {
      restaurantDetails: {},
      categories: ['All'],
      selectedCategory: 'All',
      dialog: false,
      editDialog: false,
      addDishDialog: false,
      editMode: false,
      editedDishId: null,
      deleteDialog: false,
      dishToDelete: null,
      editedDetails: {},
      selectedDish: null,
      dishes: [],
      newDish: {
        name: '',
        description: '',
        price: 0,
        category: '',
        image: '',
        ingredients: [],
        restaurantId: '',
      }
    };
  },
  computed: {
    ...mapGetters({
      userRole: 'auth/getUserRole',
      userRestaurantId: 'auth/getUserRestaurantId',
      cartItems: 'cart/cartItems'
    }),
    isRestaurateur() {
      return this.userRole === 'restaurateur' && this.restaurantDetails._id && this.userRestaurantId === this.restaurantDetails._id;
    },
    filteredDishes() {
      const dishes = this.selectedCategory === 'All'
          ? this.dishes
          : this.dishes.filter((dish) => dish && dish.category === this.selectedCategory);
      return dishes.filter(dish => dish);
    },
    fullAddress() {
      const {address} = this.restaurantDetails;
      if (address) {
        return `${address.number} ${address.street}, ${address.city}, ${address.state || ''} ${address.zipCode}, ${address.country}`;
      }
      return "Adresse non disponible";
    }
  },
  methods: {
    ...mapMutations('cart', ['ADD_TO_CART', 'UPDATE_QUANTITY', 'SET_CURRENT_RESTAURANT_ID', 'CLEAR_CART']),
    openAddDishDialog() {
      this.resetDishForm();
      this.addDishDialog = true;
      this.editMode = false;
    },
    openEditDishDialog(dish) {
      this.newDish = {...dish, restaurantId: this.restaurantDetails._id}; // Load dish details into form
      this.editedDishId = dish._id; // Store the ID of the dish being edited
      this.addDishDialog = true;
      this.editMode = true; // Enable edit mode
    },
    resetDishForm() {
      this.newDish = {
        name: '',
        description: '',
        price: 0,
        category: '',
        image: '',
        ingredients: [],
        restaurantId: this.restaurantDetails._id,
      };
      this.editedDishId = null;
    },
    async submitNewDish() {
      try {
        if (this.editMode && this.editedDishId) {
          const response = await axios.put(`/menus/${this.editedDishId}`, this.newDish);
          if (response.data.success) {
            this.addDishDialog = false;
            // Refetch dishes to ensure data accuracy
            await this.fetchDishes();
          }
        } else {
          const response = await axios.post('/menus', this.newDish);
          if (response.data.success) {
            this.dishes.push(response.data.data[0]);
            this.addDishDialog = false;
          }
        }
      } catch (error) {
        console.error(this.editMode ? 'Error editing dish:' : 'Error adding dish:', error);
      }
    },
    openEditDialog() {
      this.editedDetails = {
        ...this.restaurantDetails,
        addressStreet: this.restaurantDetails.address.street,
        addressNumber: this.restaurantDetails.address.number,
        addressCity: this.restaurantDetails.address.city,
        addressState: this.restaurantDetails.address.state,
        addressZipCode: this.restaurantDetails.address.zipCode,
        addressCountry: this.restaurantDetails.address.country,
      };
      this.editDialog = true;
    },
    async submitEdit() {
      const updatedDetails = {
        ...this.editedDetails,
        address: {
          street: this.editedDetails.addressStreet,
          number: this.editedDetails.addressNumber,
          city: this.editedDetails.addressCity,
          state: this.editedDetails.addressState,
          zipCode: this.editedDetails.addressZipCode,
          country: this.editedDetails.addressCountry,
        },
      };

      try {
        const response = await axios.put(`/restaurants/${this.restaurantDetails._id}`, updatedDetails);
        if (response.data.success) {
          this.restaurantDetails = response.data.restaurant;
          this.editDialog = false;
        }
      } catch (error) {
        console.error('Error updating restaurant:', error);
      }
    },
    filterCategory(category) {
      this.selectedCategory = category;
    },
    onCardClick(dish) {
      this.selectedDish = dish;
      this.dialog = true;
    },
    async fetchRestaurantDetails() {
      try {
        const response = await axios.get(`/restaurants/${this.restaurantId}`);
        if (response.data) {
          this.restaurantDetails = response.data;
          this.fetchDishes();
        }
      } catch (error) {
        console.error('Error fetching restaurant details:', error);
      }
    },
    async fetchRestaurantDetailsFromIndexedDB() {
      try {
        const response = await restaurantController.getRestaurantById(this.restaurantId)
        if (response) {
          this.restaurantDetails = response
          this.fetchDishesFromIndexedDB()
        }
      } catch (error) {
        console.error('Error fetching restaurant details:', error);
      }
    },
    async fetchDishes() {
      try {
        const response = await axios.get(`menus/menusById/${this.restaurantDetails._id}`);
        if (response.data.success) {
          for (const dish of response.data.data) {
            await menuController.addMenu(dish)
          }
          this.dishes = response.data.data.map(dish => ({
            ...dish,
            id: dish._id
          }));
          const uniqueCategories = Array.from(new Set(this.dishes.map(dish => dish.category)));
          this.categories = ['All', ...uniqueCategories];
        } else {
          console.error(response.data.message);
        }
      } catch (error) {
        console.error('Error fetching dishes:', error);
      }
    },
    async fetchDishesFromIndexedDB() {
      try {
        const response = await menuController.getMenusByRestaurant(this.restaurantDetails._id)
        if (response) {
          this.dishes = response.map(dish => ({
            ...dish,
            id: dish._id
          }));
          const uniqueCategories = Array.from(new Set(this.dishes.map(dish => dish.category)));
          this.categories = ['All', ...uniqueCategories];
        } else {
          console.log("problems in fetchDishesFromIndexedDB ")
        }
      } catch (error) {
        console.error('Error fetching dishes:', error);
      }
    },
    getDishQuantity(dishId) {
      const item = this.cartItems.find((item) => item.id === dishId);
      return item ? item.quantity : 0;
    },
    addToCart(dish) {
      const restaurantId = this.restaurantDetails._id;
      const currentRestaurantId = this.$store.getters['cart/currentRestaurantId'];

      if (currentRestaurantId && currentRestaurantId !== restaurantId) {
        // Prompt user to clear cart or keep current items
        const confirmClear = confirm("Votre panier contient des articles d'un autre restaurant. Voulez-vous vider votre panier et ajouter cet article ?");

        if (confirmClear) {
          this.CLEAR_CART();
          this.SET_CURRENT_RESTAURANT_ID(restaurantId);
          this.ADD_TO_CART({...dish, id: dish._id});
        }
      } else {
        if (!currentRestaurantId) {
          // Set the restaurant ID if the cart is empty
          this.SET_CURRENT_RESTAURANT_ID(restaurantId);
        }
        this.ADD_TO_CART({...dish, id: dish._id});
      }
    },
    updateQuantity(dishId, quantity) {
      this.UPDATE_QUANTITY({dishId, quantity});
    },
    confirmDelete(dish) {
      this.dishToDelete = dish;
      this.deleteDialog = true;
    },
    async deleteDish() {
      try {
        const response = await axios.delete(`/menus/${this.dishToDelete._id}`);
        if (response.data.success) {
          this.dishes = this.dishes.filter(dish => dish._id !== this.dishToDelete._id);
          this.deleteDialog = false;
        }
      } catch (error) {
        console.error('Error deleting dish:', error);
      }
    },
  },
  async mounted() {
    const isConnected = store.getters["connection/getIsConnected"];
    try {
      if (!isConnected) {
        await this.fetchRestaurantDetailsFromIndexedDB();
      } else {
        await this.fetchRestaurantDetails();
      }
    } catch (err) {
      console.error("Erreur lors de l'initialisation de la page d'un restaurant : ", err);
    }
  },
  watch: {
    restaurantId(newId, oldId) {
      if (newId !== oldId) {
        const isConnected = store.getters["connection/getIsConnected"];
        try {
          if (!isConnected) {
            this.fetchRestaurantDetailsFromIndexedDB();
          } else {
            this.fetchRestaurantDetails();
          }
        } catch (err) {
          console.error("Erreur lors de la mise à jour de la page d'un restaurant : ", err);
        }
      }
    },
  },
}
</script>

<template>
  <v-app>
    <v-container class="font-sans py-6 pt-0 mt-0 px-15" fluid>
      <h1 class="text-4xl font-bold mt-6 mb-6 text-left">
        {{ restaurantDetails.name }}
      </h1>

      <v-row>
        <!-- Left Column: Profile Picture, Restaurant Details, and Edit Button -->
        <v-col class="pr-4" cols="12" md="3">
          <div class="profile-picture mb-4">
            <v-img
                :src="restaurantDetails.imageUrl"
                class="profile-picture mx-auto d-none d-md-block"
                contain
                elevation="1">
            </v-img>
          </div>
          <div class="restaurant-details text-gray-700 mb-4">
            <p class="mb-2"><strong>Adresse:</strong> {{ fullAddress }}</p>
            <p class="mb-2">
              <strong>Téléphone:</strong>
              {{ restaurantDetails.phone || "Non disponible" }}
            </p>
            <p class="mb-2">
              <strong>Heures d&apos;ouverture:</strong>
              {{ restaurantDetails.openingHours || "Non disponible" }}
            </p>
            <p class="mb-2">
              <strong>Spécialité:</strong>
              {{ restaurantDetails.speciality || "Aucune" }}
            </p>
          </div>

          <!-- Edit Button, Visible Only for Restaurateur Role -->
          <v-btn
              v-if="isRestaurateur"
              class="mt-4"
              color="orange"
              @click="openEditDialog">
            Modifier les détails
          </v-btn>
        </v-col>

        <!-- Right Column: Categories and Dishes Display -->
        <v-col cols="12" md="9">
          <!-- Category Buttons -->
          <div class="mb-4 flex flex-wrap space-x-1">
            <v-btn
                v-for="category in categories"
                :key="category"
                :class="
                selectedCategory === category
                  ? 'bg-orange-200 text-orange-800 border-orange-300'
                  : 'bg-transparent text-gray-600 border-gray-300 hover:bg-gray-100'
              "
                :color="selectedCategory === category ? 'orange' : ''"
                class="category-btn rounded-full border px-2 py-1 text-xs font-medium transition-colors duration-200"
                @click="filterCategory(category)">
              {{ category }}
            </v-btn>
          </div>

          <!-- Dishes Display -->
          <v-row>
            <v-col
                v-for="dish in filteredDishes"
                :key="dish?._id"
                class="mb-6"
                cols="12"
                lg="3"
                md="4"
                sm="6">
              <v-card
                  class="rounded-lg overflow-hidden shadow-lg p-4 transform transition duration-200 hover:scale-105 hover:shadow-2xl cursor-pointer"
                  role="button"
                  tabindex="0"
                  @click="onCardClick(dish)"
                  @keydown.enter="onCardClick(dish)">
                <!-- Delete Button -->
                <div
                    v-if="isRestaurateur"
                    class="delete-icon"
                    @click.stop="confirmDelete(dish)">
                  ✖
                </div>

                <!-- Edit Dish Button -->
                <div
                    v-if="isRestaurateur"
                    class="edit-icon"
                    @click.stop="openEditDishDialog(dish)">
                  ✎
                </div>

                <!-- Dish Image -->
                <div
                    :style="{
                    backgroundImage: `url(${dish.image || '../../../public/logo.svg'})`,
                  }"
                    class="bg-cover bg-center w-full"
                    style="height: 200px"></div>

                <!-- Dish Info -->
                <div class="font-sans card-content text-left px-4 py-4">
                  <div class="card-title mb-1 h-12 line-clamp-2">
                    {{ dish.name }}
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-xl font-bold">${{ dish.price }}</span>
                    <div
                        v-if="getDishQuantity(dish._id) > 0 && !isRestaurateur"
                        class="flex items-center space-x-2">
                      <v-btn
                          class="quantity-btn"
                          color="orange"
                          icon
                          x-small
                          @click.stop="
                          updateQuantity(
                            dish._id,
                            getDishQuantity(dish._id) - 1
                          )
                        ">
                        <span class="text-white text-base">−</span>
                      </v-btn>
                      <span class="text-base font-semibold">{{
                          getDishQuantity(dish._id)
                        }}</span>
                      <v-btn
                          class="quantity-btn"
                          color="orange"
                          icon
                          x-small
                          @click.stop="
                          updateQuantity(
                            dish._id,
                            getDishQuantity(dish._id) + 1
                          )
                        ">
                        <span class="text-white text-base">+</span>
                      </v-btn>
                    </div>
                    <v-btn
                        v-else
                        v-if="!isRestaurateur"
                        class="quantity-btn"
                        color="orange"
                        icon
                        x-small
                        @click.stop="addToCart(dish)">
                      <span class="text-white text-base">+</span>
                    </v-btn>
                  </div>
                </div>
              </v-card>
            </v-col>

            <!-- Floating + Button for Adding a New Dish -->
            <v-col
                v-if="isRestaurateur"
                class="mb-6"
                cols="12"
                lg="3"
                md="4"
                sm="6"
                style="align-self: center">
              <v-card
                  class="add-dish-card d-flex align-center justify-center cursor-pointer"
                  style="height: 300px"
                  @click="openAddDishDialog">
                <div class="custom-plus-icon">+</div>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <!-- Dish Detail Popup -->
      <v-dialog v-model="dialog" height="100vh" max-width="500px">
        <DishDetail
            v-if="selectedDish"
            :dish="selectedDish"
            @close="dialog = false"/>
      </v-dialog>

      <!-- Edit Details Dialog -->
      <v-dialog v-model="editDialog" max-width="600px">
        <v-card>
          <v-card-title class="headline">Modifier les détails</v-card-title>
          <v-card-text>
            <v-form ref="editForm" v-model="valid">
              <v-text-field
                  v-model="editedDetails.name"
                  label="Nom"
                  required></v-text-field>
              <v-text-field
                  v-model="editedDetails.phone"
                  label="Téléphone"></v-text-field>
              <v-text-field
                  v-model="editedDetails.openingHours"
                  label="Heures d'ouverture"></v-text-field>
              <v-text-field
                  v-model="editedDetails.speciality"
                  label="Spécialité"></v-text-field>
              <v-text-field
                  v-model="editedDetails.addressStreet"
                  label="Rue"
                  required></v-text-field>
              <v-text-field
                  v-model="editedDetails.addressNumber"
                  label="Numéro"
                  required></v-text-field>
              <v-text-field
                  v-model="editedDetails.addressCity"
                  label="Ville"
                  required></v-text-field>
              <v-text-field
                  v-model="editedDetails.addressState"
                  label="État"></v-text-field>
              <v-text-field
                  v-model="editedDetails.addressZipCode"
                  label="Code postal"></v-text-field>
              <v-text-field
                  v-model="editedDetails.addressCountry"
                  label="Pays"
                  required></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn color="orange" text @click="editDialog = false"
            >Annuler
            </v-btn
            >
            <v-btn color="primary" @click="submitEdit">Enregistrer</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Add Dish Dialog -->
      <v-dialog v-model="addDishDialog" max-width="600px">
        <p class="text-blue-600 text-center text-2xl">Tous les inputs sont requis</p>
        <v-card>
          <v-card-title class="headline">Ajouter un plat</v-card-title>
          <v-card-text>
            <v-form ref="addDishForm" v-model="valid">
              <v-text-field
                  v-model="newDish.name"
                  label="Nom du plat"
                  required></v-text-field>
              <v-textarea
                  v-model="newDish.description"
                  label="Description"
                  required></v-textarea>
              <v-text-field
                  v-model="newDish.price"
                  label="Prix"
                  required
                  type="number"></v-text-field>
              <v-text-field
                  v-model="newDish.category"
                  label="Catégorie"
                  required></v-text-field>
              <v-text-field
                  v-model="newDish.image"
                  label="Image URL"></v-text-field>
              <v-combobox
                  v-model="newDish.ingredients"
                  label="Ingrédients"
                  multiple></v-combobox>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn color="orange" text @click="addDishDialog = false"
            >Annuler
            </v-btn
            >
            <v-btn color="primary" @click="submitNewDish">Enregistrer</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </v-app>

  <!-- Confirmation Dialog for Delete -->
  <v-dialog v-model="deleteDialog" max-width="500px">
    <v-card>
      <v-card-title class="headline"
      >Voulez-vous vraiment supprimer ce plat ?
      </v-card-title
      >
      <v-card-actions>
        <v-btn color="orange" text @click="deleteDialog = false">Annuler</v-btn>
        <v-btn color="red" @click="deleteDish">Supprimer</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.profile-picture {
  border-radius: 12px;
  border: 2px solid #ef8104;
  overflow: hidden;
}

.delete-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: red;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.2s ease,
  box-shadow 0.2s ease;
}

.delete-icon:hover {
  transform: scale(1.5);
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.3);
}

.restaurant-details {
  margin-bottom: 16px;
}

.category-btn {
  padding: 2px 6px !important;
  min-width: 0 !important;
  font-size: 0.75rem !important;
  height: 1.5rem !important;
  line-height: 1 !important;
  border-radius: 9999px !important;
  margin-bottom: 4px;
}

.quantity-btn {
  width: 28px !important;
  height: 28px !important;
  border-radius: 50% !important;
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-dish-card {
  height: 300px;
  border-radius: 12px;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease,
  box-shadow 0.2s ease;
}

.add-dish-card:hover {
  transform: scale(1.05);
  box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.15);
}

.custom-plus-icon {
  font-size: 48px;
  font-weight: bold;
  color: #ef8104;
  line-height: 1;
}

.edit-icon {
  position: absolute;
  top: 8px;
  right: 40px;
  background-color: #ef8104;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.2s ease,
  box-shadow 0.2s ease;
}

.edit-icon:hover {
  transform: scale(1.5);
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.3);
}
</style>
