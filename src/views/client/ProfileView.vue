<script>
import {mapGetters} from 'vuex';

export default {
  computed: {
    ...mapGetters('auth', {
      userName: 'getUserName',
      userAddress: 'getUserAddress',
      userRole: 'getUserRole',
      userEmail: 'getUserEmail'
    }),
    formattedAddress() {
      if (this.userAddress) {
        const {number, street, city, state, zipCode, country} = this.userAddress;
        return `${number} ${street}, ${city}, ${state || ''} ${zipCode}, ${country}`;
      }
      return "";
    }
  }
}
</script>

<template>
  <div
      class="profile-page w-33 mx-auto max-w-4xl p-6 bg-gray-100 rounded-lg shadow-md mt-20 flex flex-column items-center">
    <!-- Titre -->
    <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">Mon Profil</h1>

    <!-- Section d'information utilisateur -->
    <div class="profile-info flex items-center space-x-6 mb-8">
      <div class="flex-1">
        <h2 class="text-2xl font-semibold text-gray-800">{{ userName }}</h2>
        <p class="text-gray-600"><strong>Email:</strong> {{ userEmail }}</p>
        <p class="text-gray-600"><strong>Rôle:</strong> {{ userRole }}</p>
        <p class="text-gray-600"><strong>Adresse:</strong> {{ formattedAddress }}</p>
      </div>
    </div>

    <div class="">
      <!-- Bouton Modifier -->
      <RouterLink to="/profile/edit">
        <button class="text-white bg-[#F36527] rounded-[30px] px-[20px] py-[10px]">
          Modifier
        </button>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  background-color: #f9fafb;
}

.profile-info img {
  object-fit: cover;
}

.profile-activity ul li {
  list-style: none;
  padding-left: 1rem;
  position: relative;
}

.profile-activity ul li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #4b5563;
}
</style>
