<template>
  <ion-content class="custom-background">
    
    <ion-card>
      <div class="header">
        <ion-icon
        name="arrow-back-outline"
        @click="goBack"
        class="header-icon"
      ></ion-icon>
      <h2>New {{ selectedCategory }}</h2>
      </div>



    </ion-card>

  </ion-content>
</template>

<script setup>
import { useAppToast } from '~/composables/useAppToast';

const { toastError, toastSuccess } = useAppToast();

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const router = useRouter(); 
const route = useRoute()

//General
// Extract the category name passed via query parameter
const selectedCategory = ref(route.query.category || 'Expense');


</script>

<style scoped>
.custom-background {
  --background: #FFEDF5;
  /* height: 10000000px; */
}


.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  font-size: 1.5em;
  color: #FF85A2;
  font-weight: bold;
}

.header-icon {
  font-size: 1.8em;
  cursor: pointer;
}

</style>
