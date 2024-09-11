<template>
  <ion-page>
    <ion-content class="ion-padding custom-background">
      <img class="center-img" src="/public/img/ForgeUniquePhoto.png" alt="ForgeUnique Logo">
      <p style="padding: 20px;">RESET YOUR PASSCODE:</p>
      <form v-if="!otpSent" @submit.prevent="sendOtp" style="width: 100%; justify-content: center;">
        <ion-item>
          <ion-label position="stacked">Email</ion-label>
          <ion-input v-model="email" type="email" placeholder="Please enter your email" style="font-style:italic" required></ion-input>
        </ion-item>
        <ion-button style="width: 100%;" type="submit" class="custom-button">Send OTP</ion-button>
      </form>
      
      <form v-else @submit.prevent="verifyOtpAndResetPasscode" style="width: 100%; justify-content: center;">
        <ion-item>
          <ion-label position="stacked">OTP</ion-label>
          <ion-input v-model="otp" type="number" placeholder="Please enter the OTP" style="font-style:italic" required></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">New Passcode</ion-label>
          <ion-input v-model="newPasscode" type="number" placeholder="Enter new passcode" maxlength="6" style="font-style:italic" required></ion-input>
        </ion-item>
        <ion-button style="width: 100%;" type="submit" class="custom-button">Reset Passcode</ion-button>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup>
// import { ref } from 'vue';
import { useAppToast } from '~/composables/useAppToast';
import CryptoJS from 'crypto-js';

const email = ref('');
const otp = ref('');
const newPasscode = ref('');
const otpSent = ref(false);
const { toastError, toastSuccess } = useAppToast();

// Step 1: Send OTP to the email
const sendOtp = async () => {
  const supabase = useSupabaseClient();

  if (!email.value) {
    toastError({ title: 'Error', description: 'Please enter your email.' });
    return;
  }

  // Simulate sending OTP to email
  const { error } = await supabase
    .rpc('send_otp', { email: email.value });  // A stored procedure that sends the OTP

  if (error) {
    toastError({ title: 'Error', description: 'Failed to send OTP: ' + error.message });
  } else {
    otpSent.value = true;
    toastSuccess({ title: 'Success', description: 'OTP sent! Please check your email.' });
  }
};

// Step 2: Verify OTP and reset the passcode
const verifyOtpAndResetPasscode = async () => {
  if (!otp.value || !newPasscode.value) {
    toastError({ title: 'Error', description: 'Please enter the OTP and new passcode.' });
    return;
  }

  const supabase = useSupabaseClient();

  // Verify the OTP with the Supabase stored procedure
  const { error: otpError } = await supabase.rpc('verify_otp', { email: email.value, otp: otp.value });

  if (otpError) {
    toastError({ title: 'Error', description: 'Invalid OTP: ' + otpError.message });
    return;
  }

  // Hash the new passcode before storing it in the database
  const hashedPasscode = CryptoJS.SHA256(newPasscode.value).toString();

  // Update the passcode in the Users table
  const { error: passcodeError } = await supabase
    .from('Users')
    .update({ passcode: hashedPasscode })
    .eq('email', email.value);

  if (passcodeError) {
    toastError({ title: 'Error', description: 'Failed to reset passcode: ' + passcodeError.message });
  } else {
    toastSuccess({ title: 'Success', description: 'Passcode reset successfully!' });
    navigateTo('/login');
  }
};
</script>

<style scoped>
.center-img, ion-item, ion-button {
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
  --color: black;
}
</style>
