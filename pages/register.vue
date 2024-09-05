<template>
  <ion-page>
    <ion-content class="ion-padding custom-background">
      <div v-if="!success">
        <img class="center-img" src="/public/img/ForgeUniquePhoto.png" alt="ForgeUnique Logo">
        <form @submit.prevent="handleRegister" style="width: 100%; justify-content: center;">
          <ion-item>
            <ion-label position="stacked">Email</ion-label>
            <ion-input v-model="email" name="email" type="email" placeholder="Please enter your email"
              style="font-style:italic" required></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Password</ion-label>
            <ion-input v-model="password" name="password" type="password" placeholder="Please enter your password"
              style="font-style:italic" required>
              <ion-input-password-toggle slot="end" color="medium"></ion-input-password-toggle>
            </ion-input>
          </ion-item>
          <p v-if="passwordError" class="error-message">{{ passwordError }}</p>

          <ion-item>
            <ion-label position="stacked">Confirm Password</ion-label>
            <ion-input v-model="confirmPassword" name="confirmPassword" type="password"
              placeholder="Please enter your password again" style="font-style:italic" required>
              <ion-input-password-toggle slot="end" color="medium"></ion-input-password-toggle>
            </ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Passcode</ion-label>
            <ion-input v-model="passcode" name="passcode" type="number" placeholder="Please enter your passcode"
              style="font-style:italic" required>
              <ion-input-password-toggle slot="end" color="medium"></ion-input-password-toggle>
            </ion-input>
          </ion-item>
          <p v-if="passcodeError" class="error-message">{{ passcodeError }}</p>

          <ion-item>
            <ion-label position="stacked">Confirm Passcode</ion-label>
            <ion-input v-model="confirmPasscode" name="confirmPasscode" type="number"
              placeholder="Please enter your passcode again" style="font-style:italic" required>
              <ion-input-password-toggle slot="end" color="medium"></ion-input-password-toggle>
            </ion-input>
          </ion-item>

          <div style="margin-right: 2%;">
            <a style="text-align:end; color: #FD8395;" href="/login">
              <p style="font-style:italic">Registered? Click here to Login!</p>
            </a>
          </div>
          <ion-button style="width: 100%;" type="submit" class="custom-button">Register</ion-button>
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
          <p style="font-style:italic">Redirecting to the registration page in 5 minutes if not verified...</p>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { useAppToast } from '~/composables/useAppToast'
import CryptoJS from 'crypto-js'

const success = ref(false)
const pending = ref(false)
const { toastError, toastSuccess } = useAppToast()
const supabase = useSupabaseClient()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const passcode = ref('')
const confirmPasscode = ref('')

// Use for the error shown below the user inputs -> password and passcode 
const passwordError = ref(null)
const passcodeError = ref(null)

// Set the rules to validate the password -> min (8 length, 1 upper letter, 1 lower letter, and a symbol)
const validatePassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  return regex.test(password)
}

// Set the rules to validate the passcode -> exactly 6 digits needed
const validatePasscode = (passcode) => {
  return /^\d{6}$/.test(passcode)
}

const handleRegister = async () => {
  if (pending.value) return;  // Prevent multiple requests if one is already in progress
  
  passwordError.value = null
  passcodeError.value = null

  // Validate password rules
  if (!validatePassword(password.value)) {
    const errorMessage = 'Password must be at least 8 characters long, and include an uppercase letter, a lowercase letter, a number, and a special character.'
    passwordError.value = errorMessage
    toastError({ title: 'Password Error', description: errorMessage })
    return
  }

  // Check if password and confirm password match
  if (password.value !== confirmPassword.value) {
    const errorMessage = 'Passwords do not match.'
    toastError({ title: 'Password Error', description: errorMessage })
    return
  }
  
  // Validate passcode rules
  if (!validatePasscode(passcode.value)) {
    const errorMessage = 'Passcode must be exactly 6 digits.'
    passcodeError.value = errorMessage
    toastError({ title: 'Passcode Error', description: errorMessage })
    return
  }

  // Check if passcode and confirm passcode match
  if (passcode.value !== confirmPasscode.value) {
    const errorMessage = 'Passcodes do not match.'
    toastError({ title: 'Passcode Error', description: errorMessage })
    return
  }

  pending.value = true

  try {
    // Register user using Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        emailRedirectTo: 'http://localhost:3000/login', // Deep Link scheme for the app - 'forgeunique://login'
      },
    })

    if (error) {
      // Handle specific error for DUPLICATE email
      if (error.message.includes("already registered")) {
        toastError({ title: 'Registration Error', description: 'This email is already registered. Please use a different email.' });
      } 
      else {
        toastError({ title: 'Error sending email', description: error.message });
      }
      return;
    }


    // Checks if the data.user object is available after the registration process with Supabase -- JUST FOR DEVELOPMENT
    if (!data.user) {
      toastError({ title: 'Unexpected Error', description: 'User data is not available after registration.' });
      return;
    }

    // Hash the passcode using SHA-256
    const hashedPasscode = CryptoJS.SHA256(passcode.value).toString()

    // Insert hashed passcode into the `Users` table
    const { error: insertError } = await supabase
      .from('Users')  // Users table in Supabase - {Table Editor}
      .insert({
        user_id: data.user.id, //To match the user_id with the auth.id 
        passcode: hashedPasscode,  // Store hashed passcode
      })

    if (insertError) {
      toastError({ title: 'Registration Error', description: "This email is already registered. Please use a different email" })
      console.error("Registration Error")
      return
    }

    success.value = true
    toastSuccess({
      title: 'Registration Successful',
      description: 'A confirmation email has been sent. Please verify your email.'
    })

    // Redirect user to the registration page after 5 minutes 
    setTimeout(() => {
      navigateTo('/login')
    }, 5 * 60 * 1000)

  } catch (err) {
    toastError({ title: 'Unexpected Error', description: err.message })
  } finally {
    pending.value = false
  }
}

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

/* for error message - validate password and passcode rules */
.error-message {
  color: red;
  font-size: 12px;
  margin-left: 10px;
}
</style>
