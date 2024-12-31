<template>
  <ion-page>
    <ion-content class="ion-padding custom-background">
      <ion-card>
        <div>
          <ion-button class="custom-button" disabled="true"><b>NOTICE</b></ion-button>
        </div>
        <p style="padding: 20px; text-align: start;">To make sure you are more securely manage your password, open the
          link below at the <b>BROWSER / WEBSITE :</b><br></p>
        <p style="text-align: center;"><b>https://forgeunique.vercel.app/forgot_password</b></p>
        <ion-button class="nav-button" router-link="/login">Back To Login</ion-button>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { useAppToast } from '~/composables/useAppToast';
const { toastError, toastSuccess } = useAppToast();
const router = useRouter();
const supabase = useSupabaseClient();

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
  --background: #f7537c;
  --background-activated: #ff546e;
  --background-focused: #ffadb9;
  --background-hover: #ffadb9;
  --background-pressed: #ffadb9;
  font-weight: bold;
  --color: black;
  font-size: 20px;
}

.nav-button {
  --background: #FFC2D1;
  --background-activated: #ffadb9;
  --background-focused: #ffadb9;
  --background-hover: #ffadb9;
  --background-pressed: #ffadb9;
  --color: black;
}
</style>