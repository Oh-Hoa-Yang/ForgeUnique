<template>
  <!-- Main Page with Content -->
  <ion-page id="main-content">
    <!-- Main Content (imported component) -->
     <div class="custom-background">
      <div class="container mx-auto">
       <ion-card class="expense-card mx-4">
         <h1 style="text-align: center; font-weight: bold; color: black;">EXPENSE</h1>
         <h4 style="font-style: italic;">**Select the categories below to <b style="color: black;">ADD</b> your expense.</h4>
 
         <!-- Categories Grid -->
         <div class="grid grid-cols-5 gap-3 my-4 md:grid-cols-4 max-sm:grid-cols-2 gap-4">
           <ion-button
             v-for="category in categories"
             :key="category.name"
             class="category-btn"
             @click="goToAddExpensePage(category.name)"
           >
             <div>
               <span :class="category.iconClass" class="category-icon"></span> 
               <span class="category-name text-[10px]"><br>{{ category.name }}</span>
             </div>
           </ion-button>
         </div>
 
         <div class="mx-2 flex flex-wrap flex-col justify-between"> 
           <!-- Total Expense Button  -->
             <ion-button class="balance-button" disabled="true">
               <!-- Expense ({{ appState.monthlyExpense }}) -->
               Expense ({{ monthlyExpense }})
             </ion-button>
           
           <!-- Expense budget Button with display  -->
             <ion-button class="budget-button" @click="openModal">
               Budget ({{ budget }})
             </ion-button>
           
           <!-- Expense Record Button -->
             <ion-button class="record-button" @click="router.push('/expenserecordpage')">
               Record
             </ion-button>
         </div>
       </ion-card>
 
       <!-- Custom Modal for Budget -->
       <div v-if="showModal" class="modal-overlay">
         <div class="modal-content">
           <h3>Set Your Budget</h3>
           <ion-input
             v-model="newBudget"
             type="number"
             placeholder="Enter your budget"
             class="budget-input"
           ></ion-input>
           <div class="modal-buttons">
             <ion-button @click="setBudget">Set</ion-button>
             <ion-button color="medium" @click="closeModal">Cancel</ion-button>
           </div>
         </div>
       </div>
      </div>
     </div>
  </ion-page>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { onIonViewWillEnter } from '@ionic/vue';

const route = useRoute();

definePageMeta({
  middleware: 'auth'
})

import { useAppToast } from '~/composables/useAppToast';

const { toastError, toastSuccess } = useAppToast();

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const router = useRouter();

const monthlyExpense = ref(0);

const fetchExpenses = async () => {
  if (!user.value) {
    console.log('No user found'); 
    return;
  }
  
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based

    console.log('Fetching expenses for:', { year: currentYear, month: currentMonth });

    const { data: expenses, error } = await supabase
      .from('Expenses')
      .select('expenseAmount, expenseDate')
      .eq('user_id', user.value.id)

    if (error) {
      console.error('Error fetching expenses:', error);
      monthlyExpense.value = 0;
      return;
    }

    // let fetchedMonthlyExpense = 0;

    // if (expenses) {
    //   fetchedMonthlyExpense = expenses
    //     .filter((expense) => {
    //       const expenseDate = new Date(expense.expenseDate);
    //       return (
    //         expenseDate.getFullYear() === currentYear &&
    //         expenseDate.getMonth() + 1 === currentMonth
    //       );
    //     })
    //     .reduce((sum, expense) => sum + expense.expenseAmount, 0);

    const total = expenses ? expenses.filter((expense) => {
      const expenseDate = new Date(expense.expenseDate);
      return (
        expenseDate.getFullYear() === currentYear &&
        expenseDate.getMonth() + 1 === currentMonth
      );
    })
    .reduce((sum, expense) => sum + (expense.expenseAmount || 0), 0)
    : 0;
    console.log('Total expense for current month:', total);

    monthlyExpense.value = total;
  } catch (err) {
    console.error('Error fetching expenses from Supabase:', err.message);
    // monthlyExpense.value = fetchedMonthlyExpense;
    // return { monthlyExpense: fetchedMonthlyExpense };
  // } catch (err) {
  //   console.error('Error fetching expenses from Supabase:', err.message);
  //   return { monthlyExpense: 0 };
  }
};

