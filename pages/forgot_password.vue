<template>
  <ion-page>
    <ion-content class="ion-padding custom-background">
      <img class="center-img" src="/public/img/ForgeUniquePhoto.png" alt="ForgeUnique Logo" />
      <p style="padding: 20px; text-align: center;">Enter your email and passcode to reset your password:</p>
      <form @submit.prevent="verifyIdentity" style="width: 100%; justify-content: center;">
        <ion-item>
          <ion-label position="stacked">Email</ion-label>
          <ion-input v-model="email" type="email" name="email" placeholder="Enter your email" required />
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Passcode</ion-label>
          <ion-input v-model="passcode" type="text" name="passcode" placeholder="Enter your passcode" required />
        </ion-item>
        <ion-button style="width: 100%;" type="submit" class="custom-button">Verify</ion-button>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { useAppToast } from '~/composables/useAppToast';
import CryptoJS from 'crypto-js';

const email = ref('');
const passcode = ref('');
const router = useRouter();
const { toastError, toastSuccess } = useAppToast();

const verifyIdentity = async () => {
  console.log('Email entered:', email.value);
  console.log('Passcode entered:', passcode.value);

  const hashedPasscode = CryptoJS.SHA256(passcode.value).toString();
  console.log('Hashed passcode:', hashedPasscode);

  try {
    // Send the request to the Supabase Edge Function
    console.log('Sending request to verify identity:', { email: email.value, hashedPasscode });
    const response = await fetch('https://otqcodzxgjtfswxviqtx.supabase.co/functions/v1/verify-identity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, hashedPasscode }),
    });

    const result = await response.json();
    console.log('Response from verify-identity API:', result);

    if (response.ok && result.success) {
      toastSuccess({ title: 'Success', description: 'Identity verified.' });
      sessionStorage.setItem('verified_email', email.value); // Store the verified email
      router.push('/reset-password'); // Navigate to reset-password page
    } else {
      toastError({ title: 'Error', description: result.error || 'Verification failed.' });
    }
  } catch (error) {
    console.error('Error during verification:', error);
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
</style>
