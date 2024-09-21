<template>
  <ion-page>
    <ion-content class="ion-padding custom-background">
      <img class="center-img" src="/public/img/ForgeUniquePhoto.png" alt="ForgeUnique Logo" />
      <p style="padding: 20px; text-align: center;">Please enter your new password:</p>
      <form @submit.prevent="resetPassword" style="width: 100%; justify-content: center;">
        <ion-item>
          <ion-label position="stacked">New Password</ion-label>
          <ion-input v-model="password" type="password" name="password" placeholder="Enter new password"
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

const password = ref('');
const confirmPassword = ref('');
const router = useRouter();
const route = useRoute();
const { toastError, toastSuccess } = useAppToast();

const resetPassword = async () => {
  const token = route.query.token;  // Get token from the URL query params

  if (password.value !== confirmPassword.value) {
    toastError({ title: 'Error', description: 'Passwords do not match.' });
    return;
  }

  const supabase = useSupabaseClient();

  // Reset password using the token from the email link
  const { error } = await supabase.auth.updateUser({
    password: password.value,
    access_token: token  // Use the token to authenticate the user
  });

  if (error) {
    toastError({ title: 'Error', description: 'Failed to reset password.' });
  } else {
    toastSuccess({ title: 'Success', description: 'Password reset successfully!' });
    navigateTo('/login');
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