//General
const totalExpense = ref(0);
const budget = ref(0); //Current budget
const newBudget = ref(''); //Input for new budget
const showModal = ref(false); //Controls the visibility of the modal 

const categories = ref([
  { name: "Dining Out", iconClass: "mdi--food" },
  { name: "Bill", iconClass: "nimbus--money" },
  { name: "Car", iconClass: "gravity-ui--car" },
  { name: "Clothes", iconClass: "icon-park-outline--clothes-crew-neck" },
  { name: "Groceries", iconClass: "ph--handbag-duotone" },
  { name: "Communication", iconClass: "icon-park-twotone--communication" },
  { name: "Entertainment", iconClass: "mingcute--game-2-fill" },
  { name: "Gifts", iconClass: "iconamoon--gift-duotone" },
  { name: "Health", iconClass: "ix--health-filled" },
  { name: "House", iconClass: "f7--house-fill" },
  { name: "Pets", iconClass: "mdi--rabbit" },
  { name: "Sports", iconClass: "ic--round-sports-football" },
  { name: "Travel", iconClass: "emojione-monotone--small-airplane" },
  { name: "Transportation", iconClass: "pepicons-pencil--train" },
  { name: "Charity", iconClass: "mdi--charity" },
  { name: "Others", iconClass: "basil--other-1-outline" },
]);

//Open and Close Modal 
const openModal = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  newBudget.value = '';
};

//Fetch the current budget from Supabase 
const fetchBudget = async () => {
  try {
    const { data, error } = await supabase
      .from('Users')
      .select('budget')
      .eq('user_id', user.value.id)
      .single();

    if (error) throw error;

    budget.value = data?.budget || 0;
  } catch (err) {
    console.error('Error fetching budget:', err.message);
  }
};

//Set the new budget and update in Supabase 
const setBudget = async () => {
  if (!newBudget.value) {
    toastError({ title: "Error", description: 'Budget cannot be empty!' });
    return;
  }

  try {
    const { error } = await supabase
    // .from('Users')
    // .update({ budget: parseFloat(newBudget.value), email: user.value.email }) //Ensure the budget is stored as float
    // .eq('user_id', user.value.id);
    .from('Users')
    .update({ budget: parseFloat(newBudget.value), email: user.value.email })
    .eq('user_id', user.value.id);
    
    if (error) throw error;
    
    // budget.value = parseFloat(newBudget.value); //update local
    // appState.budget = budget.value;
    budget.value = parseFloat(newBudget.value);
    closeModal();
    toastSuccess({ title: 'Success', description: 'Budget updated successfully!' })
  } catch (err) {
    console.error('Error updating budget:', err.message);
    toastError({ title: 'Error', description: 'Failed to update budget. Try again!' });
  }
};

//Navigate to add expense page
const goToAddExpensePage = (category) => {
  router.push({ path: '/addexpensepage', query: {category }});
};

//Fetch budget when the component mounts
onMounted(() => {
  fetchBudget();
});

//Fetch Total Expense
// const fetchTotalExpense = async () => {
//   try {
//     const currentDate = new Date();
//     const currentYear = currentDate.getFullYear();
//     const currentMonth = currentDate.getMonth() + 1; // JavaScript months are zero-based
    
//     // Query the database for the sum of expenseAmount for the current year and month
//     const { data, error } = await supabase
//     .from('Expenses')
//     .select('expenseAmount, expenseDate') // Fetch expenseAmount and expenseDate
//     .eq('user_id', user.value.id);
    
//     if (error) {
//       console.error('Error fetching expenses:', error);
//       return;
//     }
    
