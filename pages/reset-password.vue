<template>
  <ion-page>
    <ion-content class="ion-padding custom-background">
      <div v-if="!success">
        <h1>Reset Password</h1>
        <form @submit.prevent="resetPassword">
          <ion-item>
            <ion-label position="stacked">New Password</ion-label>
            <ion-input v-model="password" type="password" required />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Confirm Password</ion-label>
            <ion-input v-model="confirmPassword" type="password" required />
          </ion-item>
          <ion-button expand="full" type="submit">Update Password</ion-button>
        </form>
      </div>
      <div v-else>
        <p>Password updated successfully. You can now log in with your new password.</p>
        <ion-button expand="full" @click="navigateToLogin">Go to Login</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSupabaseClient } from '@supabase/supabase-js';

const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient();

const password = ref('');
const confirmPassword = ref('');
const success = ref(false);

const resetPassword = async () => {
  const token = route.query.token;
  if (!token) {
    alert('Invalid or missing token.');
    return;
  }

  if (password.value !== confirmPassword.value) {
    alert('Passwords do not match.');
    return;
  }

  const { error } = await supabase.auth.updateUser({ password: password.value });

  if (error) {
    alert('Error updating password. Please try again.');
    console.error(error);
  } else {
    success.value = true;
  }
};

const navigateToLogin = () => {
  router.push('/login');
};
</script>

<style scoped>
.custom-background {
  --background: #FFEDF5;
}
</style>
