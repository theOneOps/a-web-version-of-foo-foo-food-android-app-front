<template>
  <div v-if="order" class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold mb-4">Détails de la Commande</h2>
    <div class="mb-4">
      <div class="flex items-center mb-2">
        <v-icon class="mr-2" color="primary">mdi-account</v-icon>
        <p><strong>Client :</strong> {{ order.clientName }} <span class="text-gray-500">({{ order.clientEmail }})</span>
        </p>
      </div>

      <div class="flex items-center mb-2">
        <v-icon class="mr-2" color="primary">mdi-truck-delivery</v-icon>
        <p><strong>Adresse de Livraison :</strong> {{ formatAddress(order.deliveryAddress) }}</p>
      </div>

      <div class="flex items-center mb-2">
        <v-icon class="mr-2" color="primary">mdi-store</v-icon>
        <p><strong>Restaurant :</strong> {{ order.restaurantName }}</p>
      </div>

      <div class="flex items-center mb-2">
        <v-icon class="mr-2" color="primary">mdi-map-marker</v-icon>
        <p><strong>Adresse du Restaurant :</strong> {{ formatAddress(order.restaurantAddress) }}</p>
      </div>

      <div class="flex items-center mb-2">
        <v-icon class="mr-2" color="primary">mdi-timer</v-icon>
        <p><strong>Statut de la commande :</strong> <span
            :class="getStatusClass(order.status)">{{ order.status }}</span></p>
      </div>

      <h3 class="text-lg font-semibold mt-6">Plats</h3>
      <ul class="mb-4">
        <li v-for="(dish, index) in order.dishes" :key="index"
            class="flex justify-between items-center py-2 border-b border-gray-200">
          <div>
            <p class="font-medium">{{ dish.menu.name }}</p>
            <p class="text-[#F36527] text-sm">Quantité : {{ dish.quantity }}</p>
          </div>
          <p class="font-semibold text-[#F36527]">{{ calculateTotalPrice(dish) | "$" }} $</p>
        </li>
      </ul>

      <div class="flex justify-end mt-6">
        <v-btn :disabled="order.status === 'livrée'" class="mt-4" color="#F36527" @click="changeStatus">
          Changer le statut de la commande
        </v-btn>
      </div>
    </div>
  </div>
  <div v-else class="text-center">
    <h2 class="text-xl font-semibold mt-10">Sélectionnez une commande pour voir les détails</h2>
  </div>
</template>

<script>
import api from "@/services/api";

export default {
  props: {
    order: Object,
  },
  methods: {
    formatAddress(address) {
      return `${address.street} ${address.number}, ${address.city}, ${address.state || ''} ${address.zipCode}, ${address.country}`;
    },
    calculateTotalPrice(dish) {
      return dish.menu.price * dish.quantity;
    },
    async changeStatus() {
      const statuses = [
        "en attente d'un livreur",
        "en cours de préparation",
        "en cours de livraison",
        "livrée",
      ];
      const currentIndex = statuses.indexOf(this.order.status);
      const nextIndex = (currentIndex + 1) % statuses.length;
      const newStatus = statuses[nextIndex];

      try {
        await api.put(`/orders/order/${this.order._id}/status`, {status: newStatus});
        this.order.status = newStatus; // Mettre à jour localement le statut de la commande
        this.$emit("updateStatus", {orderId: this.order._id, status: newStatus});
      } catch (error) {
        console.error("Erreur lors de la mise à jour du statut de la commande :", error);
      }
    },
    getStatusClass(status) {
      const statusClasses = {
        "en attente d'un livreur": 'text-yellow-500 font-semibold',
        "en cours de préparation": 'text-blue-500 font-semibold',
        "en cours de livraison": 'text-orange-500 font-semibold',
        "livrée": 'text-green-500 font-semibold',
      };
      return statusClasses[status] || 'text-gray-500 font-semibold';
    },
  },
};
</script>

<style scoped>
.text-xl {
  font-size: 1.25rem;
}

.font-semibold {
  font-weight: 600;
}

.mt-4 {
  margin-top: 1rem;
}
</style>
