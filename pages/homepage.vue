<template>
  <!-- Main Page with Content -->
  <ion-page id="main-content">
    <!-- Header Component -->
    <Header />

    <!-- Main Content (imported component) -->
    <ion-content>
      <Home />
    </ion-content>

    <!-- Footer Component -->
    <Footer />
  </ion-page>
</template>

<script setup>
import Home from '~/components/home.vue';
import Header from '~/components/header.vue';
import Footer from '~/components/footer.vue';

definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabaseClient();
const { data: session, error } = await supabase.auth.getSession();
console.log(session); 
</script>
