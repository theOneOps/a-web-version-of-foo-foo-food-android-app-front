<script setup>
import AddRestaurantForm from '../../components/admin/AddRestaurantForm.vue';

const {increaseUsersArray} = defineProps({
  increaseUsersArray: Function
})

</script>

<template>
  <div>
    <v-dialog max-width="500">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn
            color="surface-variant"
            text="AJOUTER RESTAURANT"
            v-bind="activatorProps"
            variant="flat"
        ></v-btn>
      </template>

      <template v-slot:default="{ isActive }">
        <v-card class="text-center" title="Formulaire ajout d'un nouveau restaurant">
          <AddRestaurantForm :increaseUsersArray="increaseUsersArray"/>
          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn
                text="FERMER"
                @click="isActive.value = false"
            ></v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
  </div>
</template>
