<template>
  <v-list lines="two">
    <v-list-item
        v-for="order in orders"
        :key="order._id"
        :class="{ 'selected-item': selectedOrder === order._id }"
        @click="toggleSelection(order._id)"
    >
      <v-list-item-title>{{ order.clientName }} - {{ order.restaurantName }}</v-list-item-title>
      <v-list-item-subtitle>Status : {{ order.status }}</v-list-item-subtitle>
    </v-list-item>
  </v-list>
</template>

<script>
export default {
  props: {
    orders: Array,
    selectedOrder: Number,
  },
  emits: ['update:selectedOrder'],
  methods: {
    toggleSelection(orderId) {
      this.$emit('update:selectedOrder', this.selectedOrder === orderId ? null : orderId);
    },
  },
};
</script>

<style scoped>
.selected-item {
  background-color: rgba(246, 159, 121, 0.16);
}
</style>
