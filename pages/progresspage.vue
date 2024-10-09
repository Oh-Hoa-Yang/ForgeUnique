<template>
  <ion-page id="main-content">
    <Header />
    <ion-content>
      <Progress />
    </ion-content>
    <Footer />
  </ion-page>
</template>

<script setup>
import Header from '~/components/header.vue';
import Footer from '~/components/footer.vue';
import Progress from '~/components/progress.vue';
</script>
