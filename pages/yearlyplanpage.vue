<template>
  <!-- Main Page with Content -->
  <ion-page id="main-content" class="bg-[#FFEDF5]">
    <!-- Main Content (imported component) -->
    <ion-content>
      <YearlyPlan />
    </ion-content>
  </ion-page>
</template>

<script setup>
import YearlyPlan from '~/components/yearlyplan.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
</script>
