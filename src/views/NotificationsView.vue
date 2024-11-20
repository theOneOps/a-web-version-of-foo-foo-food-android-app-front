<script setup>
import {onMounted, ref} from "vue";
import api from "../services/api";
import store from "../store";
import dayjs from "dayjs";

const userAuth = store.getters["auth/getAuthState"];
const id = userAuth?.id;

// Liste des notifications
const notifications = ref([]);

// Charger les notifications
const fetchNotifications = async () => {
  if (!id) {
    console.error("ID utilisateur non défini. Impossible de charger les notifications.");
    return;
  }

  try {
    const response = await api.get(`/notifications/${id}`);
    notifications.value = response.data;
  } catch (error) {
    console.error("Erreur lors du chargement des notifications :", error);
  }
};

const formatDate = (dateString) => {
  return dayjs(dateString).format('DD MMMM YYYY à HH:mm');
};

const makeAllNotificationsRead = async () => {
  try {
    await api.put(`/notifications/markAsRead/${id}`);
    fetchNotifications();
  } catch (error) {
    console.error("Erreur lors de la mise à jour des notifications :", error);
  }
};

onMounted(makeAllNotificationsRead);
</script>

<template>
  <div class="notifications-container">
    <h1 class="font-weight-bold text-3xl">📬 Vos Notifications</h1>

    <!-- Affichage des notifications -->
    <div v-if="notifications.length > 0">
      <div
          v-for="notification in notifications"
          :key="notification._id"
          class="notification-card"
      >
        <div class="notification-header">
          <h3 class="notification-status">{{ notification.status_order }}</h3>
        </div>
        <p class="notification-body">{{ notification.body }}</p>
        <small class="notification-date">{{ formatDate(notification.createdAt) }}</small>
      </div>
    </div>

    <!-- Message si aucune notification n'est disponible -->
    <div v-else class="no-notifications">
      <p>Aucune notification à afficher pour le moment. 💤</p>
    </div>
  </div>
</template>

<style scoped>
/* Conteneur global */
.notifications-container {
  margin: 20px auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Titre principal */
.notifications-container h1 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 24px;
}

/* Style des cartes de notification */
.notification-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.notification-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* En-tête de la notification */
.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

/* Statut de la commande */
.notification-status {
  font-size: 18px;
  font-weight: bold;
  color: #007bff;
  margin: 0;
}

/* Date de la notification */
.notification-date {
  font-size: 12px;
  color: #777;
}

/* Contenu de la notification */
.notification-body {
  font-size: 16px;
  color: #555;
  line-height: 1.5;
}

/* Message pour aucune notification */
.no-notifications {
  text-align: center;
  font-size: 16px;
  color: #888;
  margin-top: 20px;
  padding: 20px;
  background-color: #f0f0f0;
  border-radius: 8px;
}
</style>
