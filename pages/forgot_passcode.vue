<template>
  <ion-page>
    <ion-content class="ion-padding custom-background">
      <img class="center-img" src="/public/img/ForgeUniquePhoto.png" alt="ForgeUnique Logo" />
      <p style="padding: 20px; text-align: center;">Please enter your password to verify your identity:</p>
      <form @submit.prevent="checkPassword" style="width: 100%; justify-content: center;">
        <ion-item>
          <ion-label position="stacked">Password</ion-label>
          <ion-input v-model="password" type="password" name="password" placeholder="Please enter your password"
            style="font-style: italic;" required>
            <ion-input-password-toggle slot="end" color="medium"></ion-input-password-toggle>
          </ion-input>
        </ion-item>
        <ion-button style="width: 100%;" type="submit" class="custom-button">Verify</ion-button>
      </form>
      <router-link style="text-align:center; color:#FD8395;" to="/">
        <p>Return</p>
      </router-link>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { useAppToast } from '~/composables/useAppToast';
const router = useRouter();  // Initialize router

const password = ref('');
const { toastError, toastSuccess } = useAppToast();

// Check Password 
const checkPassword = async () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  if (!password.value) {
    toastError({ title: 'Error', description: 'Password is required.' });
    return;
  }

  if (!user.value) {
    toastError({ title: 'Error', description: 'No user logged in' });
    return;
  }

  // Authenticate the user by re-entering the password
  const { error } = await supabase.auth.signInWithPassword({
    email: user.value.email,  // Using user's email for sign-in
    password: password.value, // Use the entered password to authenticate
  });

  if (error) {
    toastError({ title: 'Incorrect Password', description: 'The password you entered is incorrect. Please try again!' });
  } else {
    toastSuccess({ title: 'Success', description: 'Password verified! Redirecting...' });
    router.push('/reset-passcode');  // Redirect to reset passcode page
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
