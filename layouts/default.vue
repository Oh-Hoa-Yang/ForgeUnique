<template>
  <ion-app class="min-w-screen flex flex-col min-h-screen">
    <!-- Header Component with sliding menu -->
    <Header />
    
    <!-- Main Content -->
    <ion-content>
        <slot />
    </ion-content>
    
    <!-- Footer Component -->
    <Footer :current-route="$route.path" />
    
    <UNotifications />
  </ion-app>
</template>

<script setup>
import Header from '~/components/header.vue';
import Footer from '~/components/footer.vue';

definePageMeta({
  layout: 'default'
})
</script>

<style>
/* Global styles to hide scrollbars but keep functionality */
::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  background: transparent !important;
}

* {
  -ms-overflow-style: none !important;  /* IE and Edge */
  scrollbar-width: none !important;  /* Firefox */
}

ion-content::part(scroll) {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

ion-content::part(scroll)::-webkit-scrollbar {
  display: none !important;
}

/* Add padding to the bottom of the content to account for the footer */
ion-content {
  --padding-bottom: 60px; /* Adjust this value based on your footer height */
}
</style>

<style scoped>
:deep(.ion-page) {
  overflow: auto;
}

:deep(.scroll-y) {
  overflow-y: auto !important;
}

:deep(ion-content) {
  --overflow: auto;
}
</style> 