<template>
  <ion-app>
    <ion-content class="ion-padding custom-background" :scroll-y="false">
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

<style scoped>
.custom-background {
  --background: #FFEDF5;
  overflow: hidden;
}

:deep(.ion-page) {
  overflow: hidden;
}

:deep(.scroll-y) {
  overflow: hidden !important;
}

:deep(ion-content) {
  --overflow: hidden;
}
</style> 