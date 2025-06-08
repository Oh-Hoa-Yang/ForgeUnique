<template>
  <div class="custom-background">
    <div class="container mx-auto">
    <ion-card>
      <div class="calendar-card">
      <VCalendar color="pink" :attributes="attrs" is-dark="{}" expanded />
      <!-- <VDatePicker class="calendar" v-model="date" /> -->
       </div>
    </ion-card>

    <!-- Yearly Plan Card  PART  --> 
    <ion-card style="padding: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h5 style="font-weight: bold; text-align: center;">YEARLY PLAN</h5>
        <button @click="openModal" style="font-size:24px; padding: 5px 10px; color: #FD8395;">+</button>
      </div>

      <!-- Year Dropdowns -->
      <div style="margin-top: 20px; display: flex; justify-content: space-between; align-items: center;">
        <select v-model="selectedYear" @change="fetchYearlyPlans" class="year-selector">
          <option v-for="year in yearsList" :key="year" :value="year">{{ year }}</option>
        </select>
      </div>

      <!-- Displaying the Yearly Plan Records -->
      <div v-if="yearlyPlanData.length > 0" style="padding: 20px;">
        <ol>
          <!-- Loop through yearlyPlanData and display each record with a numbered list -->
          <li v-for="(plan, index) in paginatedPlans" :key="plan.id" style="margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong>{{ index + 1 }}. {{ plan.yearlyDescription }}</strong>
              <div style="display: flex; justify-content: end; align-items: center;">
                <button @click="openEditModal(plan)" style="font-size: 14px; color: #FD8395; "><span class="line-md--edit-twotone"></span></button>
                <button @click="deleteYearlyPlan(plan.id)" style="font-size: 14px; color: #FD8395;"><span class="ic--twotone-delete"></span></button>
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
        <p>No records found for this year.</p>
      </div>

      <!-- Modal for creating new yearly plan -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-content">
          <ion-label>Create New Yearly Plan for {{ selectedYear }}</ion-label>
          <ion-input type="text" v-model="newYearlyPlanDescription" placeholder="Enter yearly plan description" />
          <div style="text-align: center;">
            <ion-button @click="createYearlyPlan">Create</ion-button>
            <ion-button @click="closeModal">Cancel</ion-button>
          </div>
        </div>
      </div>

      <!-- Modal for editing existing yearly plan -->
      <div v-if="showEditModal" class="modal-overlay">
        <div class="modal-content">
          <ion-label>Edit Yearly Plan for {{ selectedYear }}</ion-label>
          <ion-input type="text" v-model="editYearlyPlanDescription" placeholder="Edit yearly plan description" />
          <div style="text-align: center;">
            <ion-button @click="updateYearlyPlan">Update</ion-button>
            <ion-button @click="closeEditModal">Cancel</ion-button>
          </div>
        </div>
      </div>
    </ion-card>
    <br><br>
    </div>
  </div>
</template>

<script setup>
import 'v-calendar/style.css';
import { useAppToast } from '~/composables/useAppToast';
import { onIonViewWillEnter } from '@ionic/vue';

const { toastError, toastSuccess } = useAppToast();

const refreshYearlyPlans = async () => {
  try {
    await fetchYearlyPlans();
  } catch (error) {
    console.error('Error refreshing yearly plans:', error);
    toastError({ title: 'Error', description: 'Failed to refresh yearly plans' });
  }
}

onIonViewWillEnter(async () => {
  await refreshYearlyPlans();
});

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
const itemsPerPage = 10;
const totalPages = ref(1);

//Monhtly Plans Section
const selectedYear = ref(new Date().getFullYear()); // Default to current year
const yearsList = ref([]);

const yearlyPlanData = ref([]);

// Fetch available years for selection (from 2020 to the current year)
onMounted(() => {
  const currentYear = new Date().getFullYear();
  yearsList.value = Array.from({ length: currentYear+3 - 2019 }, (_, index) => 2020 + index);
  fetchYearlyPlans();
});

// Fetch Yearly plans based on selected year
const fetchYearlyPlans = async () => {
  console.log(`Fetching data for ${selectedYear.value}`);
  try {
    const { data, error, count } = await supabase
      .from('YearlyPlans')
      .select('*', { count: 'exact' })
      .eq('year', selectedYear.value)
      .eq('user_id', user.value.id)

    if (error) {
      console.error('Error fetching yearly plans:', error);
    } else {
      yearlyPlanData.value = data;
      totalPages.value = Math.ceil(count / itemsPerPage); //Calc totalPages for paginate
    }
  } catch (err) {
    console.error('Error fetching yearly plans:', err);
  }
};