//     // Filter and sum expenses for the same year and month
//     const total = data
//     .filter((expense) => {
//       const expenseDate = new Date(expense.expenseDate);
//       return (
//         expenseDate.getFullYear() === currentYear &&
//         expenseDate.getMonth() + 1 === currentMonth
//       );
//     })
//     .reduce((sum, expense) => sum + expense.expenseAmount, 0);
    
//     totalExpense.value = total;
//   } catch (error) {
//     console.error('Unexpected error:', error);
//   }
// };

//Call the total expense
// onMounted(fetchTotalExpense);
onMounted(fetchExpenses);
// Watch for query changes
// watch(
//   () => route.query.refresh,
//   (refresh) => {
//     if (refresh) {
//       fetchExpenses();
//     }
//   },
//   { immediate: true } // Run on component mount
// );

// Function to refresh all data
const refreshData = async () => {
  try {
    await fetchExpenses();
    await fetchBudget();
  } catch (error) {
    console.error('Error refreshing data:', error);
    toastError({ title: 'Error', description: 'Failed to refresh data' });
  }
};

// Use Ionic's lifecycle hook to refresh data when view enters
onIonViewWillEnter(async () => {
  await refreshData();
});

</script>

<style scoped>
.custom-background {
  background: #FFEDF5;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  flex: 1;
  box-sizing: border-box;
  border-radius: 8px;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  overflow-y: auto;
}

.expense-card {
  display: flex;
  flex-direction: column;
  /* flex: 1; */
  align-items: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  background-color: white;
  overflow-y: auto;
  max-height: 100vh;
  height: 100%;
  /* Ensure card background color is visible */
}

.category-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  --background: #FFD6E5;
  --color: #000;
  height: 100px;
  width: 100px;
  border-radius: 8px;
  text-align: center;
  margin: 0 auto;
}

.category-icon {
  font-size: 24px;
  margin-bottom: 5px;
  display: inline-block;
  width: 50px;
  height: 50px;
}

.category-name {
  text-align: center;
  margin-top: 5px;
}

.mdi--food {
  display: inline-block;
  width: 50px;
  height: 50px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23ff65bc' d='M18.06 23h1.66c.84 0 1.53-.65 1.63-1.47L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26c1.44 1.42 2.43 2.89 2.43 5.29zM1 22v-1h15.03v1c0 .54-.45 1-1.03 1H2c-.55 0-1-.46-1-1m15.03-7C16.03 7 1 7 1 15zM1 17h15v2H1z'/%3E%3C/svg%3E");
}

.nimbus--money {
  display: inline-block;
  width: 54px;
  height: 50px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%23ff65bc' d='M12.32 8a3 3 0 0 0-2-.7H5.63A1.59 1.59 0 0 1 4 5.69a2 2 0 0 1 0-.25a1.59 1.59 0 0 1 1.63-1.33h4.62a1.59 1.59 0 0 1 1.57 1.33h1.5a3.08 3.08 0 0 0-3.07-2.83H8.67V.31H7.42v2.3H5.63a3.08 3.08 0 0 0-3.07 2.83a2 2 0 0 0 0 .25a3.07 3.07 0 0 0 3.07 3.07h4.74A1.59 1.59 0 0 1 12 10.35a2 2 0 0 1 0 .34a1.59 1.59 0 0 1-1.55 1.24h-4.7a1.59 1.59 0 0 1-1.55-1.24H2.69a3.08 3.08 0 0 0 3.06 2.73h1.67v2.27h1.25v-2.27h1.7a3.08 3.08 0 0 0 3.06-2.73v-.34A3.06 3.06 0 0 0 12.32 8'/%3E%3C/svg%3E");
}

