<template>
  <ion-page>
    <ion-content class="ion-padding custom-background">
      <img class="center-img" src="/public/img/ForgeUniquePhoto.png" alt="ForgeUnique Logo" />
      <p style="padding: 20px;">PLEASE ENTER YOUR PASSCODE:</p>
      <form style="width: 100%; justify-content: center;">
        <div class="passcode-wrapper">
          <ion-input ref="input0" v-model="passcode[0]" maxlength="1" @input="moveToNext(0)" />
          <ion-input ref="input1" v-model="passcode[1]" maxlength="1" @input="moveToNext(1)" />
          <ion-input ref="input2" v-model="passcode[2]" maxlength="1" @input="moveToNext(2)" />
          <ion-input ref="input3" v-model="passcode[3]" maxlength="1" @input="moveToNext(3)" />
          <ion-input ref="input4" v-model="passcode[4]" maxlength="1" @input="moveToNext(4)" />
          <ion-input ref="input5" v-model="passcode[5]" maxlength="1" @input="checkPasscode()" />
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

const passcode = ref(['', '', '', '', '', '']);
// Import toastError and toastSuccess
const { toastError, toastSuccess } = useAppToast();  

// Define refs for each input field
const inputRefs = Array.from({ length: 6 }, () => ref(null));

// Handle input field focus on the next input when a digit is entered
const moveToNext = async (index) => {
  if (passcode.value[index].length === 1 && index < 5) {
    await nextTick();
    const nextInputRef = inputRefs[index + 1];
    

    // ----- NEED TO TEST LATER WHEN CONVERTING TO APP -----
    // if (nextInputRef && nextInputRef.value) {
    //   // Try focusing the next input element after a slight delay to ensure it works across environments
    //   setTimeout(() => {
    //     nextInputRef.value.setFocus();  // Focus on the next input field
    //   }, 10);
    // }
  }
};

const checkPasscode = async () => {
  const enteredPasscode = passcode.value.join('');  // Combine passcode values
  const hashedPasscode = CryptoJS.SHA256(enteredPasscode).toString();  // Hash the passcode

  const user = useSupabaseUser();  // Get the current logged-in user

  if (!user.value) {
    toastError({ title: 'Error', description: 'No user logged in' });
    return;
  }

  // Verify the hashed passcode with the one stored in the database
  const supabase = useSupabaseClient();
  const { data, error } = await supabase
    .from('Users')
    .select('passcode')
    .eq('user_id', user.value.id);  // Compare against the logged-in user's ID

  if (error) {
    toastError({ title: 'Error', description: 'Error fetching passcode: ' + error.message });
    return;
  }

  if (data && data.length > 0 && data[0].passcode === hashedPasscode) {
    toastSuccess({ title: 'Success', description: 'Passcode verified!' });
    navigateTo('/homepage');  
  } else {
    toastError({ title: 'Incorrect Passcode', description: 'The passcode you entered is incorrect. Please try again!' });
    resetPasscode();  // Reset the passcode if incorrect
  }
};

// Function to reset the passcode and focus back to the first input
const resetPasscode = async () => {
  // Reset the passcode array to empty
  passcode.value = ['', '', '', '', '', ''];

  // Wait for DOM update and then focus on the first input
  await nextTick();
  inputRefs[0].value.setFocus();  // Focus back on the first input
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
  border: 1px solid black;  /* Black border for each input */
  margin-right: 5px;  /* Add spacing between the inputs */
  font-size: 24px;  /* Increase font size for better visibility */
}

.custom-background {
  --background: #FFEDF5;
}
</style>
