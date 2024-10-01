<template>
  <ion-header>
    <ion-toolbar color="light">
      <!-- Left Logo -->
      <ion-buttons slot="start">
        <div class="left-logo">
          <img class="logo" src="/public/img/header.png" alt="ForgeUnique Logo" />
        </div>
      </ion-buttons>

      <!-- Middle Slogan -->
      <ion-title class="slogan">"Forge Your Unique Path"</ion-title>

      <!-- Right Menu Icon -->
      <ion-buttons slot="end">
        <!-- No need for custom @click, let Ionic handle it -->
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
        <ion-item @click="$router.push('/home')">Home</ion-item>
        <!-- Add more items as needed -->
      </ion-list>
    </ion-content>
  </ion-menu>
</template>

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
