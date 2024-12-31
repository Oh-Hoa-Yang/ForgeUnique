<template>
  <ion-page>
    <ion-content class="ion-padding custom-background">
      <img class="center-img" src="/public/img/ForgeUniquePhoto.png" alt="ForgeUnique Logo" />
      <p style="padding: 20px; text-align: center;">Please enter your email to reset your password:</p>
      <form @submit.prevent="sendResetLink" style="width: 100%; justify-content: center;">
        <ion-item>
          <ion-label position="stacked">Email</ion-label>
          <ion-input v-model="email" type="email" name="email" placeholder="Please enter your email"
            style="font-style: italic;" required />
        </ion-item>
        <ion-button style="width: 100%;" type="submit" class="custom-button">Send Reset Link</ion-button>
      </form>
        <a style="text-align:center; color:#FD8395;" href="/login">
          <p>Sign in or Sign up</p>
        </a>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { useAppToast } from '~/composables/useAppToast';
const email = ref('');
const { toastError, toastSuccess } = useAppToast();
const router = useRouter();
const supabase = useSupabaseClient();
const sendResetLink = async (email) => {
  if (!email.value) {
    toastError({ title: 'Error', description: 'Email is required.' });
    return;
  }
  // Supabase's built-in API for sending password reset emails
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'forgeunique:/localhost/reset-password',  // Your reset password page /
  });
  if (error) {
    toastError({ title: 'Error', description: 'Failed to send reset link. ' + error.message });
  } else {
    toastSuccess({ title: 'Success', description: 'Reset link sent to your email!' });
    setTimeout(() => {
      router.push('/login');
    }, 5000);
  }
};
</script>

<style scoped>
.center-img,
ion-item,
ion-button
{
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