<template>
  <v-container fluid>
    <v-row class="my-4 mx-5">
      <v-col>
        <div class="flex justify-between items-center p-4 bg-gray-100 rounded-md shadow-sm">
          <h2 class="text-2xl font-bold">Tableau de bord du livreur</h2>

          <div class="flex items-center space-x-4">
            <v-btn :loading="isLoading" color="#F36527" @click="toggleAvailability">
              Prendre une livraison
            </v-btn>

            <v-btn v-if="isLoading" color="error" @click="toggleAvailability">
              Annuler
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row class="mx-5">
      <v-col cols="4">
        <div class="bg-gray-50 p-6 rounded-lg shadow-md">
          <h3 class="text-xl font-semibold mb-4">Historique des commandes</h3>
          <OrderList :orders="orders" :selectedOrder="selectedOrder" @update:selectedOrder="setSelectedOrder"/>
        </div>
      </v-col>

      <v-col cols="8">
        <OrderDetails :order="selectedOrderDetails" @updateStatus="updateOrderStatus"/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import OrderList from "./OrderList.vue";
import OrderDetails from "./OrderDetails.vue";
import api from "@/services/api";
import {mapGetters} from "vuex";
import io from "socket.io-client";

export default {
  components: {
    OrderList,
    OrderDetails,
  },
  data() {
    return {
      selectedOrder: null,
      isLoading: false,
      orders: [], // Stocke les commandes récupérées
      socket: null,
    };
  },
  computed: {
    ...mapGetters({
      deliveryManEmail: "auth/getUserEmail",
    }),
    selectedOrderDetails() {
      return this.orders.find((order) => order._id === this.selectedOrder) || null;
    },
  },
  methods: {
    async fetchOrders() {
      try {
        this.isLoading = true;
        const response = await api.get(`/orders/deliveryMan/${this.deliveryManEmail}`);
        this.orders = response.data; // Mets à jour la liste des commandes
      } catch (error) {
        console.error("Erreur lors de la récupération des commandes :", error);
      } finally {
        this.isLoading = false;
      }
    },
    setSelectedOrder(orderId) {
      this.selectedOrder = orderId;
    },
    async updateAvailability(isAvailable) {
      try {
        await api.put("/users/delivery/deliveryAvailability", {
          available: isAvailable,
        });
        console.log("Disponibilité mise à jour avec succès.");
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la disponibilité :", error);
      }
    },
    async toggleAvailability() {
      this.isLoading = !this.isLoading;
      await this.updateAvailability(this.isLoading);
      if (this.isLoading) {
        console.log("L'utilisateur est maintenant disponible pour recevoir des commandes.");
        //await this.fetchPendingOrders();
      } else {
        console.log("L'utilisateur n'est plus disponible.");
      }
    },
    handleUpdateStatus({orderId, status}) {
      const orderIndex = this.orders.findIndex(order => order._id === orderId);
      if (orderIndex !== -1) {
        this.$set(this.orders, orderIndex, {...this.orders[orderIndex], status});
      }
    },

    handleOrderAssigned(order) {
      this.orders.push(order);
      this.selectedOrder = order._id;
      this.isLoading = false; // Mettre à jour la disponibilité à false
      this.updateAvailability(false); // Actualiser la disponibilité sur le serveur
    },
    connectSocket() {
      this.socket = io("http://localhost:3000");
      this.socket.on("connect", () => {
        this.socket.emit("join", this.deliveryManEmail); // Rejoindre la salle spécifique
        this.socket.on("orderAssigned", (data) => {
          this.handleOrderAssigned(data.order);
        });
      });
    },
  },
  async mounted() {
    // Récupérer les commandes assignées dès le chargement
    await this.fetchOrders();

    // Configurer Socket.IO
    this.connectSocket();
  },
  beforeDestroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
  },
};
</script>


<style scoped>
.text-2xl {
  font-size: 1.5rem;
}

.font-bold {
  font-weight: bold;
}

.mb-4 {
  margin-bottom: 1rem;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.space-x-4 > :not([hidden]) ~ :not([hidden]) {
  margin-left: 1rem;
}
</style>
