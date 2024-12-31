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
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  const token = new URLSearchParams(window.location.search).get("token");
  const type = new URLSearchParams(window.location.search).get("type");

  if (!token || !type) {
    error.value = "Invalid or missing token.";
    loading.value = false;
    return;
  }

  const supabase = useSupabaseClient();

  try {
    // Verify the magic link token using Supabase's verifyOtp method
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token,
      type, // 'magiclink' in this case
    });

    if (verifyError) {
      throw new Error(verifyError.message);
    }

    // Redirect to the desired page (e.g., home or dashboard) after successful verification
    router.push("/");
  } catch (err) {
    console.error("Verification failed:", err);
    error.value = "Verification failed. Please try again or request a new link.";
    loading.value = false;
  }
});
</script>

<style scoped>
.custom-background {
  --background: #FFEDF5;
}
</style>
