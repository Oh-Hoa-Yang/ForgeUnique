<template>
  <ion-page>
    <ion-content class="ion-padding custom-background">
      <img class="center-img" src="/public/img/ForgeUniquePhoto.png" alt="ForgeUnique Logo" />
      <p style="padding: 20px;">PLEASE ENTER YOUR PASSCODE:</p>
      <form style="width: 100%; justify-content: center;" @submit.prevent>
        <div class="passcode-wrapper">
          <ion-input v-for="(digit, index) in passcode" :key="index" :ref="'inputField' + index" :readonly="true"
            v-model="passcode[index]" maxlength="1" type="password"></ion-input>
        </div>
        <div style="margin-right: 2%;">
          <router-link style="text-align:end; color: #FD8395;" to="/forgot_passcode">
            <p style="font-style:italic; padding-right:20px;">FORGOT PASSCODE?</p>
          </router-link>
        </div>
        <div class="keypad-wrapper">
          <div class="keypad-row">
            <button type="button" @click="inputDigit(1)">1</button>
            <button type="button" @click="inputDigit(2)">2</button>
            <button type="button" @click="inputDigit(3)">3</button>
          </div>
          <div class="keypad-row">
            <button type="button" @click="inputDigit(4)">4</button>
            <button type="button" @click="inputDigit(5)">5</button>
            <button type="button" @click="inputDigit(6)">6</button>
          </div>
          <div class="keypad-row">
            <button type="button" @click="inputDigit(7)">7</button>
            <button type="button" @click="inputDigit(8)">8</button>
            <button type="button" @click="inputDigit(9)">9</button>
          </div>
          <div class="keypad-row">
            <button type="button" @click="deleteLastDigit">DEL</button>
            <button type="button" @click="inputDigit(0)">0</button>
            <button type="button" @click="resetPasscode">C</button>
          </div>
        </div>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue';
import { useAppToast } from '~/composables/useAppToast';
import CryptoJS from 'crypto-js';

definePageMeta({
  middleware: 'auth'
})

const router = useRouter(); 

const passcode = ref(['', '', '', '', '', '']);
let currentIndex = ref(0);
const { toastError, toastSuccess } = useAppToast();
const inputFields = []; // Store input fields as an array of refs

const inputDigit = async (digit) => {
  if (currentIndex.value < 6) {
    passcode.value[currentIndex.value] = digit.toString();
    currentIndex.value++;
    await nextTick();

    if (currentIndex.value < 6) {
      const nextField = inputFields[currentIndex.value];
      if (nextField) {
        nextField.focus();
      }
    } else {
      checkPasscode();
    }
  }
};

const deleteLastDigit = async () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
    passcode.value[currentIndex.value] = '';
    await nextTick();
    const prevField = inputFields[currentIndex.value];
    if (prevField) {
      prevField.focus();
    }
  }
};

const checkPasscode = async () => {
  const enteredPasscode = passcode.value.join('');
  const hashedPasscode = CryptoJS.SHA256(enteredPasscode).toString();

  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  if (!user.value) {
    toastError({ title: 'Error', description: 'No user logged in' });
    return;
  }

  const { data, error } = await supabase
    .from('Users')
    .select('passcode')
    .eq('user_id', user.value.id);

  if (error) {
    toastError({ title: 'Error', description: `Error fetching passcode: ${error.message}` });
    return;
  }

  if (data && data.length > 0 && data[0].passcode === hashedPasscode) {
    toastSuccess({ title: 'Success', description: 'Passcode verified!' });
    router.push('/homepage');
  } else {
    toastError({ title: 'Incorrect Passcode', description: 'The passcode you entered is incorrect. Please try again!' });
    resetPasscode();
  }
};

const resetPasscode = async () => {
  passcode.value = ['', '', '', '', '', ''];
  currentIndex.value = 0;
  await nextTick();
  if (inputFields[0]) {
    inputFields[0].focus();
  }
};

onMounted(() => {
  for (let i = 0; i < 6; i++) {
    inputFields[i] = document.querySelector(`[ref="inputField${i}"] input`);
  }
});
</script>

<style scoped>
.center-img,
.passcode-wrapper {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  padding: 20px;
  display: flex;
  justify-content: center;
}

.passcode-wrapper ion-input {
  width: 50px;
  text-align: center;
  border: 1px solid black;
  margin-right: 5px;
  font-size: 24px;
}

.keypad-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.keypad-row {
  display: flex;
  justify-content: center;
  margin: 5px;
}

button {
  width: 70px;
  height: 70px;
  font-size: 24px;
  margin: 5px;
  border: none;
  background-color: #FFC2D1;
  border-radius: 10px;
  cursor: pointer;
}

button:active {
  background-color: #ccc;
}

.custom-background {
  --background: #FFEDF5;
}
</style>