<template>
  <ion-page>
    <ion-content class="ion-padding custom-background">
      <img class="center-img" src="/public/img/ForgeUniquePhoto.png" alt="ForgeUnique Logo" />
      <p style="padding: 20px; text-align: center;">Please enter your password to verify your identity:</p>
      <form @submit.prevent="checkPassword" style="width: 100%; justify-content: center;">
        <ion-item>
          <ion-label position="stacked">Password</ion-label>
          <ion-input v-model="password" type="password" name="password" placeholder="Please enter your password"
            style="font-style: italic;" required :disabled="isLoading">
            <ion-input-password-toggle slot="end" color="medium"></ion-input-password-toggle>
          </ion-input>
        </ion-item>
        <ion-button style="width: 100%;" type="submit" class="custom-button" :disabled="isLoading">
          <ion-spinner v-if="isLoading" name="crescent"></ion-spinner>
          <span v-else>Verify</span>
        </ion-button>
      </form>
      <router-link style="text-align:center; color:#FD8395;" to="/">
        <p>Return</p>
      </router-link>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { useAppToast } from '~/composables/useAppToast';
const router = useRouter();

const password = ref('');
const isLoading = ref(false);
const { toastError, toastSuccess } = useAppToast();

// Check Password 
const checkPassword = async () => {
  if (isLoading.value) return;

  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  if (!password.value) {
    toastError({ title: 'Error', description: 'Password is required.' });
    return;
  }

  if (!user.value) {
    toastError({ title: 'Error', description: 'No user logged in. Please log in first.' });
    router.push('/login');
    return;
  }

  try {
    isLoading.value = true;
    // Authenticate the user by re-entering the password
    const { error } = await supabase.auth.signInWithPassword({
      email: user.value.email,
      password: password.value,
    });

    if (error) {
      toastError({ title: 'Incorrect Password', description: 'The password you entered is incorrect. Please try again!' });
    } else {
      password.value = ''; // Clear the form
      toastSuccess({ title: 'Success', description: 'Password verified! Redirecting...' });
      router.push('/reset-passcode');
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    toastError({ title: 'Error', description: 'An unexpected error occurred. Please try again.' });
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

ion-spinner {
  width: 20px;
  height: 20px;
  color: black;
}
</style>
