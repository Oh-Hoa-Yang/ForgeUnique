<template>
  <!-- Main Page with Content -->
  <ion-page id="main-content">
    <!-- Header Component -->
    <Header />

    <!-- Main Content (imported component) -->
    <ion-content class="custom-background">
      <ion-card class="page-card">
        <div class="top-row-container">
          <button @click="navBackExpenseHome">
            <span class="lets-icons--back"></span>
          </button>
          <h1 style="font-size: 25px;">
            <b>EXPENSE RECORDS</b>
          </h1>
          <div></div>
        </div>

        <!-- Total Expense Button  -->
        <div style="display: flex; justify-content: center;">
          <ion-button class="balance-button" disabled="true">
            Balance ({{ monthlyExpense }})
          </ion-button>
        </div>

        <!-- Search -->
        <div style="display: flex; justify-content: center; padding: 10px;">
          <ion-item style="--background: #FFD6E5;">
            <ion-label><span class="ic--sharp-search"></span></ion-label>
            <ion-input class="input-field" type="text" v-model="searchQuery"
              placeholder="Search by records description"></ion-input>
          </ion-item>
        </div>

      </ion-card>
    </ion-content>

    <!-- Footer Component -->
    <Footer :current-route="route.path" />
  </ion-page>
</template>

<script setup>
import Header from '~/components/header.vue';
import Footer from '~/components/footer.vue';
import { useRoute } from 'vue-router';

definePageMeta({
  middleware: 'auth'
})

const route = useRoute();
const supabase = useSupabaseClient();
const user = useSupabaseUser();

const appState = inject('appState');
if (!appState) {
  console.err('Failed to inject appState. Ensure App.vue provides it.');
}

const fetchExpenses = async () => {
  if (!user.value) return;

  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based

    const { data: expenses, error } = await supabase
      .from('Expenses')
      .select('expenseAmount, expenseDate')
      .eq('user_id', user.value.id);

    if (error) throw error;

    let fetchedMonthlyExpense = 0;

    if (expenses) {
      fetchedMonthlyExpense = expenses
        .filter((expense) => {
          const expenseDate = new Date(expense.expenseDate);
          return (
            expenseDate.getFullYear() === currentYear &&
            expenseDate.getMonth() + 1 === currentMonth
          );
        })
        .reduce((sum, expense) => sum + expense.expenseAmount, 0);
    }

    appState.monthlyExpense = fetchedMonthlyExpense;

    return { monthlyExpense: fetchedMonthlyExpense };
  } catch (err) {
    console.error('Error fetching expenses from Supabase:', err.message);
    return { monthlyExpense: 0 };
  }
};

// Reactive state for expenses
const monthlyExpense = computed(() => {
  if (appState.monthlyExpense === 0) {
    fetchExpenses().then(({ monthlyExpense }) => {
      appState.monthlyExpense = monthlyExpense; // Update appState after manual fetch
    });
  }
  return appState.monthlyExpense;
});

</script>

<style scoped>
.custom-background {
  --background: #FFEDF5;
  /* height: 10000000px; */
}

.page-card {
  align-items: center;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  background-color: white;
  /* Ensure card background color is visible */
}

.top-row-container {
  padding: 20px;
  display: flex;
  justify-content: space-between;
}

.lets-icons--back {
  display: inline-block;
  width: 30px;
  height: 30px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23ff65bc' d='m4 10l-.707.707L2.586 10l.707-.707zm17 8a1 1 0 1 1-2 0zM8.293 15.707l-5-5l1.414-1.414l5 5zm-5-6.414l5-5l1.414 1.414l-5 5zM4 9h10v2H4zm17 7v2h-2v-2zm-7-7a7 7 0 0 1 7 7h-2a5 5 0 0 0-5-5z'/%3E%3C/svg%3E");
}

.balance-button {
  --background: #FFD6E5;
  --color: #000;
  font-size: 30px;
  height: 50px;
  width: 350px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  justify-content: center;
  padding: 10px;
}

.ic--sharp-search {
  display: inline-block;
  width: 28px;
  height: 28px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23ff65bc' d='M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14'/%3E%3C/svg%3E");
}

/* Input Field Styling */
.input-field {
  border: 1px solid #ccc;
  border-left: none;
  /* Remove the left border for seamless design */
  border-radius: 0 8px 8px 0;
  /* Rounded right corners */
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
  background-color: white;
  font-size: 24px;
  width: 318px;
  --background: #FFD6E5;
  font-style: italic;
}

/* Focus State for Input */
.input-field:focus {
  border-color: #ff65bc;
  outline: none;
}
</style>
