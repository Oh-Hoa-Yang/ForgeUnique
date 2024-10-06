<template>
  <!-- Main Page with Content -->
  <ion-page id="main-content">
    <!-- Header Component -->
    <Header :authenticatedUser="authenticatedUser" />

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

import { ref, onMounted } from 'vue';
import { useAppToast } from '~/composables/useAppToast';
const supabase = useSupabaseClient();
const authenticatedUser = ref(null);
const { toastError } = useAppToast();

// Fetch authenticated user
const fetchAuthenticatedUser = async () => {
  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !userData) {
    toastError({ title: 'Error', description: 'User is not authenticated!' });
    return null;
  }
  return userData.user;
};

// On mounted, fetch the authenticated user
onMounted(async () => {
  authenticatedUser.value = await fetchAuthenticatedUser();
});
</script>
