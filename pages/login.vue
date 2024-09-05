<!-- post(insert), put/patch(update), delete(delete), get(retrieve data) -->
<template>
  <ion-page>
    <ion-content class="ion-padding custom-background">  
      <img class="center-img" src="/public/img/ForgeUniquePhoto.png" alt="ForgeUnique Logo">
       <form @submit.prevent="handleLogin" style="width: 100%; justify-content: center;">
        <ion-item>
          <ion-label position="stacked">Email</ion-label>
          <ion-input v-model="email" type="email" name="email" placeholder="Please enter your email" style="font-style:italic" required></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Password</ion-label>
          <ion-input v-model="passcode" name="password" type="password" placeholder="Please enter your password" style="font-style:italic" required></ion-input>
        </ion-item>
        <div style="margin-right: 2%;">
          <a style="text-align:end; color: #FD8395;" href="/"><p style="font-style:italic">FORGOT PASSWORD?</p></a>
        </div>
        <ion-button style="width: 100%;" router-link="/index" type="submit" class="custom-button">Login</ion-button>  
      </form>
      <hr style="border-bottom: 2px solid black; width: 100%;">
      <br>
      <ion-button style="width: 100%; display:flex; justify-content: center; align-items: center;" class="custom-button" router-link="/register">Register</ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup>
const email = ref('');
const password = ref('');
const router = useIonRouter();

const handleLogin = async () => {
  const supabase = useSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value });

  if (error) {
    alert('Error logging in: ' + error.message);
  } else {
    navigateTo('/index');
  }
};

// definePageMeta({
//   middleware: ['auth'],
// })


// let { data, error } = await supabase.auth.signInWithPassword({
//   email: 'ohhaoyang1@gmail.com',
//   password: 'qweasdzxc'
// })
</script>

<style scoped>
.center-img, ion-item, ion-button, hr {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  padding: 20px;
}
.custom-background{
  --background: #FFEDF5;
}
.custom-button{
  --background: #FFC2D1;
  --background-activated: #ffadb9;
  --background-focused: #ffadb9;
  --background-hover: #ffadb9;
  --background-pressed: #ffadb9;
  --color: black;
  
}
</style>