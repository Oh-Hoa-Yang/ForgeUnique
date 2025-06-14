<template>
  <ion-page id="main-content">
    <div class="custom-background h-full">
      <div class="container mx-auto">
        <ion-card class="expense-card mx-4">
          <div class="flex justify-between items-center mb-4">
            <button fill="clear" @click="goBack" class="mr-2" style="min-width: 0; --padding-start: 0; --padding-end: 0;">
              <span class="lets-icons--back"></span>
            </button>
            <div>
              <h1 style="text-align: center; font-weight: bold; color: black;" class="mb-6 flex-1">Analytics Report</h1>
            </div>
            <div class="opacity-0">Hidden</div>
          </div>

          <!-- Year and Month Selectors -->
          <div style="margin-top: 20px; display: flex; justify-content: space-between; align-items: center;">
            <select v-model="selectedYear" @change="updateFilteredData" class="year-selector">
              <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
            </select>
            <select v-model="selectedMonth" @change="updateFilteredData" class="month-selector">
              <option v-for="(month, idx) in months" :key="idx" :value="idx + 1">{{ month }}</option>
            </select>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {{ error }}
            <div v-if="errorDetails" class="text-xs text-red-500 mt-2">{{ errorDetails }}</div>
          </div>

          <!-- Content -->
          <div v-else class="bg-white rounded-lg shadow-lg mb-6">
            <h2 class="text-xl font-semibold mb-4 text-center">Expenses by Category</h2>
            <!-- No Data State -->
            <div v-if="!hasData" class="text-center py-8 text-gray-500">
              No expense data available for this month.
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Pie Chart -->
              <div>
                <ClientOnly>
                  <apexchart
                    v-if="series.length > 0"
                    type="pie"
                    height="350"
                    :options="chartOptions"
                    :series="series"
                  />
                </ClientOnly>
              </div>
              <!-- Category Details -->
              <div class="space-y-4">
                <div v-for="(category, index) in categoryData" :key="index" class="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div class="flex items-center">
                    <div class="w-4 h-4 rounded-full mr-2" :style="{ backgroundColor: chartOptions.colors[index % chartOptions.colors.length] }"></div>
                    <span class="font-medium">{{ category.name }}</span>
                  </div>
                  <div class="text-right">
                    <div class="font-semibold">RM{{ isNaN(category.amount) ? '0.00' : category.amount.toFixed(2) }}</div>
                    <div class="text-sm text-gray-600">{{ isNaN(category.percentage) ? '0' : category.percentage }}%</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Details Table -->
            <div v-if="filteredExpenses.length > 0" class="mt-8 overflow-x-auto">
              <h3 class="text-lg font-semibold mb-2">Detailed Expenses</h3>
              <table class="min-w-full bg-white border border-gray-200 rounded">
                <thead>
                  <tr>
                    <th class="px-4 py-2 border-b">Date</th>
                    <th class="px-4 py-2 border-b">Category</th>
                    <th class="px-4 py-2 border-b">Description</th>
                    <th class="px-4 py-2 border-b">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="expense in filteredExpenses" :key="expense.id">
                    <td class="px-4 py-2 border-b">{{ formatDate(expense.expenseDate) }}</td>
                    <td class="px-4 py-2 border-b">{{ expense.category }}</td>
                    <td class="px-4 py-2 border-b">{{ expense.expenseDescription }}</td>
                    <td class="px-4 py-2 border-b">RM{{ Number(expense.expenseAmount).toFixed(2) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </ion-card>
      </div>
    </div>
  </ion-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useSupabaseClient, useSupabaseUser } from '#imports';
import { onIonViewWillEnter } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { arrowBackOutline } from 'ionicons/icons';

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const allExpenses = ref([]);
const filteredExpenses = ref([]);
const series = ref([]);
const categoryData = ref([]);
const loading = ref(true);
const error = ref(null);
const errorDetails = ref(null);

const now = new Date();
const selectedYear = ref(now.getFullYear());
const selectedMonth = ref(now.getMonth() + 1); // JS months are 0-based

// Generate years (e.g., from 2022 to current year)
const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const hasData = computed(() => Array.isArray(series.value) && series.value.length > 0 && series.value.some(v => v > 0));

const chartOptions = {
  chart: {
    type: 'pie',
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
      animateGradually: {
        enabled: true,
        delay: 150
      },
      dynamicAnimation: {
        enabled: true,
        speed: 350
      }
    }
  },
  labels: [],
  colors: ['#FF4560', '#00E396', '#FEB019', '#008FFB', '#775DD0', '#3F51B5', '#1abc9c', '#e67e22', '#9b59b6', '#34495e', '#e84393', '#00b894', '#fdcb6e', '#636e72', '#d35400', '#2d3436'],
  legend: {
    position: 'bottom',
    fontSize: '14px',
    markers: {
      width: 12,
      height: 12,
      radius: 6
    }
  },
  tooltip: {
    y: {
      formatter: (value) => `RM ${value.toFixed(2)}`
    }
  },
  plotOptions: {
    pie: {
      donut: {
        size: '0%'
      }
    }
  },
  responsive: [{
    breakpoint: 480,
    options: {
      chart: {
        width: 200
      },
      legend: {
        position: 'bottom'
      }
    }
  }]
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString();
}

