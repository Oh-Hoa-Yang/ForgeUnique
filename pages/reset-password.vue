<template>
  <ion-page>
    <ion-content class="ion-padding custom-background">
      <div v-if="!success">
        <img class="center-img" src="/public/img/ForgeUniquePhoto.png" alt="ForgeUnique Logo" />
        <p style="padding: 20px; text-align: start; font-size: 20px;"><b>Please enter your new password:</b></p>
        <form @submit.prevent="resetPassword" style="width: 100%; justify-content: center;">
          <ion-item>
            <ion-label position="stacked">New Password</ion-label>
            <ion-input v-model="password" type="password" name="password" placeholder="Enter new password"
              style="font-style: italic;" required>
              <ion-input-password-toggle slot="end" color="medium"></ion-input-password-toggle>
            </ion-input>
          </ion-item>
          <p v-if="passwordError" class="error-message">{{ passwordError }}</p>
          <ion-item>
            <ion-label position="stacked">Confirm Password</ion-label>
            <ion-input v-model="confirmPassword" type="password" name="confirmPassword"
              placeholder="Please enter your new password again" style="font-style: italic;" required>
              <ion-input-password-toggle slot="end" color="medium"></ion-input-password-toggle>
            </ion-input>
          </ion-item>
          <ion-button style="width: 100%;" type="submit" class="custom-button">Reset Password</ion-button>
        </form>
      </div>
      <div v-else>
        <ion-card>
          <ion-card-header>
            <ion-card-title>Password Reset Successful!</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            Your password has been reset successfully. Please open the mobile app and log in with your new password.
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { useAppToast } from '~/composables/useAppToast';
const password = ref('');
const confirmPassword = ref('');
const success = ref(false); // Track whether password reset was successful
const router = useRouter();
const route = useRoute();
const { toastError, toastSuccess } = useAppToast();
const passwordError = ref(null);

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;
    return regex.test(password);
  };

const resetPassword = async () => {
  const token = route.query.token; // Get token from the URL query params
  if (password.value !== confirmPassword.value) {
    toastError({ title: 'Error', description: 'Passwords do not match.' });
    return;
  }


  passwordError.value = null;
  

  // Validate password rules
  if (!validatePassword(password.value)) {
    const errorMessage = 'Password must be at least 8 characters long, and include an uppercase letter (A-Z), a lowercase letter(a-z), a number(0-9), and a special character (`@`, `$`, `!`, `%`, `*`, `?`, `&`, `.`).';
    passwordError.value = errorMessage;
    toastError({ title: 'Password Error', description: errorMessage });
    return;
  }

  const supabase = useSupabaseClient();
  // Reset password using the token from the email link
  const { error } = await supabase.auth.updateUser({
    password: password.value,
    access_token: token, // Use the token to authenticate the user
  });
  if (error) {
    toastError({ title: 'Error', description: 'Failed to reset password.' });
  } else {
    toastSuccess({ title: 'Success', description: 'Password reset successfully!' });
    success.value = true; // Display success message
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

/* for error message */
.error-message {
  color: red;
  font-size: 12px;
  margin-left: 10px;
}
</style>