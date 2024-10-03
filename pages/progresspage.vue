<template>
  <!-- Main Page with Content -->
  <ion-page id="main-content">
    <!-- Including Header directly -->
    <ion-header>
      <ion-toolbar color="light">
        <ion-buttons slot="start">
          <div class="left-logo">
            <img class="logo" src="/public/img/header.png" alt="ForgeUnique Logo" />
          </div>
        </ion-buttons>

        <ion-title class="slogan">"Forge Your Unique Path"</ion-title>

        <ion-buttons slot="end">
          <!-- Menu Button using IonIcon -->
          <button class="icon-button" @click="toggleMenu">
            <ion-icon :icon="menuIcon"></ion-icon>
          </button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <!-- Sliding Menu with Overlay -->
    <div :class="['menu-wrapper', { open: menuVisible }]">
      <div class="menu-overlay" @click="closeMenu"></div>

      <div class="menu-content">
        <div class="menu-header">
          <h3 style="color: black;">Menu</h3>
          <button class="close-menu" @click="closeMenu">X</button>
        </div>
        <div class="menu-items">
          <button @click="navigateToPage('/homepage')">Home</button>
          <button @click="navigateToPage('/calendarpage')">Calendar</button>
          <button @click="navigateToPage('/progresspage')">Progress</button>
        </div>
      </div>
    </div>

    <!-- Main Content (imported component) -->
    <ion-content>
      <Progress />
    </ion-content>

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
  </ion-page>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
import { IonIcon, IonPage } from '@ionic/vue';
import { homeOutline as homeIcon, calendarOutline as calendarIcon, barChartOutline as progressIcon, menuOutline as menuIcon } from 'ionicons/icons';
import Progress from '~/components/progress.vue';

const router = useRouter();
const route = useRoute();
const menuVisible = ref(false);

// Function to toggle menu visibility
const toggleMenu = () => {
  menuVisible.value = !menuVisible.value;
};

// Function to close the menu
const closeMenu = () => {
  menuVisible.value = false;
};

// Function to navigate using Nuxt's router.push
const navigateToPage = (path) => {
  menuVisible.value = false; // Close menu on navigation
  router.push(path);
};

// Function to check if the current route is active
const isActive = (path) => {
  return route.path === path;
};
</script>

<style scoped>
/* Styling for the header */
ion-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-logo {
  display: flex;
  align-items: center;
}

.logo {
  width: 100px;
}

.slogan {
  color: #FD8395;
  font-size: 1.5rem;
  font-style: italic;
  text-align: center;
}

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

/* Styling for the menu icon button */
.icon-button {
  background-color: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.icon-button ion-icon {
  color: #666;
}

.icon-button:hover ion-icon {
  color: #FD8395;
}

/* Sliding menu styles */
.menu-wrapper {
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  z-index: 1000;
  display: none; /* Hide by default */
  pointer-events: none;
}

.menu-wrapper.open {
  display: flex; /* Show when open */
  pointer-events: auto;
}

.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0s linear 0.3s;
}

.menu-content {
  background-color: white;
  width: 250px;
  height: 100%;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.3);
  position: relative;
  right: -250px;
  transition: right 0.3s ease;
}

.menu-wrapper.open .menu-overlay {
  opacity: 1;
  visibility: visible;
  transition-delay: 0s;
}

.menu-wrapper.open .menu-content {
  right: 0;
}

/* Menu Header */
.menu-header {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #ddd;
}

.close-menu {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: black;
}

.menu-items button {
  display: block;
  width: 100%;
  padding: 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: 16px;
  color: #666;
}

.menu-items button:hover {
  color: #FD8395;
}
</style>
