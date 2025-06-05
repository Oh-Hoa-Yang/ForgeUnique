<template>
  <ion-page>
    <ion-content class="ion-padding custom-background">
      <img class="center-img" src="/public/img/ForgeUniquePhoto.png" alt="ForgeUnique Logo" />
      <p style="padding: 20px; text-align: center;">Please enter a new passcode:</p>
      <form @submit.prevent="resetPasscode" style="width: 100%; justify-content: center;">
        <ion-item>
          <ion-label position="stacked">New Passcode</ion-label>
          <ion-input v-model="newPasscode" type="number" name="passcode" placeholder="Please enter your new passcode"
            style="font-style: italic;" required :disabled="isLoading">
            <ion-input-password-toggle slot="end" color="medium"></ion-input-password-toggle>
          </ion-input>
        </ion-item>
        <p v-if="passcodeError" class="error-message pl-3 -mt-4">{{ passcodeError }}</p>
        <ion-item>
          <ion-label position="stacked">Confirm New Passcode</ion-label>
          <ion-input v-model="confirmPasscode" name="confirmPasscode" type="number"
            placeholder="Please enter your new passcode again" style="font-style: italic;" required :disabled="isLoading">
            <ion-input-password-toggle slot="end" color="medium"></ion-input-password-toggle>
          </ion-input>
        </ion-item>
        <ion-button style="width: 100%;" type="submit" class="custom-button" :disabled="isLoading">
          <ion-spinner v-if="isLoading" name="crescent"></ion-spinner>
          <span v-else>Reset Passcode</span>
        </ion-button>
      </form>
      <router-link style="text-align:center; color:#FD8395;" to="/forgot_passcode">
        <p>Return</p>
      </router-link>
    </ion-content>
  </ion-page>
</template>
<script setup>
import { useAppToast } from '~/composables/useAppToast';
import CryptoJS from 'crypto-js';  // For Hashing 

const newPasscode = ref('');
const confirmPasscode = ref('');
const isLoading = ref(false);
const { toastError, toastSuccess } = useAppToast();
const passcodeError = ref(null);

definePageMeta({
  middleware: 'auth',
  layout: 'auth'
})

const validatePasscode = (passcode) => {
  return /^\d{6}$/.test(passcode);  // Ensure exactly 6 digits
};

const clearForm = () => {
  newPasscode.value = '';
  confirmPasscode.value = '';
  passcodeError.value = null;
};

const resetPasscode = async () => {
  if (isLoading.value) return;

  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  // Step 1: Check if user is logged in
  if (!user.value) {
    toastError({ title: 'Error', description: 'No user logged in. Please log in first.' });
    router.push('/login');
    return;
  }

  // Step 2: Check if passcode fields are filled
  if (!newPasscode.value || !confirmPasscode.value) {
    toastError({ title: 'Error', description: 'Both passcode fields are required.' });
    return;
  }

  // Step 3: Validate passcode format first
  passcodeError.value = null;
  if (!validatePasscode(newPasscode.value)) {
    const errorMessage = 'Passcode must be exactly 6 digits.';
    passcodeError.value = errorMessage;
    toastError({ title: 'Passcode Error', description: errorMessage });
    return;
  }

  // Step 4: Check if passcodes match
  if (newPasscode.value !== confirmPasscode.value) {
    toastError({ title: 'Passcode Error', description: 'Passcodes do not match.' });
    return;
  }

  try {
    isLoading.value = true;
    // Step 5: Hash the passcode before storing
    const hashedPasscode = CryptoJS.SHA256(newPasscode.value).toString();

    // Step 6: Update the passcode in the Users table
    const { error } = await supabase
      .from('Users')
      .update({ passcode: hashedPasscode })
      .eq('user_id', user.value.id);

    if (error) {
      console.error("Database error:", error);
      toastError({ title: 'Error', description: 'Failed to update passcode. Please try again.' });
      return;
    } else {
      clearForm();
      toastSuccess({ title: 'Success', description: 'Passcode has been reset successfully!' });
      navigateTo('/');
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