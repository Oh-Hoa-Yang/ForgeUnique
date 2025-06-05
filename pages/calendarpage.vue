<template>
  <!-- Main Page with Content -->
  <ion-page id="main-content">
    <!-- Main Content (imported component) -->
      <Calendar />
  </ion-page>
</template>

<script setup>
import Calendar from '~/components/calendar.vue';
import { useRoute } from 'vue-router';

const route = useRoute();

definePageMeta({
  middleware: 'auth'
})
</script>
