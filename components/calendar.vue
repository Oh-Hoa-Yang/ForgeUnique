<template>
<div class="custom-background">
  <!-- Pull to refresh component -->
  <!-- <PullRefresh v-model="loading" @refresh="handleRefresh"
      style="background-color: #FFD6E5; color: black; font-weight: bold;" pulling-text="Pull to refresh"
      loosing-text="Release to refresh" loading-text="Loading..." success-text="Refreshed successfully"
      success-duration="500" animation-duration="300" head-height="50"> -->

      <div class="container mx-auto">
        <ion-card>
          <div class="calendar-card h-fit">
            <VCalendar color="pink" :attributes="attrs" is-dark="{}" expanded />
          </div>
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
  
          <!-- Monthly Plan Records -->
          <div v-if="monthlyPlanData.length > 0" style="padding: 20px;">
            <ol>
              <li v-for="(plan, index) in paginatedPlans" :key="plan.id" style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                  <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                    <span>{{ index + 1 }}.</span>
                    <span style="word-break: break-word;">{{ plan.monthlyDescription }}</span>
                  </div>
                  <div style="display: flex; gap: 5px; margin-left: 10px;">
                    <button @click="openEditModal(plan)" style="font-size: 14px; color: #FD8395;"><span class="line-md--edit-twotone"></span></button>
                    <button @click="openMonthlyDeleteConfirmationModal(plan)" style="font-size: 14px; color: #FD8395;"><span class="ic--twotone-delete"></span></button>
                  </div>
                </div>
              </li>
            </ol>
            <!-- Pagination -->
            <div style="display: flex; justify-content: space-between; margin-top: 20px;">
              <button @click="previousPage" :disabled="currentPage === 1" style="color: #FD8395;"><<<</button>
              <span>Page {{ currentPage }} of {{ totalPages }}</span>
              <button @click="nextPage" :disabled="currentPage === totalPages" style="color: #FD8395;">>></button>
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

          <!-- Confirmation Modal for Monthly Plan Delete -->
          <div v-if="showMonthlyDeleteConfirmationModal" class="modal-overlay">
            <div class="modal-content">
              <p>Want to delete this <b>"{{ monthlyPlanToDelete?.monthlyDescription }}"</b> monthly plan?</p>
              <div style="text-align: center; margin-top: 15px;">
                <ion-button @click="confirmMonthlyDelete">Yes</ion-button>
                <ion-button @click="closeMonthlyDeleteConfirmationModal">No</ion-button>
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
  
          <!-- Improvement Plan Records -->
          <div v-if="improvementPlanData.length > 0" style="padding: 20px;">
            <ol>
              <li v-for="(plan, index) in paginatedImprovements" :key="plan.id" style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                  <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                    <span>{{ index + 1 }}.</span>
                    <span style="word-break: break-word;">{{ plan.improvementDescription }}</span>
                  </div>
                  <div style="display: flex; gap: 5px; margin-left: 10px;">
                    <button @click="openIEditModal(plan)" style="font-size: 14px; color: #FD8395;"><span class="line-md--edit-twotone"></span></button>
                    <button @click="openImprovementDeleteConfirmationModal(plan)" style="font-size: 14px; color: #FD8395;"><span class="ic--twotone-delete"></span></button>
                  </div>
                </div>
              </li>
            </ol>
            <!-- Pagination -->
            <div style="display: flex; justify-content: space-between; margin-top: 20px;">
              <button @click="previousIPage" :disabled="currentIPage === 1" style="color: #FD8395;"><<<</button>
              <span>Page {{ currentIPage }} of {{ totalIPages }}</span>
              <button @click="nextIPage" :disabled="currentIPage === totalIPages" style="color: #FD8395;">>></button>
            </div>
          </div>
          <!-- If no records are found -->
          <div v-else style="margin-top: 20px;">
            <p>No records found for this month. Step 1 to improvement - NOTE DOWN!</p>
          </div>
  
          <!-- Modal for creating new improvement plan -->
          <div v-if="showIModal" class="modal-overlay">
            <div class="modal-content">
              <ion-label>Create New Improvement Plan for {{ selectedIYear }} - {{ selectedIMonth + 1 }}</ion-label>
              <ion-input type="text" v-model="newImprovementPlanDescription"
                placeholder="Enter improvement plan description" />
              <div style="text-align: center;">
                <ion-button @click="createImprovementPlan">Create</ion-button>
                <ion-button @click="closeIModal">Cancel</ion-button>
              </div>
            </div>
          </div>
  
          <!-- Modal for editing existing improvement plan -->
          <div v-if="showIEditModal" class="modal-overlay">
            <div class="modal-content">
              <ion-label>Edit Improvement Plan for {{ selectedIYear }} - {{ selectedIMonth + 1 }}</ion-label>
              <ion-input type="text" v-model="editImprovementPlanDescription"
                placeholder="Edit improvement plan description" />
              <div style="text-align: center;">
                <ion-button @click="updateImprovementPlan">Update</ion-button>
                <ion-button @click="closeIEditModal">Cancel</ion-button>
              </div>
            </div>
          </div>

          <!-- Confirmation Modal for Improvement Plan Delete -->
          <div v-if="showImprovementDeleteConfirmationModal" class="modal-overlay">
            <div class="modal-content">
              <p>Want to delete this <b>"{{ improvementPlanToDelete?.improvementDescription }}"</b> improvement plan?</p>
              <div style="text-align: center; margin-top: 15px;">
                <ion-button @click="confirmImprovementDelete">Yes</ion-button>
                <ion-button @click="closeImprovementDeleteConfirmationModal">No</ion-button>
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
  
          <!-- Biggest Gain Records -->
          <div v-if="biggestGainData.length > 0" style="padding: 20px;">
            <ol>
              <li v-for="(todo, index) in paginatedGains" :key="todo.id" style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                  <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                    <span>{{ index + 1 }}.</span>
                    <span style="word-break: break-word;">{{ todo.todosDescription }}</span>
                  </div>
                </div>
              </li>
            </ol>
            <!-- Pagination -->
            <div style="display: flex; justify-content: space-between; margin-top: 20px;">
              <button @click="previousBPage" :disabled="currentBPage === 1" style="color: #FD8395;"><<<</button>
              <span>Page {{ currentBPage }} of {{ totalBPages }}</span>
              <button @click="nextBPage" :disabled="currentBPage === totalBPages" style="color: #FD8395;">>></button>
            </div>
          </div>
          <!-- If no records are found -->
          <div v-else style="margin-top: 20px;">
            <p>You have no records found. Escape yourself from comfort zone! Good Luck!</p>
          </div>
        </ion-card>
      </div>
    <!-- </PullRefresh> -->
  </div>
