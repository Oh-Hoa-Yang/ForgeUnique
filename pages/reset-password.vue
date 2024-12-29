<template>
  <ion-page>
    <ion-content class="ion-padding custom-background">
      <img class="center-img" src="/public/img/ForgeUniquePhoto.png" alt="ForgeUnique Logo" />
      <p style="padding: 20px; text-align: start; font-size: 20px;"><b>Please enter your new password:</b></p>
      <form @submit.prevent="resetPassword" style="width: 100%; justify-content: center;">
        <ion-item>
          <ion-label position="stacked">New Password</ion-label>
          <ion-input v-model="newPassword" type="password" name="newPassword" placeholder="Enter new password"
            style="font-style: italic;" required>
            <ion-input-password-toggle slot="end" color="medium"></ion-input-password-toggle>
          </ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Confirm Password</ion-label>
          <ion-input v-model="confirmPassword" type="password" name="confirmPassword"
            placeholder="Please enter your new password again" style="font-style: italic;" required>
            <ion-input-password-toggle slot="end" color="medium"></ion-input-password-toggle>
          </ion-input>
        </ion-item>
        <ion-button style="width: 100%;" type="submit" class="custom-button">Reset Password</ion-button>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { useAppToast } from '~/composables/useAppToast';
const newPassword = ref('');
const confirmPassword = ref('');
const router = useRouter();
const route = useRoute();
const { toastError, toastSuccess } = useAppToast();

const resetPassword = async () => {
  const email = sessionStorage.getItem('verified_email');

  if (!email) {
    toastError({ title: 'Error', description: 'No verified email found. Please restart the process.' });
    router.push('/forgot_password');
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    toastError({ title: 'Error', description: 'Passwords do not match.' });
    return;
  }

  // Call backend API to reset password
  try {
    const { data, error } = await useFetch('/api/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        email,
        newPassword: newPassword.value,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (error.value) {
      throw new Error(error.value.message);
    }

    toastSuccess({ title: 'Success', description: 'Password reset successfully!' });
    sessionStorage.removeItem('verified_email'); // Clean up
    router.push('/login');
  } catch (error) {
    toastError({ title: 'Error', description: error.message || 'Failed to reset password.' });
  }
};
</script>

<style scoped>
.center-img,
ion-item,
ion-button {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  padding: 20px;
}
.custom-background {
  --background: #FFEDF5;
}
.custom-button {
  --background: #FFC2D1;
  --background-activated: #ffadb9;
  --background-focused: #ffadb9;
  --background-hover: #ffadb9;
  --background-pressed: #ffadb9;
  --color: black;
}
</style>