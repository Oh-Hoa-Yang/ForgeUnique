<template>
  <ion-page>
    <ion-content class="ion-padding custom-background">
      <img class="center-img" src="/public/img/ForgeUniquePhoto.png" alt="ForgeUnique Logo">
      <form @submit.prevent="handleLogin" style="width: 100%; justify-content: center;">
        <ion-item>
          <ion-label position="stacked">Email</ion-label>
          <ion-input v-model="email" type="email" name="email" placeholder="Please enter your email"
            style="font-style:italic" required :disabled="isLoading"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Password</ion-label>
          <ion-input v-model="password" name="password" type="password" placeholder="Please enter your password"
            style="font-style:italic" required :disabled="isLoading">
            <ion-input-password-toggle slot="end" color="medium"></ion-input-password-toggle>
          </ion-input>
        </ion-item>
        <div style="margin-right: 2%;">
          <router-link style="text-align:end; color: #FD8395;" to="/forgotpassword_notice">
            <p style="font-style:italic; padding-right:20px;">FORGOT PASSWORD?</p>
          </router-link>
        </div>
        <ion-button style="width: 100%;" type="submit" class="custom-button" :disabled="isLoading">
          <ion-spinner v-if="isLoading" name="crescent"></ion-spinner>
          <span v-else>Login</span>
        </ion-button>
      </form>
      <ion-button style="width: 100%; display:flex; justify-content: center; align-items: center;" class="custom-button"
        router-link="/register" :disabled="isLoading">Register</ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { useAppToast } from '~/composables/useAppToast'; 
const email = ref('');
const password = ref('');
const isLoading = ref(false);
const { toastError, toastSuccess } = useAppToast();
const supabase = useSupabaseClient(); 
const router = useRouter();  

const handleLogin = async () => {
  if (isLoading.value) return;
  
  if (!email.value || !password.value) {
    toastError({ title: 'Error', description: 'Email and password are required.' });
    return;
  }

  try {
    isLoading.value = true;
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (error) {
      toastError({ title: 'Login Error', description: error.message });
    } else if (user) {
      // Clear form
      email.value = '';
      password.value = '';
      toastSuccess({ title: 'Success', description: 'Logged in successfully!' });
      router.push('/'); 
    }
  } catch (err) {
    toastError({ title: 'Unexpected Error', description: 'An error occurred during login.' });
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  const route = useRoute();
  const type = route.query.type;

  if (type === 'signup') {
    toastSuccess({
      title: 'Email Verified!',
      description: 'Your email has been successfully verified. Please log in.',
    });
  }
});

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