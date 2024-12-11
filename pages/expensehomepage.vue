<template>
  <!-- Main Page with Content -->
  <ion-page id="main-content">
    <!-- Header Component -->
    <Header />

    <!-- Main Content (imported component) -->
    <ion-content>
      <Expensehome />
    </ion-content>

    <!-- Footer Component -->
    <Footer :current-route="route.path" />
  </ion-page>
</template>

<script setup>
import Header from '~/components/header.vue';
import Footer from '~/components/footer.vue';
import Expensehome from '~/components/expensehome.vue';
import { useRoute } from 'vue-router';

const route = useRoute();

definePageMeta({
  middleware: 'auth'
})
</script>