.gravity-ui--car {
  display: inline-block;
  width: 50px;
  height: 50px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%23ff65bc' fill-rule='evenodd' d='M5.5 11H4.419l-.342 1.026l-.158.474H2V9.52c.496.129 1.213.23 2.25.23a.75.75 0 1 0 0-1.5c-1.073 0-1.682-.12-1.998-.217a2 2 0 0 1-.204-.075a1.8 1.8 0 0 1 .485-.87q.11-.11.214-.228C4.272 7.293 6.15 7.5 8 7.5s3.728-.207 5.253-.64q.103.119.214.228c.241.242.408.544.485.87q-.066.032-.204.075c-.316.097-.925.217-1.998.217a.75.75 0 0 0 0 1.5c1.037 0 1.754-.101 2.25-.23v2.98h-1.919l-.158-.474L11.581 11zm6.924-5.472C11.144 5.838 9.584 6 8 6s-3.144-.162-4.424-.472q.046-.112.088-.226l.448-1.257c.18-.505.57-.806.96-.863a20.8 20.8 0 0 1 5.855 0c.392.057.78.358.96.863l.45 1.257q.04.114.087.226m-1.652 7.788L10.5 12.5h-5l-.272.816a1 1 0 0 1-.949.684H1.5a1 1 0 0 1-1-1V8.375c0-.88.35-1.725.972-2.347a3.3 3.3 0 0 0 .43-.528H1.25a.75.75 0 1 1 0-1.5h1.286l.164-.46c.343-.96 1.148-1.696 2.157-1.842a22.3 22.3 0 0 1 6.286 0c1.009.146 1.814.882 2.157 1.843l.164.459h1.286a.75.75 0 0 1 0 1.5h-.651q.187.286.429.528a3.32 3.32 0 0 1 .972 2.347V13a1 1 0 0 1-1 1h-2.78a1 1 0 0 1-.948-.684' clip-rule='evenodd'/%3E%3C/svg%3E");
}

.icon-park-outline--clothes-crew-neck {
  display: inline-block;
  width: 50px;
  height: 50px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cg fill='none' stroke='%23ff65bc' stroke-linecap='round' stroke-linejoin='round' stroke-width='4'%3E%3Cpath d='M37 17v20m-26 0v7h26v-7m-26 0H4V17c0-3 2-6.5 5-9s9-4 9-4h12s6 1.5 9 4s5 6 5 9v20h-7m-26 0V17'/%3E%3Cpath d='M30 4a6 6 0 0 1-12 0'/%3E%3C/g%3E%3C/svg%3E");
}

.ph--handbag-duotone {
  display: inline-block;
  width: 50px;
  height: 50px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3E%3Cg fill='%23ff65bc'%3E%3Cpath d='M223.92 208H32.08a8 8 0 0 1-8-8.93l14.25-120a8.06 8.06 0 0 1 8-7.07h163.34a8.06 8.06 0 0 1 8 7.07l14.25 120a8 8 0 0 1-8 8.93' opacity='0.2'/%3E%3Cpath d='m239.89 198.12l-14.26-120a16 16 0 0 0-16-14.12H176a48 48 0 0 0-96 0H46.33a16 16 0 0 0-16 14.12l-14.26 120A16 16 0 0 0 20 210.6a16.13 16.13 0 0 0 12 5.4h191.92a16.13 16.13 0 0 0 12.08-5.4a16 16 0 0 0 3.89-12.48M128 32a32 32 0 0 1 32 32H96a32 32 0 0 1 32-32M32 200L46.33 80H80v24a8 8 0 0 0 16 0V80h64v24a8 8 0 0 0 16 0V80h33.75l14.17 120Z'/%3E%3C/g%3E%3C/svg%3E");
}

.icon-park-twotone--communication {
  display: inline-block;
  width: 50px;
  height: 50px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cdefs%3E%3Cmask id='ipTCommunication0'%3E%3Cg fill='none' stroke='%23fff' stroke-linecap='round' stroke-width='4'%3E%3Cpath stroke-linejoin='round' d='M33 38H22v-8h14v-8h8v16h-5l-3 3z'/%3E%3Cpath fill='%23555555' stroke-linejoin='round' d='M4 6h32v24H17l-4 4l-4-4H4z'/%3E%3Cpath d='M19 18h1m6 0h1m-15 0h1'/%3E%3C/g%3E%3C/mask%3E%3C/defs%3E%3Cpath fill='%23ff65bc' d='M0 0h48v48H0z' mask='url(%23ipTCommunication0)'/%3E%3C/svg%3E");
}

