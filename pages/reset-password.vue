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
              style="font-style: italic;" required :disabled="isLoading">
              <ion-input-password-toggle slot="end" color="medium"></ion-input-password-toggle>
            </ion-input>
          </ion-item>
          <p v-if="passwordError" class="error-message pl-3 -mt-4">{{ passwordError }}</p>
          <ion-item>
            <ion-label position="stacked">Confirm Password</ion-label>
            <ion-input v-model="confirmPassword" type="password" name="confirmPassword"
              placeholder="Please enter your new password again" style="font-style: italic;" required :disabled="isLoading">
              <ion-input-password-toggle slot="end" color="medium"></ion-input-password-toggle>
            </ion-input>
          </ion-item>
          <ion-button style="width: 100%;" type="submit" class="custom-button" :disabled="isLoading">
            <ion-spinner v-if="isLoading" name="crescent"></ion-spinner>
            <span v-else>Reset Password</span>
          </ion-button>
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
const success = ref(false);
const isLoading = ref(false);
const router = useRouter();
const route = useRoute();
const { toastError, toastSuccess } = useAppToast();
const passwordError = ref(null);

definePageMeta({
  layout: 'auth'
})

const validatePassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;
  return regex.test(password);
};

const clearForm = () => {
  password.value = '';
  confirmPassword.value = '';
  passwordError.value = null;
};

const resetPassword = async () => {
  if (isLoading.value) return;

  const token = route.query.token; // Get token from the URL query params

  if (!password.value || !confirmPassword.value) {
    toastError({ title: 'Error', description: 'Both password fields are required.' });
    return;
  }

  // Validate password rules
  if (!validatePassword(password.value)) {
    const errorMessage = 'Password must be at least 8 characters long, and include an uppercase letter (A-Z), a lowercase letter(a-z), a number(0-9), and a special character (`@`, `$`, `!`, `%`, `*`, `?`, `&`, `.`).';
    passwordError.value = errorMessage;
    toastError({ title: 'Password Error', description: errorMessage });
    return;
  }

  if (password.value !== confirmPassword.value) {
    toastError({ title: 'Error', description: 'Passwords do not match.' });
    return;
  }

  passwordError.value = null;

  try {
    isLoading.value = true;
    const supabase = useSupabaseClient();
    
    const { error } = await supabase.auth.updateUser({
      password: password.value,
      access_token: token, //Use for authenticate the user
    });

    if (error) {
        toastError({ title: 'Error', description: 'Failed to reset password. ' });
        return;
    } else {
      clearForm();
      success.value = true;
      toastSuccess({ title: 'Success', description: 'Password reset successfully!' });
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    toastError({ title: 'Error', description: 'An unexpected error occurred. Please try again.' });
    return;
  } finally {
    isLoading.value = false;
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

ion-spinner {
  width: 20px;
  height: 20px;
  color: black;
}
</style>