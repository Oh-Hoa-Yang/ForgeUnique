<template>
  <ion-page id="main-content">
    <Header />
    <ion-content>
      <Home />
    </ion-content>
    <Footer />
  </ion-page>
</template>

<script setup>
import Home from '~/components/home.vue';
import Header from '~/components/header.vue';
import Footer from '~/components/footer.vue';

definePageMeta({
  middleware: 'auth'
});

const supabase = useSupabaseClient();
const user = useSupabaseUser();

// Logging user information for debugging
console.log('Session of the user:', user.value);
</script>