.mingcute--game-2-fill {
  display: inline-block;
  width: 50px;
  height: 50px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cg fill='none'%3E%3Cpath d='m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z'/%3E%3Cpath fill='%23ff65bc' d='M17 4c1.106 0 1.955.843 2.584 1.75l.213.321l.195.32q.093.157.178.308c.787 1.407 1.472 3.244 1.925 5.059c.45 1.801.699 3.682.54 5.161C22.475 18.404 21.71 20 20 20c-1.534 0-2.743-.82-3.725-1.621l-1.11-.931C14.242 16.692 13.232 16 12 16s-2.243.692-3.164 1.448l-1.11.93C6.742 19.18 5.533 20 4 20c-1.711 0-2.476-1.596-2.635-3.081c-.158-1.48.09-3.36.54-5.161c.453-1.815 1.138-3.652 1.925-5.059l.178-.309l.195-.319l.213-.321C5.045 4.843 5.894 4 7 4c.51 0 1.017.124 1.515.27l.593.182q.147.045.292.086c.865.248 1.75.462 2.6.462s1.735-.214 2.6-.462l.885-.267C15.983 4.124 16.49 4 17 4M8.5 8a2.5 2.5 0 1 0 0 5a2.5 2.5 0 0 0 0-5m7 0a1 1 0 0 0-1 1v.5H14a1 1 0 1 0 0 2h.5v.5a1 1 0 1 0 2 0v-.5h.5a1 1 0 1 0 0-2h-.5V9a1 1 0 0 0-1-1m-7 2a.5.5 0 1 1 0 1a.5.5 0 0 1 0-1'/%3E%3C/g%3E%3C/svg%3E");
}

.iconamoon--gift-duotone {
  display: inline-block;
  width: 50px;
  height: 50px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cg fill='none'%3E%3Cpath fill='%23ff65bc' d='M4 19v-7h16v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2' opacity='0.16'/%3E%3Cpath stroke='%23ff65bc' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 12v8m-8-9v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8'/%3E%3Cpath stroke='%23ff65bc' stroke-linejoin='round' stroke-width='2' d='M6 4.5A2.5 2.5 0 0 1 8.5 2A3.5 3.5 0 0 1 12 5.5V7H8.5A2.5 2.5 0 0 1 6 4.5Zm12 0A2.5 2.5 0 0 0 15.5 2A3.5 3.5 0 0 0 12 5.5V7h3.5A2.5 2.5 0 0 0 18 4.5Z'/%3E%3Cpath stroke='%23ff65bc' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M3 7h18v4H3zm9 4v10'/%3E%3C/g%3E%3C/svg%3E");
}

.ix--health-filled {
  display: inline-block;
  width: 50px;
  height: 50px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%23ff65bc' fill-rule='evenodd' d='M248.959 107.967c-44.804-55.608-124.849-58.955-173.652-7.261c-34.192 36.217-43.081 89.085-26.668 133.961h87.489L192 122.964l64 127.98l32-63.98l23.851 47.703h151.512c16.412-44.875 7.523-97.744-26.668-133.961c-48.804-51.693-128.848-48.347-173.653 7.261l-7.041 8.739zM437.26 277.333H290.518L256 346.369l-64-128.001l-29.482 58.965H74.742q.281.302.565.603L255.91 469.237l.089.096H256l180.694-191.397q.283-.3.565-.603' clip-rule='evenodd'/%3E%3C/svg%3E");
}

