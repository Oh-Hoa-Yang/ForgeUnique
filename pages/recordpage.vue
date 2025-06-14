<template>
  <!-- Main Page with Content -->
  <ion-page id="main-content" class="bg-[#FFEDF5]">
    <!-- Main Content (imported component) -->
      <Record />
  </ion-page>
</template>

<script setup>
import Record from '~/components/record.vue';
import { useRoute } from 'vue-router';

const route = useRoute();

definePageMeta({
  middleware: 'auth'
})
</script>
