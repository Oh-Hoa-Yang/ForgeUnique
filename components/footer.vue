<template>
  <!-- Bottom Navigation -->
  <div class="bottom-nav">
    <button @click="navigateToPage('/calendarpage')" :class="{ active: isActive('/calendarpage') }" class="tab-button">
      <ion-icon :icon="calendarIcon"></ion-icon>
    </button>

    <button @click="navigateToPage('/homepage')" :class="{ active: isActive('/homepage') }" class="tab-button">
      <ion-icon :icon="homeIcon"></ion-icon>
    </button>

    <button @click="navigateToPage('/progresspage')" :class="{ active: isActive('/progresspage') }" class="tab-button">
      <ion-icon :icon="progressIcon"></ion-icon>
    </button>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
import { IonIcon } from '@ionic/vue';
import { homeOutline as homeIcon, calendarOutline as calendarIcon, barChartOutline as progressIcon } from 'ionicons/icons';

const router = useRouter();
const route = useRoute();

// Function to navigate using Nuxt's router.push
const navigateToPage = (path) => {
  router.push(path);
};

// Function to check if the current route is active
const isActive = (path) => {
  return route.path === path;
};
</script>

<style scoped>
/* Custom styling for the bottom navigation buttons */
.bottom-nav {
  display: flex;
  justify-content: space-around;
  padding: 10px;
  background-color: #fff;
  position: fixed;
  bottom: 0;
  width: 100%;
  border-top: 1px solid #ddd;
  z-index: 1;
}

.tab-button {
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 24px;
}

.tab-button.active ion-icon {
  color: #FD8395; /* Active color */
}

ion-icon {
  color: #666;
}

.tab-button:hover ion-icon {
  color: #FD8395;
}
</style>
