<template>
  <ion-page>
    <ion-content class="ion-padding custom-background">
      <div style="text-align: center; margin-top: 50px;">
        <h1>Verifying...</h1>
        <ion-spinner v-if="loading" name="crescent"></ion-spinner>
        <p v-if="loading">Please wait while we verify your link.</p>
        <p v-if="error" style="color: red; margin-top: 20px;">{{ error }}</p>
        <ion-button v-if="error" @click="navigateToForgotPassword" expand="block" style="margin-top: 20px;">
          Request a New Link
        </ion-button>
      </div>
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
    // Verify the magic link token
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token,
      type, // 'magiclink' in this case
    });

    if (verifyError) {
      throw new Error(verifyError.message);
    }

    // Restore session after verification
    const { data, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !data.session) {
      throw new Error("Session restoration failed.");
    }

    console.log("Session restored:", data.session);

    // Redirect to the desired page (e.g., home or dashboard) after successful verification
    router.push("/");
  } catch (err) {
    console.error("Verification failed:", err);
    error.value = "Verification failed. Please try again or request a new link.";
    loading.value = false;
  }
});

const navigateToForgotPassword = () => {
  router.push("/forgot_password");
};
</script>

<style scoped>
.custom-background {
  --background: #FFEDF5;
}
</style>
