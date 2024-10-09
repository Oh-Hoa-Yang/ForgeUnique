<template>
  <ion-page>
    <ion-content class="ion-padding custom-background">
      <img class="center-img" src="/public/img/ForgeUniquePhoto.png" alt="ForgeUnique Logo" />
      <p style="padding: 20px; text-align: center;">Please enter a new passcode:</p>
      <form @submit.prevent="resetPasscode" style="width: 100%; justify-content: center;">
        <ion-item>
          <ion-label position="stacked">New Passcode</ion-label>
          <ion-input v-model="newPasscode" type="number" name="passcode" placeholder="Please enter your new passcode"
            style="font-style: italic;" required>
            <ion-input-password-toggle slot="end" color="medium"></ion-input-password-toggle>
          </ion-input>
        </ion-item>
        <p v-if="passcodeError" class="error-message" style="padding: 20px;">{{ passcodeError }}</p>
        <ion-item>
          <ion-label position="stacked">Confirm New Passcode</ion-label>
          <ion-input v-model="confirmPasscode" name="confirmPasscode" type="number"
            placeholder="Please enter your new passcode again" style="font-style: italic;" required>
            <ion-input-password-toggle slot="end" color="medium"></ion-input-password-toggle>
          </ion-input>
        </ion-item>
        <ion-button style="width: 100%;" type="submit" class="custom-button">Reset Passcode</ion-button>
      </form>
      <a style="text-align:center; color:#FD8395;" href="/">
        <p>Return</p>
      </a>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { useAppToast } from '~/composables/useAppToast';
import CryptoJS from 'crypto-js';  // For Hashing 
const router = useRouter();  // Initialize router

const newPasscode = ref('');
const confirmPasscode = ref('');
const { toastError, toastSuccess } = useAppToast();
const passcodeError = ref(null);

const validatePasscode = (passcode) => {
  return /^\d{6}$/.test(passcode);  // Ensure exactly 6 digits
};

const resetPasscode = async () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  // Step 1: Check if user is logged in
  if (!user.value) {
    toastError({ title: 'Error', description: 'No user logged in.' });
    return;
  }
  
  console.log("User Info: ", user.value); // Debugging the user details
  
  // Step 2: Check if passcode fields are filled
  if (!newPasscode.value || !confirmPasscode.value) {
    toastError({ title: 'Error', description: 'Both fields are required.' });
    return;
  }

  // Step 3: Validate passcode
  passcodeError.value = null;
  
  if (!validatePasscode(newPasscode.value)) {
    const errorMessage = 'Passcode must be exactly 6 digits.';
    passcodeError.value = errorMessage;
    toastError({ title: 'Passcode Error', description: errorMessage });
    return;
  }
  
  if (newPasscode.value !== confirmPasscode.value) {
    toastError({ title: 'Passcode Error', description: 'Passcodes do not match.' });
    return;
  }

  // Step 4: Hash the passcode before storing
  const hashedPasscode = CryptoJS.SHA256(newPasscode.value).toString();

  // Step 5: Update the passcode in the Users table
  try {
    const { data, error } = await supabase
      .from('Users')  // Assuming your public table is named 'Users'
      .update({ passcode: hashedPasscode })
      .eq('user_id', user.value.id);

    console.log("Supabase Response: ", data, error); // Debugging the result

    if (error) {
      toastError({ title: 'Error', description: `Failed to reset passcode: ${error.message}` });
    } else {
      toastSuccess({ title: 'Success', description: 'Passcode has been reset!' });
      router.push('/');  // Redirect user to index page after successful reset
    }
  } catch (err) {
    console.error("Unexpected error: ", err);
    toastError({ title: 'Error', description: 'An unexpected error occurred.' });
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
</style>
