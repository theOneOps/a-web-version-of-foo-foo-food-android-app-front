<script setup>
const {userMail, role} = defineProps({
  userMail: {
    type: String,
    default: "johnDoe@example.com"
  },
  role: {
    type: String,
    default: "client"
  }
})
</script>

<template>
  <div class="flex border border-gray-200 p-2 space-x-2 rounded-full">
    <v-avatar color="surface-variant"></v-avatar>
    <div class="flex flex-col justify-center">
      <span class="text-md">{{ userMail }}</span>
      <span class="text-sm text-gray-500">{{ role }}</span>
    </div>
  </div>
</template>
