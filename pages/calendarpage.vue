<template>
  <!-- Main Page with Content -->
  <ion-page id="main-content">
    <!-- Header Component -->
    <Header />

    <!-- Main Content (imported component) -->
    <ion-content>
      <Calendar />
    </ion-content>

    <!-- Footer Component -->
    <Footer />
  </ion-page>
</template>

<script setup>
import Header from '~/components/header.vue';
import Footer from '~/components/footer.vue';
import Calendar from '~/components/calendar.vue';
</script>
