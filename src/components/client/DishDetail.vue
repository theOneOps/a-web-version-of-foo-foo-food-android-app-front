<template>
  <v-card class="pa-4 fill-height dish-detail-card" rounded="xl">
    <!-- Close Button -->
    <div class="close-button"
         role="button"
         tabindex="0"
         @click="close"
         @keydown.enter="close">×
    </div>

    <!-- Dish Name -->
    <h2 class="text-2xl font-bold mb-6 mt-4">{{ dish.name }}</h2>

    <!-- Dish Description -->
    <p class="text-gray-700 mb-6">{{ dish.description }}</p>

    <!-- Dish Image -->
    <v-img :src="dish.image || '/logo.svg'" aspect-ratio="1.7" class="mb-2" cover rounded="xl"></v-img>

    <div class="font-sans flex items-center justify-between mt-6 mb-4">
      <!-- Price on the left -->
      <span class="text-xl font-bold">${{ dish.price }}</span>
      <!-- Quantity Counter -->
      <div class="flex items-center justify-start space-x-2">
        <v-btn class="quantity-btn" color="orange" icon @click="updateQuantity(-1)">
          <span class="text-white text-base">−</span>
        </v-btn>
        <span class="text-base font-semibold">{{ quantity }}</span>
        <v-btn class="quantity-btn" color="orange" icon @click="updateQuantity(1)">
          <span class="text-white text-base">+</span>
        </v-btn>
      </div>

    </div>
    <div>
      <h2 class="text-2xl">Les ingredients</h2>
      <ul v-if="dish.ingredients.length!==0">
        <li v-for="(item,idx) in dish.ingredients" :key="idx" class="italic">
          {{ item }}
        </li>
      </ul>
    </div>
  </v-card>
</template>


<script>
import {mapGetters, mapMutations} from 'vuex';

export default {
  props: {
    dish: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapGetters('cart', ['cartItems']),
    quantity() {
      const cartItem = this.cartItems.find((item) => item.id === this.dish.id);
      return cartItem ? cartItem.quantity : 0;
    },

  },
  methods: {
    ...mapMutations('cart', ['ADD_TO_CART', 'UPDATE_QUANTITY']),
    close() {
      this.$emit('close');
    },
    updateQuantity(amount) {
      const newQuantity = this.quantity + amount;

      if (newQuantity > 0) {
        if (this.quantity === 0) {
          this.ADD_TO_CART({...this.dish, quantity: 1});
        } else {
          this.UPDATE_QUANTITY({dishId: this.dish.id, quantity: newQuantity});
        }
      } else {
        this.UPDATE_QUANTITY({dishId: this.dish.id, quantity: 0});
      }
    },
  },
};
</script>

<style scoped>
.dish-detail-card {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
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

.close-button {
  font-size: 2rem;
  font-weight: bold;
  cursor: pointer;
  position: absolute;
  top: 16px;
  right: 16px;
  line-height: 1;
}

.rounded-image {
  border-radius: 100px;
}
</style>