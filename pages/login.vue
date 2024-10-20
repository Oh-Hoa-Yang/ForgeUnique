<template>
  <ion-page>
    <ion-content class="ion-padding custom-background">
      <img class="center-img" src="/public/img/ForgeUniquePhoto.png" alt="ForgeUnique Logo">
      <form @submit.prevent="handleLogin" style="width: 100%; justify-content: center;">
        <ion-item>
          <ion-label position="stacked">Email</ion-label>
          <ion-input v-model="email" type="email" name="email" placeholder="Please enter your email"
            style="font-style:italic" required></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Password</ion-label>
          <ion-input v-model="password" name="password" type="password" placeholder="Please enter your password"
            style="font-style:italic" required>
            <ion-input-password-toggle slot="end" color="medium"></ion-input-password-toggle>
          </ion-input>
        </ion-item>
        <div style="margin-right: 2%;">
          <a style="text-align:end; color: #FD8395;" href="/forgot_password">
            <p style="font-style:italic; padding-right:20px;">FORGOT PASSWORD?</p>
          </a>
        </div>
        <ion-button style="width: 100%;" type="submit" class="custom-button">Login</ion-button>
      </form>
      <ion-button style="width: 100%; display:flex; justify-content: center; align-items: center;" class="custom-button"
        router-link="/register">Register</ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { useAppToast } from '~/composables/useAppToast'; 
const email = ref('');
const password = ref('');
const { toastError, toastSuccess } = useAppToast();
const supabase = useSupabaseClient(); 
const router = useRouter();  
const handleLogin = async () => {
  if (!email.value || !password.value) {
    toastError({ title: 'Error', description: 'Email and password are required.' });
    return;
  }
  const { data: { user }, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });
  if (error) {
    toastError({ title: 'Login Error', description: error.message });
  } else if (user) {
    toastSuccess({ title: 'Success', description: 'Logged in successfully!' });
    router.push('/'); 
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