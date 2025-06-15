<template>
  <ion-app>
    <ion-content class="ion-padding custom-background">
      <!-- Main Content -->
      <slot />
    </ion-content>
    <UNotifications />
  </ion-app>
</template>

<script setup>
definePageMeta({
  layout: 'auth'
})
</script>

<style>
.custom-background {
  --background: #FFEDF5;
}

.ion-page {
  overflow: auto !important;
}

ion-content {
  --overflow: auto !important;
}

/* Ensure content is scrollable */
:deep(.ion-content-scroll-host) {
  overflow: auto !important;
}
</style> 