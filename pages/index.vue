<template>
  <ion-page>
    <ion-content class="ion-padding custom-background">
      <img class="center-img" src="/public/img/ForgeUniquePhoto.png" alt="ForgeUnique Logo" />
      <p style="padding: 20px;">PLEASE ENTER YOUR PASSCODE:</p>
      <form style="width: 100%; justify-content: center;" @submit.prevent>
        <div class="passcode-wrapper">
          <ion-input v-for="(digit, index) in passcode" :key="index" :ref="'inputField' + index" :readonly="true"
            v-model="passcode[index]" maxlength="1" type="password"></ion-input>
        </div>
        <div style="margin-right: 2%;">
          <a style="text-align:end; color: #FD8395;" href="/forgot_password">
            <p style="font-style:italic; padding-right:20px;">FORGOT PASSCODE?</p>
          </a>
        </div>
        <!-- Custom Numeric Keypad -->
        <div class="keypad-wrapper">
          <div class="keypad-row">
            <button type="button" @click="inputDigit(1)">1</button>
            <button type="button" @click="inputDigit(2)">2</button>
            <button type="button" @click="inputDigit(3)">3</button>
          </div>
          <div class="keypad-row">
            <button type="button" @click="inputDigit(4)">4</button>
            <button type="button" @click="inputDigit(5)">5</button>
            <button type="button" @click="inputDigit(6)">6</button>
          </div>
          <div class="keypad-row">
            <button type="button" @click="inputDigit(7)">7</button>
            <button type="button" @click="inputDigit(8)">8</button>
            <button type="button" @click="inputDigit(9)">9</button>
          </div>
          <div class="keypad-row">
            <button type="button" @click="deleteLastDigit">DEL</button>
            <button type="button" @click="inputDigit(0)">0</button>
            <button type="button" @click="resetPasscode">C</button>
          </div>
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
let currentIndex = ref(0);

// Use toast for notifications
const { toastError, toastSuccess } = useAppToast();

const inputFields = []; // Store input fields as an array of refs

// Handle digit input
const inputDigit = async (digit) => {
  if (currentIndex.value < 6) {
    passcode.value[currentIndex.value] = digit.toString();
    currentIndex.value++;
    await nextTick();

    if (currentIndex.value < 6) {
      const nextField = inputFields[currentIndex.value]; // Access the next field
      if (nextField) {
        nextField.focus();  // Set focus to the next input field
      }
    } else {
      // When the last digit is entered, call checkPasscode
      checkPasscode();
    }
  }
};

// Handle deleting the last digit and moving back
const deleteLastDigit = async () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
    passcode.value[currentIndex.value] = '';  // Clear the last entered digit
    await nextTick();
    const prevField = inputFields[currentIndex.value];
    if (prevField) {
      prevField.focus();  // Set focus back to the previous input field
    }
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
  passcode.value = ['', '', '', '', '', ''];  // Clear the entire passcode
  currentIndex.value = 0;
  await nextTick();
  if (inputFields[0]) {
    inputFields[0].focus();  // Focus back on the first input field
  }
};

// onMounted lifecycle to store the references to input fields
onMounted(() => {
  for (let i = 0; i < 6; i++) {
    inputFields[i] = document.querySelector(`[ref="inputField${i}"] input`);
  }
});
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

.keypad-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.keypad-row {
  display: flex;
  justify-content: center;
  margin: 5px;
}

button {
  width: 70px;
  height: 70px;
  font-size: 24px;
  margin: 5px;
  border: none;
  background-color: #FFC2D1;
  border-radius: 10px;
  cursor: pointer;
}

button:active {
  background-color: #ccc;
}

.custom-background {
  --background: #FFEDF5;
}
</style>