.f7--house-fill {
  display: inline-block;
  width: 50px;
  height: 50px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 56 56'%3E%3Cpath fill='%23ff65bc' d='M.625 27.824c0 1.125.89 1.805 1.992 1.805c.68 0 1.219-.328 1.688-.797L27.18 7.996c.257-.258.539-.352.843-.352c.282 0 .54.094.82.352l22.852 20.836c.492.469 1.031.797 1.688.797c1.101 0 1.992-.68 1.992-1.805c0-.703-.258-1.148-.703-1.547l-8.11-7.382V5.043c0-1.031-.656-1.687-1.687-1.687h-3.07c-1.008 0-1.711.656-1.711 1.687v7.969l-9.282-8.485C29.992 3.754 28.984 3.38 28 3.38c-.985 0-1.969.375-2.813 1.148L1.328 26.277c-.422.399-.703.844-.703 1.547m6.703 19.664c0 3.258 1.969 5.157 5.273 5.157h9.493V35.98c0-1.078.726-1.78 1.804-1.78h8.274c1.078 0 1.781.702 1.781 1.78v16.665h9.469c3.304 0 5.25-1.899 5.25-5.157V30.332l-19.899-17.93c-.258-.234-.539-.351-.82-.351c-.258 0-.516.117-.797.375L7.328 30.449Z'/%3E%3C/svg%3E");
}

.mdi--rabbit {
  display: inline-block;
  width: 50px;
  height: px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23ff65bc' d='m18.05 21l-2.73-4.74c0-1.73-1.07-2.84-2.37-2.84c-.9 0-1.68.5-2.08 1.24c.33-.19.72-.29 1.13-.29c1.3 0 2.36 1.06 2.36 2.36c0 1.31-1.05 2.38-2.36 2.38h3.3V21H6.79c-.24 0-.49-.09-.67-.28a.95.95 0 0 1 0-1.34l.5-.5c-.34-.15-.62-.38-.9-.62c-.22.5-.72.85-1.3.85a1.425 1.425 0 0 1 0-2.85l.47.08v-1.97a4.73 4.73 0 0 1 4.74-4.74h.02c2.12.01 3.77.84 3.77-.47c0-.93.2-1.3.54-1.82c-.73-.34-1.56-.55-2.43-.55c-.53 0-.95-.42-.95-.95c0-.43.28-.79.67-.91l-.67-.04c-.52 0-.95-.42-.95-.94c0-.53.43-.95.95-.95h.95c2.1 0 3.94 1.15 4.93 2.85l.28-.01c.71 0 1.37.23 1.91.61l.45.38c2.17 1.95 1.9 3.27 1.9 3.28c0 1.28-1.06 2.33-2.35 2.33l-.49-.05v.08c0 1.11-.48 2.1-1.23 2.8L20.24 21zm.11-13.26c-.53 0-.95.42-.95.94c0 .53.42.95.95.95c.52 0 .95-.42.95-.95c0-.52-.43-.94-.95-.94'/%3E%3C/svg%3E");
}

.ic--round-sports-football {
  display: inline-block;
  width: 50px;
  height: 50px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23ff65bc' d='M3.02 15.62c-.08 2.42.32 4.34.67 4.69s2.28.76 4.69.67zM13.08 3.28c-2.33.42-4.79 1.34-6.62 3.18s-2.76 4.29-3.18 6.62l7.63 7.63c2.34-.41 4.79-1.34 6.62-3.18s2.76-4.29 3.18-6.62zm1.72 7.32l-4.2 4.2c-.39.39-1.01.39-1.4 0s-.39-1.01 0-1.4l4.2-4.2c.39-.39 1.01-.39 1.4 0s.39 1.01 0 1.4m6.18-2.22c.08-2.42-.32-4.34-.67-4.69s-2.28-.76-4.69-.67z'/%3E%3C/svg%3E");
}

