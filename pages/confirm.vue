<template>
  <div>Redirecting...</div>
</template>

<script setup>
import { watch } from 'vue';
const user = useSupabaseUser();

watch(user, (user) => {
  if (user) {
    console.log('Signed In!');
  }
}, { immediate: true });
</script>

<style>
/* Add any styles if needed */
</style>
