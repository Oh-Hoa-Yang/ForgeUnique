<template>
  <ion-page>
    <ion-content class="ion-padding custom-background">
      <div v-if="!success">
        <img class="center-img" src="/public/img/ForgeUniquePhoto.png" alt="ForgeUnique Logo" />
        <p style="padding: 20px; text-align: start; font-size: 20px;"><b>Please enter your new password:</b></p>
        <form @submit.prevent="updatePassword" style="width: 100%; justify-content: center;">
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
          <ion-button style="width: 100%;" type="submit" class="custom-button">Update Password</ion-button>
        </form>
      </div>
      <div v-else>
        <ion-card>
          <ion-card-header>
            <ion-card-title>Password Updated Successfully!</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            Your password has been updated successfully. Please log in using your new password.
          </ion-card-content>
        </ion-card>
        <ion-button style="width: 100%;" @click="navigateToHome" class="custom-button">Go to Home</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { useAppToast } from '~/composables/useAppToast';
const password = ref('');
const confirmPassword = ref('');
const success = ref(false);
const router = useRouter();
const { toastError, toastSuccess } = useAppToast();
const supabase = useSupabaseClient();

const updatePassword = async () => {
  if (password.value !== confirmPassword.value) {
    toastError({ title: 'Error', description: 'Passwords do not match.' });
    return;
  }

  try {
    const { data, error } = await supabase.auth.updateUser({ password: password.value });
    if (error) throw error;

    toastSuccess({ title: 'Success', description: 'Password updated successfully!' });
    success.value = true; // Show success message
  } catch (error) {
    toastError({ title: 'Error', description: 'Failed to update password. Please try again.' });
  }
};

const navigateToHome = () => {
  router.push('/');
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
