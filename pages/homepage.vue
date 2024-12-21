<template>
  <!-- Main Page with Content -->
  <ion-page id="main-content" :inert="isMenuVisible">
    <!-- Header Component -->
    <Header />

    <!-- Main Content (imported component) -->
    <ion-content>
      <Home />
    </ion-content>

    <!-- Footer Component -->
    <Footer :current-route="route.path" />
  </ion-page>
</template>

<script setup>
import { useRoute } from 'vue-router';
import Home from '~/components/home.vue';
import Header from '~/components/header.vue';
import Footer from '~/components/footer.vue';

definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabaseClient();
const user = useSupabaseUser();

// Logging user information for debugging
console.log('Session of the user:', user.value);

const route = useRoute();
const router = useRouter();
const isMenuVisible = ref(false);

const appState = inject('appState');
if (!appState) {
  console.error('Failed to inject appState in Homepage.vue.');
}

onMounted( async () => {
  if (router.currentRoute.value.query.refresh) {
    await fetchData(); // Call `fetchData` to refresh appState
  }
});

</script>
