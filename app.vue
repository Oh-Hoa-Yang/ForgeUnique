<template>
  <ion-app>
    <!-- Main router outlet for all page content, with correct content ID -->
    <ion-router-outlet></ion-router-outlet>
    <UNotifications />
  </ion-app>
</template>

<script setup>
import { App } from '@capacitor/app';
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const router = useRouter();

App.addListener('appUrlOpen', (event) => {
  const url = new URL(event.url);
  console.log('Deep link received:', url.href);

  if (url.protocol === 'forgeunique:') {
    if (url.host === 'reset-password') {
      // Parse query fragments to check for errors
      const params = new URLSearchParams(url.search);
      const error = params.get('error_code');
      const errorDescription = params.get('error_description');

      if (error) {
        console.error(`Error: ${error} - ${errorDescription}`);
        // Show error message to user, navigate to fallback page, etc.
        alert(`Error resetting password: ${errorDescription}`);
      } else {
        console.log('Navigating to /reset-password');
        router.push('/reset-password');
      }
    } else if (url.host === 'login') {
      console.log('Navigating to /login');
      router.push('/login');
    } else {
      console.warn('Unhandled deep link:', url);
    }
  } else {
    console.warn('Unknown protocol:', url.protocol);
  }
});




// App.addListener('appUrlOpen', (event) => {
//   const url = new URL(event.url);

//   //Check if the URL scheme matches your custom URL schema 
//   if (url.protocol === 'forgeunique:') {
//     if (url.host === 'login') {
//       //Hanle the login flow
//       console.log('Navigating to login page...');
//       router.push('login');
//     }
//   }
// })

// Reactive shared state
const appState = reactive({
  budget: 0,
  monthlyExpense: 0,
  todayExpense: 0,
});

// Fetch data function
const fetchData = async () => {
  if (!user.value) return;

  try {
    await fetchBudget();
    // Fetch budget
    const { data: userData } = await supabase
      .from('Users')
      .select('budget')
      .eq('user_id', user.value.id)
      .single();

    appState.budget = userData?.budget || 0;

    // Fetch expenses
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const todayDate = currentDate.toISOString().split('T')[0];

    const { data: expenses } = await supabase
      .from('Expenses')
      .select('expenseAmount, expenseDate')
      .eq('user_id', user.value.id);

    if (expenses) {
      appState.monthlyExpense = expenses
        .filter((expense) => {
          const expenseDate = new Date(expense.expenseDate);
          return (
            expenseDate.getFullYear() === currentYear &&
            expenseDate.getMonth() + 1 === currentMonth
          );
        }) 
        .reduce((sum, expense) => sum + expense.expenseAmount, 0);

      appState.todayExpense = expenses
        .filter((expense) => expense.expenseDate === todayDate)
        .reduce((sum, expense) => sum + expense.expenseAmount, 0);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

const fetchBudget = async () => {
  if (!user.value) return;

  try {
    const { data, error } = await supabase
      .from('Users')
      .select('budget')
      .eq('user_id', user.value.id)
      .single();

    if (error) throw error;

    appState.budget = data?.budget || 0;
  } catch (err) {
    console.error('Error fetching budget:', err.message);
  }
};


// Fetch data on mount
onMounted(fetchData);

// Provide the reactive state
provide('appState', appState);
</script>

<!-- <script setup>
const supabase = useSupabaseClient();
const user = useSupabaseUser();

// Reactive shared state
const appState = reactive({
  budget: 0,
  monthlyExpense: 0,
  todayExpense: 0,
});

// Fetch data function
const fetchData = async () => {
  if (!user.value) return;

  try {
    // await fetchBudget();
    // Fetch budget
    const { data: userData } = await supabase
      .from('Users')
      .select('budget')
      .eq('user_id', user.value.id)
      .single();

    appState.budget = userData?.budget || 0;

    // Fetch expenses
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const todayDate = currentDate.toISOString().split('T')[0];

    const { data: expenses } = await supabase
      .from('Expenses')
      .select('expenseAmount, expenseDate')
      .eq('user_id', user.value.id);

    if (expenses) {
      appState.monthlyExpense = expenses
        .filter((expense) => {
          const expenseDate = new Date(expense.expenseDate);
          return (
            expenseDate.getFullYear() === currentYear &&
            expenseDate.getMonth() + 1 === currentMonth
          );
        }) 
        .reduce((sum, expense) => sum + expense.expenseAmount, 0);

      appState.todayExpense = expenses
        .filter((expense) => expense.expenseDate === todayDate)
        .reduce((sum, expense) => sum + expense.expenseAmount, 0);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

// const fetchBudget = async () => {
//   if (!user.value) return;

//   try {
//     const { data, error } = await supabase
//       .from('Users')
//       .select('budget')
//       .eq('user_id', user.value.id)
//       .single();

//     if (error) throw error;

//     appState.budget = data?.budget || 0;
//   } catch (err) {
//     console.error('Error fetching budget:', err.message);
//   }
// };


// Fetch data on mount
onMounted(fetchData);

// Provide the reactive state
provide('appState', appState);
provide('refreshData', fetchData); -->


