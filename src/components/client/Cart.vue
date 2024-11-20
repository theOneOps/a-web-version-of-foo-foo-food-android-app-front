<template>
  <v-container>
    <v-row>
      <!-- Left Column: Cart Items -->
      <v-col v-if="cartItems.length === 0">
        <div class="flex flex-col items-center justify-center h-full mt-10">
          <!-- Texte principal -->
          <h1 class="text-h4 font-weight-bold mb-4">Votre panier est vide</h1>
          <p class="text-body-1 mb-6">
            Il semble que vous n'ayez pas encore ajouté de produits à votre panier. <br>
            Explorez nos catégories pour trouver quelque chose à commander !
          </p>

          <!-- Bouton pour explorer les produits -->
          <RouterLink to="/">
            <v-btn
                class="mb-6"
                color="#F36527"
                dark
                large
            >
              Explorer les produits
            </v-btn>
          </RouterLink>
        </div>
      </v-col>
      <v-col v-else cols="12" md="8">
        <h2 class="text-lg font-bold mb-4">Votre Panier</h2>
        <v-list>
          <!-- Cart Item -->
          <v-list-item v-for="item in cartItems" :key="item.id" class="py-6 border-b border-gray-300 mb-4">
            <v-row class="items-center">
              <!-- Left Side: Avatar and Details -->
              <v-col class="pr-6" cols="auto">
                <v-list-item-avatar>
                  <v-img :src="item.image" class="rounded-md" cover height="64" width="64"></v-img>
                </v-list-item-avatar>
              </v-col>
              <v-col class="px-2">
                <v-list-item-content>
                  <v-list-item-title>{{ item.name }}</v-list-item-title>
                  <v-list-item-subtitle>{{ item.price.toFixed(2) }} $</v-list-item-subtitle>
                </v-list-item-content>
              </v-col>

              <!-- Right Side: Quantity Selector -->
              <v-col class="flex items-center space-x-2" cols="auto">
                <v-btn class="quantity-btn" color="orange" icon x-small
                       @click="UPDATE_QUANTITY({ dishId: item.id, quantity: item.quantity - 1 })">
                  <span class="text-white text-sm">−</span>
                </v-btn>
                <span class="text-base font-semibold">{{ item.quantity }}</span>
                <v-btn class="quantity-btn" color="orange" icon x-small
                       @click="UPDATE_QUANTITY({ dishId: item.id, quantity: item.quantity + 1 })">
                  <span class="text-white text-sm">+</span>
                </v-btn>
              </v-col>
            </v-row>
          </v-list-item>
        </v-list>
      </v-col>

      <!-- Right Column: Order Summary -->
      <v-col v-if="cartItems.length > 0" cols="12" md="4">
        <v-card class="pa-4">
          <h2 class="text-lg font-bold mb-4">Votre Commande</h2>
          <div class="mb-2">
            <strong>Livré à :</strong>
            <p>{{ userName }}</p>
            <p v-if="userAddress">{{ formattedAddress }}</p>
            <p v-else class="text-red-500">Adresse de livraison non définie. Veuillez mettre à jour votre
              adresse dans votre profil.</p>
          </div>
          <div class="mb-4">
            <strong>Prix Total :</strong>
            <p class="text-xl font-bold">{{ cartTotalPrice.toFixed(2) }} $</p>
          </div>
          <v-btn block color="orange" @click="checkout">
            Valider la Commande
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from '@/axiosConfig';
import {mapGetters, mapMutations} from 'vuex';

export default {
  computed: {
    ...mapGetters('cart', ['cartItems', 'cartTotalPrice']),
    ...mapGetters('auth', {
      userName: 'getUserName',
      userAddress: 'getUserAddress'
    }),
    formattedAddress() {
      if (this.userAddress) {
        const {number, street, city, state, zipCode, country} = this.userAddress;
        return `${number} ${street}, ${city}, ${state || ''} ${zipCode}, ${country}`;
      }
      return "";
    }
  },
  methods: {
    ...mapMutations('cart', ['UPDATE_QUANTITY', 'CLEAR_CART']),
    async checkout() {
      if (!this.userAddress) {
        alert("Veuillez définir votre adresse de livraison dans votre profil avant de valider la commande.");
        return;
      }

      try {
        const orderData = {
          restaurantId: this.cartItems[0].restaurantId, // Set based on the items in the cart
          clientName: this.userName,
          clientEmail: this.$store.state.auth.user.email, // Accessing user's email from the store
          deliveryAddress: this.userAddress,
          dishes: this.cartItems.map(item => ({
            menu: {
              _id: item.id,
              name: item.name,
              description: item.description,
              price: item.price,
              category: item.category,
              image: item.image,
              restaurantId: item.restaurantId,
              ingredients: item.ingredients
            },
            quantity: item.quantity
          })),
          status: "en attente d'un livreur"
        };

        const response = await axios.post('/orders/checkout', orderData);

        if (response.status === 201) {
          alert("Votre commande a été enregistrée avec succès !");
          this.CLEAR_CART();
          await axios.post(`/orders/assign-order/${response.data._id}`);
        }
      } catch (error) {
        alert("Une erreur est survenue lors de l'enregistrement de la commande.");
      }
    },
  },
};
</script>

<style scoped>
.quantity-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
</style>
