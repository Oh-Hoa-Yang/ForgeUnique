<template>
  <!-- Bottom Navigation -->
  <div class="bottom-nav">
    <button @click="navigateToPage('/calendarpage')" :class="{ active: isActive('/calendarpage') }" class="tab-button">
      <ion-icon :icon="calendarIcon"></ion-icon>
    </button>
    <button @click="navigateToPage('/homepage')" :class="{ active: isActive('/homepage') }" class="tab-button">
      <ion-icon :icon="homeIcon"></ion-icon>
    </button>
    <button @click="navigateToPage('/recordpage')" :class="{ active: isActive('/recordpage') }" class="tab-button">
      <ion-icon :icon="recordingIcon"></ion-icon>
    </button>
  </div>
</template>

<script setup>
import { homeOutline as homeIcon, calendarOutline as calendarIcon, recordingOutline as recordingIcon } from 'ionicons/icons';

const props = defineProps({
  currentRoute: String //Receive the current active route from the parent
});

const route = useRoute();
const router = useRouter()

// Navigate using Nuxt's router.push
const navigateToPage = (path) => {
  router.push(path);
};

// Check if the current route is active
const isActive = (path) => {
  return props.currentRoute === path;
};
</script>

<style scoped>
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