<template>
  <!-- Main Page with Content -->
  <ion-page id="main-content" :inert="isMenuVisible" class="bg-[#FFEDF5]">
    <!-- Main Content (imported component) -->
      <Home />
</ion-page>
</template>

<script setup>
import { useRoute } from 'vue-router';
import Home from '~/components/home.vue';

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
