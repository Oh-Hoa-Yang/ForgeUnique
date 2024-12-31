<template>
  <ion-page>
    <ion-content class="ion-padding custom-background">
      <h1>Verify Your Link</h1>
      <p>Please click the button below to verify your email.</p>
      <ion-button @click="verifyToken">Verify Email</ion-button>
      <p v-if="loading">Verifying, please wait...</p>
      <p v-if="error" style="color: red;">{{ error }}</p>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(false);
const error = ref(null);

const verifyToken = async () => {
  const token = new URLSearchParams(window.location.search).get('token');
  const type = new URLSearchParams(window.location.search).get('type');

  if (!token || !type) {
    error.value = 'Invalid or missing token.';
    return;
  }

  const supabase = useSupabaseClient();
  loading.value = true;

  try {
    // Verify the token
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token,
      type,
    });

    if (verifyError) {
      throw new Error(verifyError.message);
    }

    // Redirect to the home page or dashboard after successful verification
    router.push('/');
  } catch (err) {
    console.error('Verification failed:', err);
    error.value = 'Verification failed. Please try again or request a new link.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.custom-background {
  --background: #FFEDF5;
}
</style>