</template>

<script setup>
import 'v-calendar/style.css';
import { useAppToast } from '~/composables/useAppToast';
import { onIonViewWillEnter } from '@ionic/vue';

const { toastError, toastSuccess } = useAppToast();

const loading = ref(false);
// const handleRefresh = async () => {
//   try {
//     loading.value = true; // Start loading
//     await fetchBiggestGain(); // Fetch the biggest gain data
//     await fetchImprovementPlans();
//     await fetchMonthlyPlans();
//   } catch (error) {
//     console.error('Refresh error:', error);
//     toastError({ title: 'Error', description: 'Failed to refresh data.' });
//   } finally {
//     loading.value = false; // Stop loading
//   }
// };

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
  yearsList.value = Array.from({ length: currentYear+3 - 2019 }, (_, index) => 2020 + index);
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

//EDIT Improvement Plan ---- PART ----
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
    toastError({ title: 'Error', description: 'Please enter a description' });
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
      toastError({ title: 'Error', description: 'Failed to update the plan' });
    } else {
      toastSuccess({ title: 'Success', description: 'Monthly plan updated' });
      fetchMonthlyPlans();
      closeEditModal();
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    toastError({ title: 'Error', description: 'An unexpected error occurred' });
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
const selectedBYear = ref(new Date().getMonth() === 0 ? new Date().getFullYear() - 1 : new Date().getFullYear());
const selectedBMonth = ref(new Date().getMonth() === 0 ? 11 : new Date().getMonth() - 1);

const ByearsList = ref(Array.from({ length: new Date().getFullYear() - 2019 }, (_, index) => 2020 + index));
const BmonthsList = ref([
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]);

const biggestGainData = ref([]);

// Fetch available years for selection (from 2020 to the current year)
onMounted(() => {
  // const currentYear = new Date().getFullYear();
  // ByearsList.value = Array.from({ length: currentYear - 2019 }, (_, index) => 2020 + index);

  // Set default selected year and previous month
  // selectedBMonth.value = new Date().getMonth() === 0 ? 11 : new Date().getMonth() - 1;
  // selectedBYear.value = new Date().getMonth() === 0 ? currentYear - 1 : currentYear;

  fetchBiggestGain();
});

// Function to calculate previous month and fetch data
const fetchBiggestGain = async () => {
  //Check if the year and month are set (customize)
  // const year = selectedBYear.value;
  // const month = selectedBMonth.value;

  console.log(`Fetching data for ${selectedBYear.value} - ${selectedBMonth.value + 1}`);

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

    if (error || !data) {
      biggestGainData.value = [];
      console.error('Error fetching biggest gain todos:', error);
      toastError({ title: 'Error', description: 'Failed to fetch data' });
      return;
    }
    // Adjust timestampts to local timezone
    const filteredData = data.filter(todo => {
      const completedDate = new Date(todo.completed_at);
      const localDate = new Date(completedDate.getTime() - completedDate.getTimezoneOffset() * 60000);
      //completedDate.getTime() - completedDate.getTimezoneOffset() * 60000
      //The offset (in minutes) is converted to milliseconds by multiplying by 60000 (1 minute = 60000 milliseconds).
      // Subtracting the offset from the UTC time effectively shifts the timestamp to the user's local timezone.
      return (
        localDate.getFullYear() === selectedBYear.value &&
        localDate.getMonth() === selectedBMonth.value
      );
    });


    biggestGainData.value = filteredData;
    totalBPages.value = Math.ceil(filteredData.length / itemsBPerPage);
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
  IyearsList.value = Array.from({ length: currentYear+3 - 2019 }, (_, index) => 2020 + index);
  fetchImprovementPlans();
});

