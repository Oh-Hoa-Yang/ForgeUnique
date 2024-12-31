<template>
  <ion-page>
    <ion-content class="ion-padding custom-background">
      <h1>Verifying...</h1>
      <p v-if="loading">Please wait while we verify your link.</p>
      <p v-if="error" style="color: red;">{{ error }}</p>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSupabaseClient } from '@supabase/supabase-js';

const router = useRouter();
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  // Retrieve the `code` and `type` parameters
  const code = new URLSearchParams(window.location.search).get('code');
  const type = new URLSearchParams(window.location.search).get('type') || 'magiclink'; // Default to 'magiclink'

  if (!code) {
    error.value = 'Invalid or missing verification code.';
    loading.value = false;
    return;
  }

  const supabase = useSupabaseClient();

  try {
    // Verify the magic link or reset code using Supabase's `verifyOtp`
    const { error: verifyError } = await supabase.auth.verifyOtp({
      code, // Use the `code` from the URL
      type, // E.g., 'magiclink', 'recovery', etc.
    });

    if (verifyError) {
      throw new Error(verifyError.message);
    }

    // Redirect to the home page or dashboard after successful verification
    router.push('/');
  } catch (err) {
    console.error('Verification failed:', err);
    error.value = 'Verification failed. Please try again or request a new link.';
    loading.value = false;
  }
});
</script>

<style scoped>
.custom-background {
  --background: #FFEDF5;
}
</style>
