<template>
  <ion-page id="main-content">
    <Header />
    <ion-content>
      <Calendar />
    </ion-content>
    <Footer />
  </ion-page>
</template>

<script setup>
import Header from '~/components/header.vue';
import Footer from '~/components/footer.vue';
import Calendar from '~/components/calendar.vue';
</script>
