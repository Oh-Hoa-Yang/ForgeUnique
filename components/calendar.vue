<template>
  <ion-content class="custom-background">
    <!-- Pull to refresh component wrapped around ion-content -->
    <PullRefresh v-model="loading" @refresh="handleRefresh" style="background-color: #FFD6E5; color: black; font-weight: bold;" pulling-text="Pull to refresh"
          loosing-text="Release to refresh" loading-text="Loading..." success-text="Refreshed successfully"
          success-duration="500" animation-duration="300" head-height="50">
    <ion-card class="calendar-card">
      <VCalendar color="pink" :attributes="attrs" is-dark="{}" expanded />
      <!-- <VDatePicker class="calendar" v-model="date" /> -->
      <div class="yearly-plan-button">
        <ion-button router-link="/yearlyplanpage">YEARLY PLAN</ion-button>
      </div>
    </ion-card>

    <!-- Monthly Plan Card  PART  --> 
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
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong>{{ index + 1 }}. {{ plan.monthlyDescription }}</strong>
              <div style="display: flex; justify-content: end; align-items: center;">
                <button @click="openEditModal(plan)" style="font-size: 14px; color: #FD8395; ">✏️</button>
                <button @click="deleteMonthlyPlan(plan.id)" style="font-size: 14px; color: #FD8395;">❌</button>
              </div>
            </div>
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

      <!-- Modal for editing existing monthly plan -->
      <div v-if="showEditModal" class="modal-overlay">
        <div class="modal-content">
          <ion-label>Edit Monthly Plan for {{ selectedYear }} - {{ selectedMonth + 1 }}</ion-label>
          <ion-input type="text" v-model="editMonthlyPlanDescription" placeholder="Edit monthly plan description" />
          <div style="text-align: center;">
            <ion-button @click="updateMonthlyPlan">Update</ion-button>
            <ion-button @click="closeEditModal">Cancel</ion-button>
          </div>
        </div>
      </div>
    </ion-card>
    
    
    <!-- IMPROVEMENTS Plan / THING TO BE FOCUS  Card  PART  --> 
   <ion-card style="padding: 20px;">
     <div style="display: flex; justify-content: space-between; align-items: center;">
       <h5 style="font-weight: bold; text-align: center;">IMPROVEMENTS PLAN | THINGS TO BE FOCUSED</h5>
       <button @click="openIModal" style="font-size:24px; padding: 5px 10px; color: #FD8395;">+</button>
     </div>

     <!-- Year and Month Dropdowns -->
     <div style="margin-top: 20px; display: flex; justify-content: space-between; align-items: center;">
       <select v-model="selectedIYear" @change="fetchImprovementPlans" class="year-selector">
         <option v-for="year in IyearsList" :key="year" :value="year">{{ year }}</option>
       </select>
       <select v-model="selectedIMonth" @change="fetchImprovementPlans" class="month-selector">
         <option v-for="(month, index) in ImonthsList" :key="index" :value="index">{{ month }}</option>
       </select>
     </div>

     <!-- Displaying the Monthly Plan Records -->
     <div v-if="improvementPlanData.length > 0" style="padding: 20px;">
       <ol>
         <!-- Loop through monthlyPlanData and display each record with a numbered list -->
         <li v-for="(plan, index) in paginatedImprovements" :key="plan.id" style="margin-bottom: 10px;">
           <div style="display: flex; justify-content: space-between; align-items: center;">
             <strong>{{ index + 1 }}. {{ plan.improvementDescription }}</strong>
             <div style="display: flex; justify-content: end; align-items: center;">
               <button @click="openIEditModal(plan)" style="font-size: 14px; color: #FD8395; ">✏️</button>
               <button @click="deleteImprovementPlan(plan.id)" style="font-size: 14px; color: #FD8395;">❌</button>
             </div>
           </div>
         </li>
       </ol>
       <!-- Pagination -->
       <div style="display: flex; justify-content: space-between;">
         <button @click="previousIPage" :disabled="currentIPage === 1" style="color: #FD8395;">
           <<< </button>
             <span>Page {{ currentIPage }} of {{ totalIPages }}</span>
             <button @click="nextIPage" :disabled="currentIPage === totalIPages" style="color: #FD8395;"> >>> </button>
       </div>
     </div>
     <!-- If no records are found -->
     <div v-else style="margin-top: 20px;">
       <p>No records found for this month. Step 1 to improvement - NOTE DOWN!</p>
     </div>

     <!-- Modal for creating new monthly plan -->
     <div v-if="showIModal" class="modal-overlay">
       <div class="modal-content">
         <ion-label>Create New Improvement Plan for {{ selectedIYear }} - {{ selectedIMonth + 1 }}</ion-label>
         <ion-input type="text" v-model="newImprovementPlanDescription" placeholder="Enter monthly plan description" />
         <div style="text-align: center;">
           <ion-button @click="createImprovementPlan">Create</ion-button>
           <ion-button @click="closeIModal">Cancel</ion-button>
         </div>
       </div>
     </div>

     <!-- Modal for editing existing monthly plan -->
     <div v-if="showIEditModal" class="modal-overlay">
       <div class="modal-content">
         <ion-label>Edit Improvement Plan for {{ selectedIYear }} - {{ selectedIMonth + 1 }}</ion-label>
         <ion-input type="text" v-model="editImprovementPlanDescription" placeholder="Edit monthly plan description" />
         <div style="text-align: center;">
           <ion-button @click="updateImprovementPlan">Update</ion-button>
           <ion-button @click="closeIEditModal">Cancel</ion-button>
         </div>
       </div>
     </div>
   </ion-card>
    

    <!-- Biggest Gain of Previous Month Card --PART--  -->
     <ion-card style="padding: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h5 style="font-weight: bold; text-align: center;">BIGGEST GAIN of PREVIOUS MONTH</h5>
      </div>

       <!-- Year and Month Dropdowns -->
       <div style="margin-top: 20px; display: flex; justify-content: space-between; align-items: center;">
        <select v-model="selectedBYear" @change="fetchBiggestGain" class="year-selector">
          <option v-for="year in ByearsList" :key="year" :value="year">{{ year }}</option>
        </select>
        <select v-model="selectedBMonth" @change="fetchBiggestGain" class="month-selector">
          <option v-for="(month, index) in BmonthsList" :key="index" :value="index">{{ month }}</option>
        </select>
      </div>
      
      <!-- Displaying the Biggest Gain Records -->
      <div v-if="biggestGainData.length > 0" style="padding: 20px;">
        <ol>
          <li v-for="(todo, index) in paginatedGains" :key="todo.id" style="margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong>{{ index + 1 }}. {{ todo.todosDescription }}</strong>
            </div>
          </li>
        </ol>
        <!-- Pagination -->
        <div style="display: flex; justify-content: space-between;">
          <button @click="previousBPage" :disabled="currentBPage === 1" style="color: #FD8395;">
            <<< </button>
              <span>Page {{ currentBPage }} of {{ totalBPages }}</span>
              <button @click="nextBPage" :disabled="currentBPage === totalBPages" style="color: #FD8395;"> >>> </button>
        </div>
      </div>
      <!-- If no records are found -->
      <div v-else style="margin-top: 20px;">
        <p>You have no records found. Escape yourself from comfort zone! Good Luck!</p>
      </div>
     </ion-card>
     <br><br>
    </PullRefresh>
  </ion-content>
