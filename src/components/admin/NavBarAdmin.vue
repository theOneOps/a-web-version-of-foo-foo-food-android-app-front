<script setup>
import UserAdmin from "./UserAdmin.vue";
import {RouterLink, useRoute} from "vue-router";

// pour savoir sur quel route on se trouve et ainsi ajouter une class pour styliser
const isActiveLink = (routePath) => {
  const current_route = useRoute();
  return current_route.path == routePath;
};

</script>

<template>
  <div class="flex justify-between w-full px-2 py-1 border-b-2 items-center">
    <div class="flex justify-center items-center space-x-2">
      <v-avatar color="surface-variant"></v-avatar>
      <h1>Foo-foo-food</h1>
    </div>

    <!--all the rests of the link nav here -->
    <RouterLink to="/auth/login">
      <v-btn variant="outlined"> Connexion</v-btn>
    </RouterLink>
    <RouterLink to="/auth/registration">
      <v-btn variant="outlined"> Registration</v-btn>
    </RouterLink>

    <UserAdmin role="admin" userMail="admin@example.com"/>
  </div>

  <div>
    <div class="flex justify-center items-center w-full p-2">
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
  </div>
</template>