const updateFilteredData = () => {
  // Filter allExpenses for selected year/month
  const filtered = (allExpenses.value || []).filter(expense => {
    const d = new Date(expense.expenseDate);
    return (
      d.getFullYear() === selectedYear.value &&
      d.getMonth() + 1 === selectedMonth.value
    );
  });
  filteredExpenses.value = filtered;

  // Process expenses by category
  const categoryTotals = {};
  let totalAmount = 0;
  filtered.forEach(expense => {
    const category = expense.category || 'Uncategorized';
    const amount = Number(expense.expenseAmount) || 0;
    categoryTotals[category] = (categoryTotals[category] || 0) + amount;
    totalAmount += amount;
  });
  const categories = Object.keys(categoryTotals);
  const amounts = categories.map(category => categoryTotals[category]);
  chartOptions.labels = categories;
  series.value = amounts;
  categoryData.value = categories.map((category, index) => ({
    name: category,
    amount: categoryTotals[category],
    percentage: totalAmount > 0 ? ((categoryTotals[category] / totalAmount) * 100).toFixed(1) : 0
  }));
};

const fetchAllExpenses = async () => {
  loading.value = true;
  error.value = null;
  errorDetails.value = null;
  try {
    if (!user.value) throw new Error('User not logged in');
    const { data: expenses, error: supabaseError } = await supabase
      .from('Expenses')
      .select('*')
      .eq('user_id', user.value.id);
    if (supabaseError) throw supabaseError;
    allExpenses.value = expenses || [];
    updateFilteredData();
  } catch (err) {
    console.error('Error fetching expenses:', err);
    error.value = 'Failed to load expense data. Please try again later.';
    errorDetails.value = err.message || JSON.stringify(err);
  } finally {
    loading.value = false;
  }
};

const router = useRouter();
const goBack = () => router.back();

onMounted(fetchAllExpenses);
onIonViewWillEnter(fetchAllExpenses);
</script>

<style scoped>
.custom-background {
  background: #FFEDF5;
  width: 100%;
  display: flex;
  flex-direction: column;
  height: auto;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  flex: 1;
  box-sizing: border-box;
  overscroll-behavior: contain;
  padding: 20px;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

.expense-card {
  background: white;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.lets-icons--back {
  display: inline-block;
  width: 30px;
  height: 30px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23ff65bc' d='m4 10l-.707.707L2.586 10l.707-.707zm17 8a1 1 0 1 1-2 0zM8.293 15.707l-5-5l1.414-1.414l5 5zm-5-6.414l5-5l1.414 1.414l-5 5zM4 9h10v2H4zm17 7v2h-2v-2zm-7-7a7 7 0 0 1 7 7h-2a5 5 0 0 0-5-5z'/%3E%3C/svg%3E");
}

.year-selector, .month-selector {
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  margin: 0 10px;
  border: 2px solid #ddd;
  background-color: white;
  color: #ff4e68;
}
</style> 