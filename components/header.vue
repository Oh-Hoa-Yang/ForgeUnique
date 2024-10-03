<template>
  <div>
    <ion-header>
      <ion-toolbar color="light">
        <ion-buttons slot="start">
          <div class="left-logo">
            <img class="logo" src="/public/img/header.png" alt="ForgeUnique Logo" />
          </div>
        </ion-buttons>

        <ion-title class="slogan">"Forge Your Unique Path"</ion-title>

        <ion-buttons slot="end">
          <!-- Menu Button -->
          <ion-menu-button :auto-hide="false" />
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <!-- Ion Menu -->
    <ion-menu side="end" menu-id="main-menu" content-id="main-content">
      <ion-header>
        <ion-toolbar>
          <ion-title>Menu</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-item @click="navigateTo('/home')">
            Home
            <ion-icon :icon="homeIcon" slot="end" style="color: #FD8395"></ion-icon>
          </ion-item>
          <ion-item @click="navigateTo('/calendar')">
            Calendar
            <ion-icon :icon="calendarIcon" slot="end" style="color: #FD8395"></ion-icon>
          </ion-item>
          <ion-item @click="navigateTo('/progress')">
            Progress
            <ion-icon :icon="progressIcon" slot="end" style="color: #FD8395"></ion-icon>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-menu>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { homeOutline as homeIcon, calendarOutline as calendarIcon, barChartOutline as progressIcon } from 'ionicons/icons';

const router = useRouter();
const navigateTo = (path) => router.push(path);
</script>

<script setup>
// No additional script logic is required. Let Ionic handle the menu behavior automatically.
</script>

<style scoped>
/* Adjust styles for responsive layout */
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
</style>
