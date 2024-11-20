<template>
  <v-container class="relative-container mt-10">
    <div class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-3xl font-bold mb-8">Historique des Commandes</h1>
      <!-- Floating refresh button -->
      <v-btn class="floating-refresh-btn" color="#F36527" icon @click="fetchOrders">
        <v-icon class="white-icon">mdi-refresh</v-icon>
      </v-btn>
    </div>

    <!-- Liste des Commandes -->
    <v-row dense>
      <v-col v-for="order in orders" :key="order._id" cols="12" lg="4" md="6">
        <v-card class="mb-4" outlined>
          <v-card-title class="d-flex align-center justify-space-between">
            <span class="font-semibold">{{ order.restaurantName }}</span>
            <v-chip :color="getStatusColor(order.status)" class="white--text">
              {{ order.status }}
            </v-chip>
          </v-card-title>
          <v-card-subtitle>
            <div>Date : {{ formatDate(order.createdAt) }}</div>
            <div>Prix Total : ${{ calculateTotalPrice(order.dishes).toFixed(2) }}</div>
          </v-card-subtitle>
          <v-card-actions>
            <v-btn color="orange" text @click="openOrderDetail(order)">
              Voir les détails
              <v-icon right>mdi-chevron-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Détail de la Commande -->
    <v-dialog v-model="orderDetailDialog" max-width="500" persistent>
      <v-card class="pa-4 order-detail-card" rounded="xl">
        <div class="close-button" @click="orderDetailDialog = false">×</div>

        <h2 class="text-2xl font-bold mb-4 mt-4">{{ selectedOrder.restaurantName }}</h2>
        <v-img v-if="selectedOrder.image" :src="selectedOrder.image" aspect-ratio="1.7" class="mb-4 rounded-xl"
               cover></v-img>

        <p class="text-gray-500 mb-4">
          <strong>Commandé le :</strong> {{ formatDate(selectedOrder.createdAt) }}
        </p>

        <div class="mb-4">
          <strong class="text-lg">Adresse de Livraison</strong>
          <p class="text-gray-700">
            {{ selectedOrder.deliveryAddress.number }} {{ selectedOrder.deliveryAddress.street }},
            {{ selectedOrder.deliveryAddress.city }}, {{ selectedOrder.deliveryAddress.state }}
            {{ selectedOrder.deliveryAddress.zipCode }}, {{ selectedOrder.deliveryAddress.country }}
          </p>
        </div>

        <div class="mb-4">
          <strong class="text-lg">Plats Commandés</strong>
          <v-list dense>
            <v-list-item v-for="dish in selectedOrder.dishes" :key="dish.menu._id" class="py-2">
              <v-list-item-content>
                <div class="flex justify-between items-center">
                  <v-list-item-title>{{ dish.menu.name }}</v-list-item-title>
                  <span class="text-gray-700">x {{ dish.quantity }}</span>
                </div>
                <v-list-item-subtitle>${{
                    (dish.menu.price * dish.quantity).toFixed(2)
                  }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </div>

        <div class="mb-4">
          <strong class="text-lg">Statut de la Commande</strong>
          <v-row class="mt-2" dense>
            <v-col v-for="(stage, index) in orderStages" :key="index" :style="{
                            backgroundColor:
                                index < currentStageIndex
                                    ? '#4caf50'
                                    : index === currentStageIndex && index === orderStages.length - 1
                                        ? '#4caf50'
                                        : index === currentStageIndex
                                            ? '#ff9800'
                                            : '#e0e0e0',
                            color: index <= currentStageIndex ? '#ffffff' : '#777777',
                            height: '10px',
                            borderRadius: '5px',
                            marginRight: '4px',
                            padding: '2px 8px'
                        }"></v-col>
          </v-row>

          <v-row class="text-xs text-center mt-2" dense>
            <v-col v-for="(stage, index) in orderStages" :key="index" class="flex justify-center">
                            <span :style="{
                                color:
                                    index < currentStageIndex
                                        ? '#4caf50'
                                        : index === currentStageIndex && index === orderStages.length - 1
                                            ? '#4caf50'
                                            : index === currentStageIndex
                                                ? '#ff9800'
                                                : '#777777'
                            }">
                                {{ stage.label }}
                            </span>
            </v-col>
          </v-row>
        </div>

        <div class="text-right text-xl font-bold mt-4">
          Total : ${{ calculateTotalPrice(selectedOrder.dishes).toFixed(2) }}
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from '@/axiosConfig';
import {io} from "socket.io-client";
import {mapGetters} from 'vuex';

export default {
  data() {
    return {
      orderDetailDialog: false,
      selectedOrder: {},
      orderStages: [
        {label: "En attente d'un livreur"},
        {label: "En cours de préparation"},
        {label: "En cours de livraison"},
        {label: "Livrée"},
      ],
      orders: [],
      socket: null,
    };
  },
  computed: {
    ...mapGetters('auth', {
      userAuth: 'getAuthState'
    }),
    currentStageIndex() {
      return this.orderStages.findIndex((stage) => stage.label.toLowerCase() === this.selectedOrder.status);
    },
  },
  methods: {
    openOrderDetail(order) {
      this.selectedOrder = order;
      this.orderDetailDialog = true;
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('fr-FR');
    },
    calculateTotalPrice(dishes = []) {
      return dishes.reduce((total, dish) => total + (dish.menu.price || 0) * dish.quantity, 0);
    },
    getStatusColor(status) {
      switch (status.toLowerCase()) {
        case "en attente d'un livreur":
          return "#03a9f4"; // Blue
        case "en cours de préparation":
          return "#ff9800"; // Orange
        case "en cours de livraison":
          return "#ffeb3b"; // Yellow
        case "livrée":
          return "#4caf50"; // Green
        default:
          return "#777777"; // Gray
      }
    },
    async fetchOrders() {
      try {
        const response = await axios.get(`/orders/userOrders`);
        if (response.data) {
          this.orders = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else {
          console.error("No data received for orders");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    },
    listenForOrderUpdates() {
      this.socket.on("orderStatusUpdated", (data) => {
        const {orderId, status} = data;
        const updatedOrder = this.orders.find((order) => order._id === orderId);
        if (updatedOrder) {
          updatedOrder.status = status;
        }
      });
    },
  },
  mounted() {
    this.fetchOrders();// Initialize Socket.io connection
    this.socket = io("http://localhost:3000");
    // Join the room for this user based on their email
    const clientEmail = this.userAuth.email;
    this.socket.emit("register", {clientEmail});
    // Listen for order updates
    this.listenForOrderUpdates();
  },
  beforeUnmount() {
    // Disconnect socket when component is unmounted
    if (this.socket) {
      this.socket.disconnect();
    }
  },
};
</script>

<style scoped>
.order-detail-card {
  position: relative;
}

.close-button {
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  position: absolute;
  top: 16px;
  right: 16px;
  color: #333;
}

.relative-container {
  position: relative;
}

.floating-refresh-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1;
}

.white-icon {
  color: white !important;
}
</style>
