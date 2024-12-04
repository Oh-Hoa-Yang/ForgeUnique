<template>
  <ion-content class="custom-background">
    <ion-card class="calendar-card">
      <VCalendar color="pink" :attributes="attrs" is-dark="{}" expanded />
      <!-- <VDatePicker class="calendar" v-model="date" /> -->
      <div class="yearly-plan-button">
        <ion-button router-link="/yearlyplan">YEARLY PLAN</ion-button>
      </div>
    </ion-card>

    <!-- Monthly Plan Card  -->
    <ion-card style="padding: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h5 style="font-weight: bold; text-align: center;">MONTHLY PLAN</h5>
        <button @click="openModal" style="font-size:24px; padding: 5px 10px; color: #FD8395;">+</button>
      </div>

      <!-- Year and Month Dropdowns -->
      <div style="margin-top: 20px; display: flex; justify-content: space-between; align-items: center;">
        <select v-model="selectedYear" @change="fetchMonthlyPlans" class="year-selector">
          <option v-for="year in yearsList" :key="year" :value="year">{{ year }}</option>
        </select>
        <select v-model="selectedMonth" @change="fetchMonthlyPlans" class="month-selector">
          <option v-for="(month, index) in monthsList" :key="index" :value="index">{{ month }}</option>
        </select>
      </div>

      <!-- Displaying the Monthly Plan Records -->
      <div v-if="monthlyPlanData.length > 0" style="padding: 20px;">
        <ol>
          <!-- Loop through monthlyPlanData and display each record with a numbered list -->
          <li v-for="(plan, index) in paginatedPlans" :key="plan.id" style="margin-bottom: 10px;">
            <p><strong>{{ index + 1 }}. {{ plan.monthlyDescription }}</strong></p>
          </li>
        </ol>
        <!-- Pagination -->
        <div style="display: flex; justify-content: space-between;">
          <button @click="previousPage" :disabled="currentPage === 1" style="color: #FD8395;">
            <<< </button>
              <span>Page {{ currentPage }} of {{ totalPages }}</span>
              <button @click="nextPage" :disabled="currentPage === totalPages" style="color: #FD8395;"> >>> </button>
        </div>
      </div>
      <!-- If no records are found -->
      <div v-else style="margin-top: 20px;">
        <p>No records found for this month.</p>
      </div>


      <!-- Modal for creating new monthly plan -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-content">
          <ion-label>Create New Monthly Plan for {{ selectedYear }} - {{ selectedMonth + 1 }}</ion-label>
          <ion-input type="text" v-model="newMonthlyPlanDescription" placeholder="Enter monthly plan description" />
          <div style="text-align: center;">
            <ion-button @click="createMonthlyPlan">Create</ion-button>
            <ion-button @click="closeModal">Cancel</ion-button>
          </div>
        </div>
      </div>


    </ion-card>


  </ion-content>
</template>

<script setup>
import 'v-calendar/style.css';
import { useAppToast } from '~/composables/useAppToast';

const { toastError, toastSuccess } = useAppToast();

const attrs = ref([
  {
    key: 'today',
    highlight: true,
    dates: new Date(),
  }
]);

// general
const supabase = useSupabaseClient();
const user = useSupabaseUser();



//pagination declare
const currentPage = ref(1);
const itemsPerPage = 5;
const totalPages = ref(1);

//Monhtly Plans Section
const selectedYear = ref(new Date().getFullYear()); // Default to current year
const selectedMonth = ref(new Date().getMonth()); // Default to current month
const yearsList = ref([]);
const monthsList = ref([
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]);
const monthlyPlanData = ref([]);

// Fetch available years for selection (from 2020 to the current year)
onMounted(() => {
  const currentYear = new Date().getFullYear();
  yearsList.value = Array.from({ length: currentYear - 2019 }, (_, index) => 2020 + index);
  fetchMonthlyPlans();
});

// Fetch monthly plans based on selected year and month
const fetchMonthlyPlans = async () => {
  console.log(`Fetching data for ${selectedYear.value}-${selectedMonth.value + 1}`);
  try {
    const { data, error, count } = await supabase
      .from('MonthlyPlans')
      .select('*', { count: 'exact' })
      .eq('year', selectedYear.value)
      .eq('month', selectedMonth.value + 1)// Fix the 0-based index of months
      .eq('user_id', user.value.id)

    if (error) {
      console.error('Error fetching monthly plans:', error);
    } else {
      monthlyPlanData.value = data;
      totalPages.value = Math.ceil(count / itemsPerPage); //Calc totalPages for paginate
    }
  } catch (err) {
    console.error('Error fetching monthly plans:', err);
  }
};

//Pagination
const paginatedPlans = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return monthlyPlanData.value.slice(start, end);
});

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const showModal = ref(false);
const newMonthlyPlanDescription = ref(''); //Holds the new monthky plan desc
// Open modal to add a new record
const openModal = () => {
  console.log(`Open modal to add new record for: ${selectedYear.value} ${selectedMonth.value + 1}`);
  showModal.value = true;
};
//Close the modal 
const closeModal = () => {
  showModal.value = false;
  newMonthlyPlanDescription.value = '';
};

//CREATE new monthly plan
const createMonthlyPlan = async () => {
  if (!newMonthlyPlanDescription.value) {
    toastError({ title: 'Error', description: 'Please enter a description' });
    return;
  }

  if (!user.value || !user.value.id) {
    toastError({ title: 'Error', description: 'User not authenticated' });
    return;
  }


  try {
    console.log(`Creating monthly plan: ${newMonthlyPlanDescription.value}`);
    console.log("Plan Description:", newMonthlyPlanDescription.value);

    const { data, error } = await supabase
      .from('MonthlyPlans')
      .insert([{
        monthlyDescription: newMonthlyPlanDescription.value,
        year: selectedYear.value,
        month: selectedMonth.value + 1,
        user_id: user.value.id
      }])

    if (error) {
      console.error("Error creating monthly plan:", error);
      toastError({ title: 'Error', description: 'Failed to create monthly plan' });
    } else {
      toastSuccess({ title: 'Success', description: 'Created the new monthly plan' });
      fetchMonthlyPlans(); // Fetch the updated data immediately
      closeModal(); // Close the modal after successful creation
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    toastError({ title: 'Error', description: 'An unexpected error occurred' });
  }
};




</script>

<style scoped>
.custom-background {
  --background: #FFEDF5;
}

ion-button {
  --background: #FFC2D1;
  --background-activated: #ffadb9;
  --background-focused: #ffadb9;
  --background-hover: #ffadb9;
  --background-pressed: #ffadb9;
  --color: black;
}

.calendar-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  background-color: white;
  /* Ensure card background color is visible */
}

.yearly-plan-button {
  margin-top: 10px;
  text-align: center;
}

/* Monthly Plan */
.year-selector,
.month-selector {
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  margin: 0 10px;
}


button {
  border: none;
  color: white;
  padding: 10px 20px;
  font-size: 18px;
  border-radius: 5px;
  cursor: pointer;
}

button:focus {
  outline: none;
}

select {
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  border: 2px solid #ddd;
  margin: 0 10px;
  background-color: white;
  color: #ff4e68;
}

/* Modal Overlay */
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
}

/* Modal Content */
.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  text-align: center;
}
</style>