.emojione-monotone--small-airplane {
  display: inline-block;
  width: 50px;
  height: 50px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath fill='%23ff65bc' d='M13.389 39.519c-.212.551-.691 2.035-.811 4.414c2.04-.405 3.578-2.222 3.578-4.406h-2.664c-.035-.001-.068-.008-.103-.008'/%3E%3Cellipse cx='22.371' cy='39.527' fill='%23ff65bc' rx='.888' ry='1.686'/%3E%3Cellipse cx='25.924' cy='38.404' fill='%23ff65bc' rx='.889' ry='1.685'/%3E%3Cellipse cx='29.475' cy='37.279' fill='%23ff65bc' rx='.887' ry='1.686'/%3E%3Cpath fill='%23ff65bc' d='m56.113 47.531l-17.446-7.797q.239-.323.479-.652c.43-.59.886-1.211 1.393-1.821c2.317-.191 6.797-1.867 8.385-3.444c.147-.146.248-.441.313-.81L62 25.532l-10.129 2.85l1.031-5l3.354-1.278l-3.174.403l.398-1.929l1.645.41l3.652-2.604l-4.559-1.386l.025-.126l.684-3.314l-3.01 1.27l-.707.298L48.123 12l-3.553 1.123l1.822 4.035l-.352.147l-.297.536l-3.328 6.02l-1.657.211a.5.5 0 0 0-.304-.123s-5.814.764-7.992 2.804c-.416.39-.849.969-.881 2.114a833 833 0 0 0-7.795 2.382l-8.519-6.89v-5.618l-1.776 1.124l-1.776 5.617l4.064 8.357c-.382.132-.746.259-1.076.379c-4.909 1.769-5.94 3.753-7.133 6.051c-.708 1.363-1.44 2.772-3.27 4.619c-1.265 1.278-2.858 3.2-2.108 5.139C2.698 51.335 4.017 52 6.111 52c3.882 0 11.318-2.121 21.711-6.17l27.403 5.494l3.552-2.603v-6.387l-1.724 1.179zm-.557-19.255l-6.238 3.653a8 8 0 0 0-.206-1.842zm-13.679-3.44l-.539.975a3.7 3.7 0 0 0-.117-.892zM35.69 38.404l-13.624 6.272l2.469.495C15.17 48.685 9.152 50.2 6.111 50.2c-3.028 0-3.109-1.5-.615-4.02c1.42-1.433 2.259-2.664 2.884-3.75l-.011.019c.813.954 2.003 1.57 3.347 1.57l.022-.002c.086-2.164.444-3.715.731-4.629a4.4 4.4 0 0 1-1.726-.839c-.786.842-1.237 1.764-1.794 2.83c1.178-2.258 1.869-3.861 6.314-5.463c7.062-2.545 27.104-8.379 27.104-8.379l4.795-8.672l.07.155l4.572 1.139L50 28.905l-1.237.348c-.093-.112-.195-.172-.308-.158c-2.243.294-6.317 1.62-8.327 3.69c-.414.426-.889 1.005-.889 2.246c0 .338.032.655.085.944c-.886 1.055-1.605 2.122-2.299 3.024zM8.668 41.912l.044-.083q-.02.042-.044.083'/%3E%3C/svg%3E");
}

.pepicons-pencil--train {
  display: inline-block;
  width: 50px;
  height: 50px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cg fill='%23ff65bc'%3E%3Cpath fill-rule='evenodd' d='M17 4.5A3.5 3.5 0 0 0 13.5 1h-7A3.5 3.5 0 0 0 3 4.5v6.955A3.5 3.5 0 0 0 5.465 14.8a15.3 15.3 0 0 0 4.535.7a15.3 15.3 0 0 0 4.535-.701A3.5 3.5 0 0 0 17 11.455zM4 11.455V4.5A2.5 2.5 0 0 1 6.5 2h7A2.5 2.5 0 0 1 16 4.5v6.955a2.5 2.5 0 0 1-1.76 2.389A14.3 14.3 0 0 1 10 14.5a14.3 14.3 0 0 1-4.24-.656A2.5 2.5 0 0 1 4 11.455' clip-rule='evenodd'/%3E%3Cpath fill-rule='evenodd' d='M6.5 13a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3m0-2a.5.5 0 1 1 0 1a.5.5 0 0 1 0-1m7 2a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3m0-2a.5.5 0 1 1 0 1a.5.5 0 0 1 0-1' clip-rule='evenodd'/%3E%3Cpath d='M15.532 18.676a.5.5 0 0 0 .936-.351l-1.5-4a.5.5 0 0 0-.936.35zm-10-4.351a.5.5 0 1 1 .936.35l-1.5 4a.5.5 0 0 1-.936-.35z'/%3E%3Cpath fill-rule='evenodd' d='M15 5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2.565a2 2 0 0 0 1.444 1.921Q8.221 10 10 10t3.556-.514A2 2 0 0 0 15 7.565zM6 7.565V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2.565a1 1 0 0 1-.722.96A11.8 11.8 0 0 1 10 9q-1.637 0-3.278-.474A1 1 0 0 1 6 7.565' clip-rule='evenodd'/%3E%3Cpath d='M5.25 17.5a.5.5 0 0 1 0-1h10a.5.5 0 0 1 0 1z'/%3E%3C/g%3E%3C/svg%3E");
}

