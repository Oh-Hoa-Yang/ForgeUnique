<template>
  <ion-page>
    <ion-content class="ion-padding custom-background">
      <div v-if="!success">
        <img class="center-img" src="/public/img/ForgeUniquePhoto.png" alt="ForgeUnique Logo">
        <form @submit.prevent="handleRegister" style="width: 100%; justify-content: center;">
          <ion-item>
            <ion-label position="stacked">Email</ion-label>
            <ion-input v-model="email" name="email" type="email" placeholder="Please enter your email"
              style="font-style:italic" required :disabled="isLoading"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Password</ion-label>
            <ion-input v-model="password" name="password" type="password" placeholder="Please enter your password"
              style="font-style:italic" required :disabled="isLoading">
              <ion-input-password-toggle slot="end" color="medium"></ion-input-password-toggle>
            </ion-input>
          </ion-item>
          <p v-if="passwordError" class="error-message pl-3 -mt-4">{{ passwordError }}</p>

          <ion-item>
            <ion-label position="stacked">Confirm Password</ion-label>
            <ion-input v-model="confirmPassword" name="confirmPassword" type="password"
              placeholder="Please enter your password again" style="font-style:italic" required :disabled="isLoading">
              <ion-input-password-toggle slot="end" color="medium"></ion-input-password-toggle>
            </ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Passcode</ion-label>
            <ion-input v-model="passcode" name="passcode" type="number" placeholder="Please enter your passcode"
              style="font-style:italic" required :disabled="isLoading">
              <ion-input-password-toggle slot="end" color="medium"></ion-input-password-toggle>
            </ion-input>
          </ion-item>
          <p v-if="passcodeError" class="error-message pl-3 -mt-4">{{ passcodeError }}</p>

          <ion-item>
            <ion-label position="stacked">Confirm Passcode</ion-label>
            <ion-input v-model="confirmPasscode" name="confirmPasscode" type="number"
              placeholder="Please enter your passcode again" style="font-style:italic" required :disabled="isLoading">
              <ion-input-password-toggle slot="end" color="medium"></ion-input-password-toggle>
            </ion-input>
          </ion-item>

          <div style="margin-right: 2%;">
            <router-link style="text-align:end; color: #FD8395;" to="/login">
              <p style="font-style:italic">Registered? Click here to Login!</p>
            </router-link>
          </div>
          <ion-button style="width: 100%;" type="submit" class="custom-button" :disabled="isLoading">
            <ion-spinner v-if="isLoading" name="crescent"></ion-spinner>
            <span v-else>Register</span>
          </ion-button>
        </form>
      </div>
      <div v-else>
        <ion-card>
          <ion-card-header>
            <ion-card-title>Email has been sent!</ion-card-title>
            <ion-card-subtitle>Email Verification</ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            We have sent an email to <strong>{{ email }}</strong> for verification.
            <strong>Important:</strong> The link will expire in 5 minutes.
          </ion-card-content>    
          <p style="font-style:italic">Redirecting to the login page in 10 seconds...</p>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue';
import { useAppToast } from '~/composables/useAppToast';
import CryptoJS from 'crypto-js';

definePageMeta({
  layout: 'auth'
})

const success = ref(false);
const isLoading = ref(false);
const { toastError, toastSuccess } = useAppToast();
const supabase = useSupabaseClient();
const router = useRouter();
const route = useRoute();

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const passcode = ref('');
const confirmPasscode = ref('');

// Error messages
const passwordError = ref(null);
const passcodeError = ref(null);

// Password validation
const validatePassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;
  return regex.test(password);
};

// Passcode validation
const validatePasscode = (passcode) => {
  return /^\d{6}$/.test(passcode);
};

const clearForm = () => {
  email.value = '';
  password.value = '';
  confirmPassword.value = '';
  passcode.value = '';
  confirmPasscode.value = '';
  passwordError.value = null;
  passcodeError.value = null;
};

const handleRegister = async () => {
  if (isLoading.value) return;

  passwordError.value = null;
  passcodeError.value = null;

  // Basic validation
  if (!email.value || !password.value || !confirmPassword.value || !passcode.value || !confirmPasscode.value) {
    toastError({ title: 'Validation Error', description: 'All fields are required.' });
    return;
  }

  // Validate password rules
  if (!validatePassword(password.value)) {
    const errorMessage = 'Password must be at least 8 characters long, and include an uppercase letter (A-Z), a lowercase letter(a-z), a number(0-9), and a special character (`@`, `$`, `!`, `%`, `*`, `?`, `&`, `.`)';
    passwordError.value = errorMessage;
    toastError({ title: 'Password Error', description: errorMessage });
    return;
  }

  // Password match check
  if (password.value !== confirmPassword.value) {
    toastError({ title: 'Password Error', description: 'Passwords do not match.' });
    return;
  }
  
  // Validate passcode rules
  if (!validatePasscode(passcode.value)) {
    const errorMessage = 'Passcode must be exactly 6 digits.';
    passcodeError.value = errorMessage;
    toastError({ title: 'Passcode Error', description: errorMessage });
    return;
  }

  // Passcode match check
  if (passcode.value !== confirmPasscode.value) {
    toastError({ title: 'Passcode Error', description: 'Passcodes do not match.' });
    return;
  }

  try {
    isLoading.value = true;

    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        emailRedirectTo: 'https://forgeunique.vercel.app/finishregistered',
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        toastError({ title: 'Registration Error', description: 'This email is already registered. Please use a different email.' });
      } else {
        toastError({ title: 'Error sending email', description: error.message });
      }
      return;
    }

    if (!data.user) { 
      toastError({ title: 'Unexpected Error', description: 'User data is not available after registration.' });
      return;
    }

    const hashedPasscode = CryptoJS.SHA256(passcode.value).toString();
    
    const { error: insertError } = await supabase
      .from('Users')  
      .insert({
        user_id: data.user.id,
        passcode: hashedPasscode,  
      });

    if (insertError) {
      toastError({ title: 'Registration Error', description: "Failed to save user data. Please try again." });
      console.error("Registration Error:", insertError);
      return;
    }

    success.value = true;
    clearForm();
    toastSuccess({
      title: 'Registration Successful',
      description: 'A confirmation email has been sent. Please verify your email.'
    });

    setTimeout(() => {
      router.push('/login');
    }, 10000);

  } catch (err) {
    console.error("Unexpected Error:", err);
    toastError({ title: 'Unexpected Error', description: 'An error occurred during registration. Please try again.' });
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.center-img,
ion-item,
ion-button,
hr {
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

/* for error message */
.error-message {
  color: red;
  font-size: 12px;
  margin-left: 10px;
}

ion-spinner {
  width: 20px;
  height: 20px;
  color: black;
}
</style>