//Pagination
const paginatedPlans = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return yearlyPlanData.value.slice(start, end);
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
const newYearlyPlanDescription = ref(''); //Holds the new yearly plan desc
// Open modal to add a new record
const openModal = () => {
  console.log(`Open modal to add new record for: ${selectedYear.value}`);
  showModal.value = true;
};
//Close the modal 
const closeModal = () => {
  showModal.value = false;
  newYearlyPlanDescription.value = '';
};

//CREATE new yearly plan
const createYearlyPlan = async () => {
  if (!newYearlyPlanDescription.value) {
    toastError({ title: 'Error', description: 'Please enter a description' });
    return;
  }

  if (!user.value || !user.value.id) {
    toastError({ title: 'Error', description: 'User not authenticated' });
    return;
  }


  try {
    console.log(`Creating yearly plan: ${newYearlyPlanDescription.value}`);
    console.log("Plan Description:", newYearlyPlanDescription.value);

    const { data, error } = await supabase
      .from('YearlyPlans')
      .insert([{
        yearlyDescription: newYearlyPlanDescription.value,
        year: selectedYear.value,
        user_id: user.value.id
      }])

    if (error) {
      console.error("Error creating yearly plan:", error);
      toastError({ title: 'Error', description: 'Failed to create yearly plan' });
    } else {
      toastSuccess({ title: 'Success', description: 'Created the new yearly plan' });
      fetchYearlyPlans(); // Fetch the updated data immediately
      closeModal(); // Close the modal after successful creation
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    toastError({ title: 'Error', description: 'An unexpected error occurred' });
  }
};

//EDIT Yearly Plan ---- PART ----
const showEditModal = ref(false);
const editYearlyPlanDescription = ref('');
const currentEditPlanId = ref(null);

//Open modal for Edit
const openEditModal = (plan) => {
  editYearlyPlanDescription.value = plan.yearlyDescription;
  currentEditPlanId.value = plan.id;
  showEditModal.value = true;
};

//Close modal of Edit
const closeEditModal = () => {
  showEditModal.value = false;
  editYearlyPlanDescription.value = ''; //Reset the description field
  currentEditPlanId.value = null; //Reset the plan ID
};

//Update the yearly plan ----EDIT
const updateYearlyPlan = async () => {
  if (!editYearlyPlanDescription.value) {
    toastError({title:'Error', description:'Please enter a description'});
    return;
  }

  try {
    const { data, error } = await supabase 
    .from('YearlyPlans')
    .update({ yearlyDescription: editYearlyPlanDescription.value })
    .eq('id', currentEditPlanId.value)
    .eq('user_id', user.value.id)

    if (error) {
      console.error('Error updating yearly plan:', error);
      toastError({title:'Error', description:'Failed to update the plan'});
    } else {
      toastSuccess({title:'Success',description:'Yearly plan updated'});
      fetchYearlyPlans();
      closeEditModal();
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    toastError({title:'Error', description:'An unexpected error occurred'});
  }
};

//DELETE existing yearly plan ---- DELETE -----
const deleteYearlyPlan = async (planId) => {
  try {
    const { data, error } = await supabase
      .from('YearlyPlans')
      .delete()
      .eq('id', planId)
      .eq('user_id', user.value.id);

    if (error) {
      console.error('Error deleting yearly plan:', error);
      toastError({ title: 'Error', description: 'Failed to delete the plan' });
    } else {
      toastSuccess({ title: 'Success', description: 'Yearly plan deleted' });
      fetchYearlyPlans(); // Fetch updated plans after deletion
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    toastError({ title: 'Error', description: 'An unexpected error occurred' });
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
  min-height: 90vh;
  height: 100%;
  width: 100%;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  flex: 1;
  box-sizing: border-box;
  border-radius: 8px;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 20px;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

ion-card {
  height: auto;
  min-height: fit-content;
  overflow: visible;
  padding: 20px;
  margin: 0;
  flex-shrink: 0; 
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
  width: 100%;
  height: auto;
  min-height: fit-content;
  flex-shrink: 0; 
  /* Ensure card background color is visible */
}

/* Yearly Plan */
.year-selector {
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
</style>