// Fetch improvement plans based on selected year and month
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
      console.error('Error fetching improvement plans:', error);
      toastError({ title: 'Error', description: 'Failed to fetch improvement plans' });
    } else {
      improvementPlanData.value = data;
      totalIPages.value = Math.ceil(count / itemsIPerPage); //Calc totalPages for paginate
    }
  } catch (err) {
    console.error('Error fetching improvement plans:', err);
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

//CREATE new improvement plan
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
    console.log(`Creating improvement plan: ${newImprovementPlanDescription.value}`);
    console.log("Plan Description:", newImprovementPlanDescription.value);

    const { data, error } = await supabase
      .from('ImprovementPlans')
      .insert([{
        improvementDescription: newImprovementPlanDescription.value,
        year: selectedIYear.value,
        month: selectedIMonth.value + 1,
        user_id: user.value.id
      }])

    if (error) {
      console.error("Error creating improvement plan:", error);
      toastError({ title: 'Error', description: 'Failed to create improvement plan' });
    } else {
      toastSuccess({ title: 'Success', description: 'Created the new improvement plan' });
      fetchImprovementPlans(); // Fetch the updated data immediately
      closeIModal(); // Close the modal after successful creation
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    toastError({ title: 'Error', description: 'An unexpected error occurred' });
  }
};

//EDIT Improvement Plan ---- PART ----
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

