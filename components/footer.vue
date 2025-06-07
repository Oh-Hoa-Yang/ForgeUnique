<template>
  <!-- Using Ionic's native footer component -->
  <ion-footer>
    <ion-toolbar>
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
    </ion-toolbar>
  </ion-footer>
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
  width: 100%;
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

/* Add styles for ion-footer and ion-toolbar */
ion-footer {
  position: relative;
  bottom: 0;
  width: 100%;
}

ion-toolbar {
  --background: #fff;
  --border-color: #ddd;
}
</style>