.mdi--charity {
  display: inline-block;
  width: 50px;
  height: 50px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23ff65bc' d='M12.75 3.94c1-.72 2.16-1.08 3.47-1.08c.72 0 1.51.19 2.37.59q1.29.585 2.04 1.38c1.03 1.28 1.46 2.77 1.31 4.47c-.16 1.7-.72 3.03-1.69 3.97l-7.59 7.59c-.19.19-.43.28-.71.28s-.51-.09-.7-.28a.94.94 0 0 1-.28-.7c0-.28.09-.52.28-.71l4.59-4.59c.25-.22.25-.45 0-.7s-.48-.25-.7 0l-4.59 4.59a.95.95 0 0 1-.71.28c-.28 0-.51-.09-.7-.28a.94.94 0 0 1-.28-.7c0-.28.09-.52.28-.71l4.59-4.59q.405-.375 0-.75c-.23-.25-.45-.25-.7 0l-4.59 4.64a.98.98 0 0 1-.71.28c-.28 0-.52-.09-.73-.28c-.2-.19-.3-.42-.3-.7q0-.42.33-.75l4.6-4.6c.25-.25.25-.48 0-.7s-.49-.22-.71 0L6.28 14.5c-.22.2-.45.31-.7.31c-.28 0-.52-.1-.7-.31c-.19-.2-.29-.44-.29-.72s.1-.51.29-.7C7.94 10 9.83 8.14 10.55 7.45l3.56 3.52c.39.37.84.56 1.39.56c.7 0 1.25-.28 1.66-.84c.28-.41.38-.86.3-1.36s-.29-.92-.63-1.27zm2.06 6.33L10.55 6l-7.08 7.08c-.84-.85-1.32-2.15-1.43-3.92c-.11-1.76.37-3.29 1.43-4.57c1.19-1.18 2.61-1.78 4.26-1.78c1.66 0 3.07.6 4.22 1.78l4.27 4.27c.19.19.28.42.28.7s-.09.52-.28.71c-.19.18-.42.28-.72.28c-.27 0-.5-.1-.69-.28'/%3E%3C/svg%3E");
}

.basil--other-1-outline {
  display: inline-block;
  width: 50px;
  height: 50px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23ff65bc' d='M6 10.5a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3m4.5 1.5a1.5 1.5 0 1 1 3 0a1.5 1.5 0 0 1-3 0m6 0a1.5 1.5 0 1 1 3 0a1.5 1.5 0 0 1-3 0'/%3E%3C/svg%3E");
}

.balance-button, .budget-button,.record-button {
  --background: #FFD6E5;
  --color: #000;
  font-size: 30px;
  width: 100%;
  height: 100px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  justify-content: center;
  padding: 10px;
}

/* Custom Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  text-align: center;
}

.modal-buttons {
  margin-top: 20px;
  display: flex;
  justify-content: space-around;
}

.budget-input {
  margin-top: 10px;
}

ion-button {
  --background: #FFC2D1;
  --background-activated: #ffadb9;
  --background-focused: #ffadb9;
  --background-hover: #ffadb9;
  --background-pressed: #ffadb9;
  --color: black;
}
</style>