</template>

<script setup>
import 'v-calendar/style.css';
import { useAppToast } from '~/composables/useAppToast';
import PullRefresh from 'pull-refresh-vue3';

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

//EDIT Monthly Plan ---- PART ----
const showEditModal = ref(false);
const editMonthlyPlanDescription = ref('');
const currentEditPlanId = ref(null);

//Open modal for Edit
const openEditModal = (plan) => {
  editMonthlyPlanDescription.value = plan.monthlyDescription;
  currentEditPlanId.value = plan.id;
  showEditModal.value = true;
};

//Close modal of Edit
const closeEditModal = () => {
  showEditModal.value = false;
  editMonthlyPlanDescription.value = ''; //Reset the description field
  currentEditPlanId.value = null; //Reset the plan ID
};

//Update the monthly plan ----EDIT
const updateMonthlyPlan = async () => {
  if (!editMonthlyPlanDescription.value) {
    toastError({title:'Error', description:'Please enter a description'});
    return;
  }

  try {
    const { data, error } = await supabase 
    .from('MonthlyPlans')
    .update({ monthlyDescription: editMonthlyPlanDescription.value })
    .eq('id', currentEditPlanId.value)
    .eq('user_id', user.value.id)

    if (error) {
      console.error('Error updating monthly plan:', error);
      toastError({title:'Error', description:'Failed to update the plan'});
    } else {
      toastSuccess({title:'Success',description:'Monthly plan updated'});
      fetchMonthlyPlans();
      closeEditModal();
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    toastError({title:'Error', description:'An unexpected error occurred'});
  }
};

//DELETE existing monthly plan ---- DELETE -----
const deleteMonthlyPlan = async (planId) => {
  try {
    const { data, error } = await supabase
      .from('MonthlyPlans')
      .delete()
      .eq('id', planId)
      .eq('user_id', user.value.id);

    if (error) {
      console.error('Error deleting monthly plan:', error);
      toastError({ title: 'Error', description: 'Failed to delete the plan' });
    } else {
      toastSuccess({ title: 'Success', description: 'Monthly plan deleted' });
      fetchMonthlyPlans(); // Fetch updated plans after deletion
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    toastError({ title: 'Error', description: 'An unexpected error occurred' });
  }
};


//BIGGEST GAIN 
//PAGINATION
const currentBPage = ref(1);
const itemsBPerPage = 5;
const totalBPages = ref(1);

//DECLARE
const selectedBYear = ref(new Date().getFullYear()); 
const selectedBMonth = ref(new Date().getMonth() - 1);
const ByearsList = ref([]);
const BmonthsList = ref([
   'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]);

const biggestGainData = ref([]);

// Fetch available years for selection (from 2020 to the current year)
onMounted(() => {
  const currentYear = new Date().getFullYear();
  ByearsList.value = Array.from({ length: currentYear - 2019 }, (_, index) => 2020 + index);

  // Set default selected year and previous month
  selectedBYear.value = currentYear;
  selectedBMonth.value = new Date().getMonth() - 1;
  fetchBiggestGain();
});

// Function to calculate previous month and fetch data
const fetchBiggestGain = async () => {
  //Check if the year and month are set (customize)
  const year = selectedBYear.value;
  const month = selectedBMonth.value;

  console.log(`Fetching data for ${year} - ${month + 1}`);

  // const lastMonth = new Date();
  // lastMonth.setMonth(lastMonth.getMonth() - 1); // Get the last month
  // selectedBYear.value = lastMonth.getFullYear();
  // selectedBMonth.value = lastMonth.getMonth(); // Set selected month to previous month

  try {
    const { data, error } = await supabase
      .from('ToDoLists')
      .select('*')
      .eq('todosStatus', 'completed')
      .eq('user_id', user.value.id);

    if (error) {
      console.error('Error fetching biggest gain todos:', error);
      toastError({ title: 'Error', description: 'Failed to fetch data' });
    } else {
      // Adjust the completed_at date by adding 8 hours to match the local timezone
      const localTodos = data.map(todo => {
        const completedAtLocal = new Date(todo.completed_at).setHours(new Date(todo.completed_at).getHours() + 8);
        todo.completed_at_local = new Date(completedAtLocal); // Store adjusted date
        return todo;
      });

      biggestGainData.value = localTodos.filter(todo => {
        const completedDate = new Date(todo.completed_at_local);
        const isSameYear = completedDate.getFullYear() === selectedBYear.value;
        const isSameMonth = completedDate.getMonth() === selectedBMonth.value;
        return isSameYear && isSameMonth;
      })

      totalBPages.value = Math.ceil(biggestGainData.value.length / itemsBPerPage); // Pagination
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    toastError({ title: 'Error', description: 'An unexpected error occurred' });
  }
};

// Pagination
const paginatedGains = computed(() => {
  const start = (currentBPage.value - 1) * itemsBPerPage;
  const end = start + itemsBPerPage;
  return biggestGainData.value.slice(start, end);
});

const previousBPage = () => {
  if (currentBPage.value > 1) {
    currentBPage.value--;
  }
};
const nextBPage = () => {
  if (currentBPage.value < totalBPages.value) {
    currentBPage.value++;
  }
};

//IMPROVEMENT PLANSSS | THING TO BE FOCUSED   -- PART --
//pagination declare
const currentIPage = ref(1);
const itemsIPerPage = 5;
const totalIPages = ref(1);

//Monhtly Plans Section
const selectedIYear = ref(new Date().getFullYear()); // Default to current year
const selectedIMonth = ref(new Date().getMonth()); // Default to current month
const IyearsList = ref([]);
const ImonthsList = ref([
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]);
const improvementPlanData = ref([]);

// Fetch available years for selection (from 2020 to the current year)
onMounted(() => {
  const currentYear = new Date().getFullYear();
  IyearsList.value = Array.from({ length: currentYear - 2019 }, (_, index) => 2020 + index);
  fetchImprovementPlans();
});

// Fetch monthly plans based on selected year and month
const fetchImprovementPlans = async () => {
  console.log(`Fetching data for ${selectedIYear.value}-${selectedIMonth.value + 1}`);
  try {
    const { data, error, count } = await supabase
      .from('ImprovementPlans')
      .select('*', { count: 'exact' })
      .eq('year', selectedIYear.value)
      .eq('month', selectedIMonth.value + 1)// Fix the 0-based index of months
      .eq('user_id', user.value.id)

    if (error) {
      console.error('Error fetching monthly plans:', error);
    } else {
      improvementPlanData.value = data;
      totalIPages.value = Math.ceil(count / itemsIPerPage); //Calc totalPages for paginate
    }
  } catch (err) {
    console.error('Error fetching monthly plans:', err);
  }
};

//Pagination
const paginatedImprovements = computed(() => {
  const start = (currentIPage.value - 1) * itemsIPerPage;
  const end = start + itemsIPerPage;
  return improvementPlanData.value.slice(start, end);
});

const previousIPage = () => {
  if (currentIPage.value > 1) {
    currentIPage.value--;
  }
};
const nextIPage = () => {
  if (currentIPage.value < totalIPages.value) {
    currentIPage.value++;
  }
};

const showIModal = ref(false);
const newImprovementPlanDescription = ref(''); //Holds the new monthky plan desc
// Open modal to add a new record
const openIModal = () => {
  console.log(`Open modal to add new record for: ${selectedYear.value} ${selectedMonth.value + 1}`);
  showIModal.value = true;
};
//Close the modal 
const closeIModal = () => {
  showIModal.value = false;
  newImprovementPlanDescription.value = '';
};

//CREATE new monthly plan
const createImprovementPlan = async () => {
  if (!newImprovementPlanDescription.value) {
    toastError({ title: 'Error', description: 'Please enter a description' });
    return;
  }

  if (!user.value || !user.value.id) {
    toastError({ title: 'Error', description: 'User not authenticated' });
    return;
  }


  try {
    console.log(`Creating monthly plan: ${newImprovementPlanDescription.value}`);
    console.log("Plan Description:", newImprovementPlanDescription.value);

    const { data, error } = await supabase
      .from('ImprovementPlans')
      .insert([{
        improvementDescription: newImprovementPlanDescription.value,
        year: selectedYear.value,
        month: selectedMonth.value + 1,
        user_id: user.value.id
      }])

    if (error) {
      console.error("Error creating monthly plan:", error);
      toastError({ title: 'Error', description: 'Failed to create monthly plan' });
    } else {
      toastSuccess({ title: 'Success', description: 'Created the new monthly plan' });
      fetchImprovementPlans(); // Fetch the updated data immediately
      closeIModal(); // Close the modal after successful creation
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    toastError({ title: 'Error', description: 'An unexpected error occurred' });
  }
};

//EDIT Monthly Plan ---- PART ----
const showIEditModal = ref(false);
const editImprovementPlanDescription = ref('');
const currentIEditPlanId = ref(null);

//Open modal for Edit
const openIEditModal = (plan) => {
  editImprovementPlanDescription.value = plan.improvementDescription;
  currentIEditPlanId.value = plan.id;
  showIEditModal.value = true;
};

//Close modal of Edit
const closeIEditModal = () => {
  showIEditModal.value = false;
  editImprovementPlanDescription.value = ''; //Reset the description field
  currentIEditPlanId.value = null; //Reset the plan ID
};

//Update the monthly plan ----EDIT
const updateImprovementPlan = async () => {
  if (!editImprovementPlanDescription.value) {
    toastError({title:'Error', description:'Please enter a description'});
    return;
  }

  try {
    const { data, error } = await supabase 
    .from('ImprovementPlans')
    .update({ improvementDescription: editImprovementPlanDescription.value })
    .eq('id', currentIEditPlanId.value)
    .eq('user_id', user.value.id)

    if (error) {
      console.error('Error updating monthly plan:', error);
      toastError({title:'Error', description:'Failed to update the plan'});
    } else {
      toastSuccess({title:'Success',description:'Monthly plan updated'});
      fetchImprovementPlans();
      closeIEditModal();
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    toastError({title:'Error', description:'An unexpected error occurred'});
  }
};

//DELETE existing monthly plan ---- DELETE -----
const deleteImprovementPlan = async (planId) => {
  try {
    const { data, error } = await supabase
      .from('ImprovementPlans')
      .delete()
      .eq('id', planId)
      .eq('user_id', user.value.id);

    if (error) {
      console.error('Error deleting monthly plan:', error);
      toastError({ title: 'Error', description: 'Failed to delete the plan' });
    } else {
      toastSuccess({ title: 'Success', description: 'Monthly plan deleted' });
      fetchImprovementPlans(); // Fetch updated plans after deletion
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    toastError({ title: 'Error', description: 'An unexpected error occurred' });
  }
};


</script>

<style scoped>
.custom-background {
  --background: #FFEDF5;
  /* height: 100000000000000000000px; */
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

ion-card

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