//Update the improvement plan ----EDIT
const updateImprovementPlan = async () => {
  if (!editImprovementPlanDescription.value) {
    toastError({ title: 'Error', description: 'Please enter a description' });
    return;
  }

  try {
    const { data, error } = await supabase
      .from('ImprovementPlans')
      .update({ improvementDescription: editImprovementPlanDescription.value })
      .eq('id', currentIEditPlanId.value)
      .eq('user_id', user.value.id)

    if (error) {
      console.error('Error updating improvement plan:', error);
      toastError({ title: 'Error', description: 'Failed to update the improvement plan' });
    } else {
      toastSuccess({ title: 'Success', description: 'Improvement plan updated' });
      fetchImprovementPlans();
      closeIEditModal();
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    toastError({ title: 'Error', description: 'An unexpected error occurred' });
  }
};

//DELETE existing improvement plan ---- DELETE -----
const deleteImprovementPlan = async (planId) => {
  try {
    const { data, error } = await supabase
      .from('ImprovementPlans')
      .delete()
      .eq('id', planId)
      .eq('user_id', user.value.id);

    if (error) {
      console.error('Error deleting improvement plan:', error);
      toastError({ title: 'Error', description: 'Failed to delete the plan' });
    } else {
      toastSuccess({ title: 'Success', description: 'Improvement plan deleted' });
      fetchImprovementPlans(); // Fetch updated plans after deletion
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    toastError({ title: 'Error', description: 'An unexpected error occurred' });
  }
};

const refreshCalendarData = async () => {
  try {
    await fetchMonthlyPlans();
    await fetchImprovementPlans();
    await fetchBiggestGain();
  } catch (error) {
    console.error('Error refreshing calendar data:', error);
    toastError({ title: 'Error', description: 'Failed to refresh calendar data' });
  }
};

// Use Ionic's lifecycle hook to refresh data when view enters
onIonViewWillEnter(async () => {
  await refreshCalendarData();
});

// Add these refs for delete confirmations
const showMonthlyDeleteConfirmationModal = ref(false);
const monthlyPlanToDelete = ref(null);
const showImprovementDeleteConfirmationModal = ref(false);
const improvementPlanToDelete = ref(null);

// Monthly Plan delete confirmation handlers
const openMonthlyDeleteConfirmationModal = (plan) => {
  monthlyPlanToDelete.value = plan;
  showMonthlyDeleteConfirmationModal.value = true;
};

const closeMonthlyDeleteConfirmationModal = () => {
  showMonthlyDeleteConfirmationModal.value = false;
  monthlyPlanToDelete.value = null;
};

const confirmMonthlyDelete = async () => {
  if (monthlyPlanToDelete.value) {
    await deleteMonthlyPlan(monthlyPlanToDelete.value.id);
    closeMonthlyDeleteConfirmationModal();
  }
};

// Improvement Plan delete confirmation handlers
const openImprovementDeleteConfirmationModal = (plan) => {
  improvementPlanToDelete.value = plan;
  showImprovementDeleteConfirmationModal.value = true;
};

const closeImprovementDeleteConfirmationModal = () => {
  showImprovementDeleteConfirmationModal.value = false;
  improvementPlanToDelete.value = null;
};

const confirmImprovementDelete = async () => {
  if (improvementPlanToDelete.value) {
    await deleteImprovementPlan(improvementPlanToDelete.value.id);
    closeImprovementDeleteConfirmationModal();
  }
};

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
  overflow-y: scroll;
  overscroll-behavior: contain;
  padding: 20px;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

ion-button {
  --background: #FFC2D1;
  --background-activated: #ffadb9;
  --background-focused: #ffadb9;
  --background-hover: #ffadb9;
  --background-pressed: #ffadb9;
  --color: black;
}

ion-input {
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-top: 10px;
  margin-bottom: 10px;
  width: 100%; 
}


.calendar-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: auto;
  max-height: fit-content;
  flex-shrink: 0; /* Prevent calendar from shrinking */
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

.line-md--edit-twotone {
  display: inline-block;
  width: 24px;
  height: 24px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cg fill='none' stroke='%23ff65bc' stroke-linecap='round' stroke-linejoin='round' stroke-width='2'%3E%3Cpath stroke-dasharray='20' stroke-dashoffset='20' d='M3 21h18'%3E%3Canimate fill='freeze' attributeName='stroke-dashoffset' dur='0.2s' values='20;0'/%3E%3C/path%3E%3Cpath stroke-dasharray='48' stroke-dashoffset='48' d='M7 17v-4l10 -10l4 4l-10 10h-4'%3E%3Canimate fill='freeze' attributeName='stroke-dashoffset' begin='0.2s' dur='0.6s' values='48;0'/%3E%3C/path%3E%3Cpath stroke-dasharray='8' stroke-dashoffset='8' d='M14 6l4 4'%3E%3Canimate fill='freeze' attributeName='stroke-dashoffset' begin='0.8s' dur='0.2s' values='8;0'/%3E%3C/path%3E%3C/g%3E%3Cpath fill='%23ff65bc' fill-opacity='0' d='M14 6l4 4L21 7L17 3Z'%3E%3Canimate fill='freeze' attributeName='fill-opacity' begin='1.1s' dur='0.15s' values='0;0.3'/%3E%3C/path%3E%3C/svg%3E");
}

.ic--twotone-delete {
  display: inline-block;
  width: 24px;
  height: 24px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23ff65bc' d='M8 9h8v10H8z' opacity='0.3'/%3E%3Cpath fill='%23ff65bc' d='m15.5 4l-1-1h-5l-1 1H5v2h14V4zM6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM8 9h8v10H8z'/%3E%3C/svg%3E");
}

ion-card {
  height: auto;
  max-height: fit-content;
  overflow: visible;
  padding: 20px;
  margin: 0;
  flex-shrink: 0; 
}
</style>
