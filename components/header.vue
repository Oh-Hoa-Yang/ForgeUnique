<template>
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
        <button class="close-menu" @click="closeMenu">x</button>
      </div>
      <div class="menu-items">
        <button @click="navigateToPage('/homepage')">
          <ion-icon :icon="homeIcon" class="menu-icon" /> 
          Home
        </button>
        <button @click="navigateToPage('/calendarpage')">
          <ion-icon :icon="calendarIcon" class="menu-icon" /> 
          Calendar
        </button>
        <button @click="navigateToPage('/progresspage')">
          <ion-icon :icon="progressIcon" class="menu-icon" /> 
          Progress
        </button>
        <button @click="logout">
          <ion-icon :icon="logoutIcon" class="menu-icon" /> 
          Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { IonIcon } from '@ionic/vue';
import { menuOutline as menuIcon } from 'ionicons/icons';
import { homeOutline as homeIcon, calendarOutline as calendarIcon, barChartOutline as progressIcon, logOutOutline as logoutIcon } from 'ionicons/icons';
import { useAppToast } from '~/composables/useAppToast';

const router = useRouter();
const supabase = useSupabaseClient();
const { toastError, toastSuccess } = useAppToast();
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

// Logout function
const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      toastSuccess({ title: 'Logged out', description: 'Successfully logged out!' });
      reloadNuxtApp();
      router.push('/login');
    } else {
      handleError({ title: 'Error',  description:'Failed to log out!'});
    }
  } catch (e) {
    console.error('Error logging out:', e);
    toastError({ title: 'Error', description: 'An unexpected error occurred while logging out!' });
  }
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

/* Menu Items */
.menu-items {
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.menu-items button {
  display: flex;
  align-items: center;
  padding: 10px;
  border: none;
  background: none;
  text-align: left;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  margin-bottom: 10px;
}

.menu-items button ion-icon {
  margin-right: 10px; /* Add space between icon and text */
  color: #FD8395;
}

.menu-items button:hover {
  color: #FD8395;
}
</style>
