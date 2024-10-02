<template>
  <!-- Ion App is required to encapsulate the whole structure -->
  <ion-app>
    <!-- Ion Menu -->
    <ion-menu side="end" menu-id="main-menu" content-id="main-content">
      <ion-header>
        <ion-toolbar>
          <ion-title>Menu</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <!-- Navigation options for the menu -->
          <ion-item href="/homepage">Home
            <ion-icon :icon="homeIcon" slot="end" style="color: #FD8395"></ion-icon>
          </ion-item>
          <!-- Add more items as needed -->
        </ion-list>
      </ion-content>
    </ion-menu>

    <!-- Main Page with Tabs -->
    <ion-page id="main-content">
      <!-- Including Header here directly instead of importing from another component -->
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

      <!-- Tabs Content -->
      <ion-tabs>
        <!-- Home Tab -->
        <ion-tab tab="home">
          <Home />
        </ion-tab>

        <!-- Calendar Tab -->
        <ion-tab tab="calendar">
          <Calendar />
        </ion-tab>

        <!-- Progress Tab -->
        <ion-tab tab="progress">
          <Progress />
        </ion-tab>

        <ion-tab-bar slot="bottom">
          <!-- Calendar Tab Button -->
          <ion-tab-button tab="calendar">
            <ion-icon :icon="calendarIcon" />
            <ion-label>Calendar</ion-label>
          </ion-tab-button>

          <!-- Home Tab Button -->
          <ion-tab-button tab="home">
            <ion-icon :icon="homeIcon" />
            <ion-label>Home</ion-label>
          </ion-tab-button>

          <!-- Progress Tab Button -->
          <ion-tab-button tab="progress">
            <ion-icon :icon="progressIcon" />
            <ion-label>Progress</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
      </ion-tabs>
    </ion-page>
  </ion-app>
</template>

<script setup>
import { IonTabs, IonTab, IonTabBar, IonTabButton, IonIcon, IonMenu, IonMenuButton } from '@ionic/vue';
import Home from '~/components/home.vue';
import Calendar from '~/components/calendar.vue';
import Progress from '~/components/progress.vue';

import { homeOutline as homeIcon, calendarOutline as calendarIcon, barChartOutline as progressIcon } from 'ionicons/icons';

// You don't need to explicitly export, just define everything
const components = {
  IonTabs,
  IonTab,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonMenu,
  IonMenuButton,
  Home,
  Calendar,
  Progress,
};

const icons = {
  homeIcon,
  calendarIcon,
  progressIcon,
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

/* Custom styling for the tab bar */
ion-tab-button {
  --color-selected: #FD8395; /* Color when selected */
  --color: #666666; /* Default color */
}

/* Styling for content within each page */
.example-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
