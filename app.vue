<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
// import { SplashScreen } from '@capacitor/splash-screen';
// import { App } from '@capacitor/app';
import Header from '~/components/header.vue';
import Footer from '~/components/footer.vue';

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const router = useRouter();
const route = useRoute();

setTimeout(() => {
  SplashScreen.hide();
}, 3000);

// App.addListener('appUrlOpen', (event) => {
//   try {
//     const url = new URL(event.url);
//     console.log('Deep link received:', url.href);

//     if (url.protocol === 'forgeunique:' && url.host === 'login') {
//       const params = new URLSearchParams(url.search);
//       const type = params.get('type');

//       if (type === 'signup') {
//         console.log('Signup confirmation detected. Navigating to /login...');
//         router.push('/login');
//       } else {
//         console.warn('Unhandled deep link type:', type);
//       }
//     } else {
//       console.warn('Unhandled deep link:', url);
//     }
//   } catch (error) {
//     console.error('Error processing deep link:', error);
//   }
// });


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

<style>
/* Global styles */
html, body {
  overflow: hidden;
}

.ion-page {
  overflow: hidden;
}

ion-content {
  --overflow: hidden;
}

.scroll-y {
  overflow: hidden !important;
}
</style>

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
