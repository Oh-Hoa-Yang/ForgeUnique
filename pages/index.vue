<template>
  <ion-page>
    <ion-content class="ion-padding custom-background">
      <img class="center-img" src="/public/img/ForgeUniquePhoto.png" alt="ForgeUnique Logo" />
      <p style="padding: 20px;">PLEASE ENTER YOUR PASSCODE:</p>
      <form style="width: 100%; justify-content: center;">
        <div class="passcode-wrapper">
          <ion-input ref="field0" @keyup="gotoNextField(1)" v-model="passcode[0]" maxlength="1"></ion-input>
          <ion-input ref="field1" @keyup="gotoNextField(2)" v-model="passcode[1]" maxlength="1"></ion-input>
          <ion-input ref="field2" @keyup="gotoNextField(3)" v-model="passcode[2]" maxlength="1"></ion-input>
          <ion-input ref="field3" @keyup="gotoNextField(4)" v-model="passcode[3]" maxlength="1"></ion-input>
          <ion-input ref="field4" @keyup="gotoNextField(5)" v-model="passcode[4]" maxlength="1"></ion-input>
          <ion-input ref="field5" @keyup="checkPasscode" v-model="passcode[5]" maxlength="1"></ion-input>
        </div>
        <div style="margin-right: 2%;">
          <a style="text-align:end; color: #FD8395;" href="/forgot_password">
            <p style="font-style:italic; padding-right:20px;">FORGOT PASSCODE?</p>
          </a>
        </div>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { useAppToast } from '~/composables/useAppToast';  
import CryptoJS from 'crypto-js';

// Initialize passcode
const passcode = ref(['', '', '', '', '', '']);

// Use toast for notifications
const { toastError, toastSuccess } = useAppToast();

// Define individual refs for each input field
const field0 = ref(null);
const field1 = ref(null);
const field2 = ref(null);
const field3 = ref(null);
const field4 = ref(null);
const field5 = ref(null);

// Function to move focus to the next input field
const gotoNextField = async (nextFieldIndex) => {
  const nextField = eval(`field${nextFieldIndex}`);

  if (nextField && nextField.value) {
    await nextTick();
    const nativeInput = nextField.value.$el.querySelector('input');  // Access the native input element
    if (nativeInput) {
      nativeInput.focus();  // Set focus to the next input field
    } else {
      console.error(`Input element not found for field${nextFieldIndex}`);
    }
  } else {
    console.error(`Next field field${nextFieldIndex} not found`);
  }
};

// Function to check and verify passcode
const checkPasscode = async () => {
  const enteredPasscode = passcode.value.join('');  // Join the digits to form the passcode
  const hashedPasscode = CryptoJS.SHA256(enteredPasscode).toString();  // Hash the passcode using SHA256

  const user = useSupabaseUser();  // Get the current logged-in user

  if (!user.value) {
    toastError({ title: 'Error', description: 'No user logged in' });
    return;
  }

  const supabase = useSupabaseClient();

  // Query Supabase to get the stored hashed passcode for the logged-in user
  const { data, error } = await supabase
    .from('Users')
    .select('passcode')
    .eq('user_id', user.value.id);

  if (error) {
    toastError({ title: 'Error', description: `Error fetching passcode: ${error.message}` });
    return;
  }

  if (data && data.length > 0 && data[0].passcode === hashedPasscode) {
    toastSuccess({ title: 'Success', description: 'Passcode verified!' });
    navigateTo('/homepage');  // Redirect to homepage upon successful verification
  } else {
    toastError({ title: 'Incorrect Passcode', description: 'The passcode you entered is incorrect. Please try again!' });
    resetPasscode();  // Reset the passcode if incorrect
  }
};

// Function to reset the passcode and refocus on the first input
const resetPasscode = async () => {
  passcode.value = ['', '', '', '', '', ''];
  await nextTick();
  const firstInput = field0.value.$el.querySelector('input');
  if (firstInput) {
    firstInput.focus();  // Focus back on the first input field
  }
};
</script>

<style scoped>
.center-img,
.passcode-wrapper {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  padding: 20px;
  display: flex;
  justify-content: center;
}

.passcode-wrapper ion-input {
  width: 50px;
  text-align: center;
  border: 1px solid black;
  margin-right: 5px;
  font-size: 24px;
}

.custom-background {
  --background: #FFEDF5;
}
</style>