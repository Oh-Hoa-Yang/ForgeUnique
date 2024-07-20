<script setup>
definePageMeta({
  middleware: ['auth'],
})

// function login(){
//   const data = $fetch('',{
//     method: 'POST',
//     body: {
//       username: '',
//       password: ''
//     }
//   });
// }

const { data: expenses } = await useFetch('/api/expenses', {
  method: 'get'
});
const no = ref(0);
no.value = no+1;
</script>
<!-- post(insert), put/patch(update), delete(delete), get(retrieve data) -->
<template>.
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Login</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      Login Page
      
      <div v-for="expense in expenses" :key="expense">
        user: {{ no }}
        <br>
        name: {{ expense.name }}        
        <br>
        type: {{ expense.type }}
      </div>

      <ion-button router-link="/register">Register</ion-button>
    </ion-content>
  </ion-page>
</template>