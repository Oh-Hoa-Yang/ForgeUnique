<template>
  <!-- Main Page with Content -->
  <ion-page id="main-content">
    <!-- Header Component -->
    <Header />

    <!-- Main Content (imported component) -->
    <ion-content class="custom-background">
      <ion-card>
        <div class="top-row-container">
          <button @click="navBackExpenseHome">
            <span class="lets-icons--back"></span>
          </button>
          <h1 style="font-size: 25px;">
            <b>New {{ selectedCategory }}</b>
          </h1>
          <button @click="showRecurringModal = true">
            <span class="mdi--recurring-payment"></span>
          </button>
        </div>

        <!-- Date Picker Trigger Button -->
        <div class="date-picker-container">
          <button class="date-button" @click="showModal = true">
            <span class="calendar-icon"></span>
            <span class="date-text">{{ formattedDate }}</span>
          </button>
        </div>

        <!-- Amount Insert -->
        <div class="input-row">
          <label class="input-label">Amount</label>
          <input type="text" v-model="expenseAmount" class="input-field" placeholder="0.00" readonly @focus.prevent />
        </div>

        <!-- Amount Description -->
        <div class="input-desc">
          <span class="meteor-icons--pencil"></span>
          <input type="text" v-model="expenseDescription" class="input-field" placeholder="Add note" />
        </div>

        <!-- KEYPAD -->
        <div class="keypad-wrapper">
          <div class="keypad-row">
            <button class="keypad-button" type="button" @click="inputDigit(1)">1</button>
            <button class="keypad-button" type="button" @click="inputDigit(2)">2</button>
            <button class="keypad-button" type="button" @click="inputDigit(3)">3</button>
          </div>
          <div class="keypad-row">
            <button class="keypad-button" type="button" @click="inputDigit(4)">4</button>
            <button class="keypad-button" type="button" @click="inputDigit(5)">5</button>
            <button class="keypad-button" type="button" @click="inputDigit(6)">6</button>
          </div>
          <div class="keypad-row">
            <button class="keypad-button" type="button" @click="inputDigit(7)">7</button>
            <button class="keypad-button" type="button" @click="inputDigit(8)">8</button>
            <button class="keypad-button" type="button" @click="inputDigit(9)">9</button>
          </div>
          <div class="keypad-row">
            <button class="keypad-button" type="button" @click="deleteLastDigit">DEL</button>
            <button class="keypad-button" type="button" @click="inputDigit('.')">.</button>
            <button class="keypad-button" type="button" @click="inputDigit(0)">0</button>
          </div>
        </div>

        <div class="add-container">
          <button class="add-button" @click="addExpense">
            <h1><b>ADD</b></h1>
          </button>
        </div>


      </ion-card>
    </ion-content>


    <!-- Modal for Date Picker -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Select a Date</h3>
        <VDatePicker v-model="date" @update:modelValue="onDateChange" />
        <div class="modal-buttons">
          <ion-button @click="confirmDate">Confirm</ion-button>
          <ion-button color="medium" @click="closeModal">Cancel</ion-button>
        </div>
      </div>
    </div>

    <!-- Modal for Recurring Schedule -->
    <div v-if="showRecurringModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Recurring Schedule</h3>
        <p><i>Select the way you want to recurring schedule it:</i></p>
        <select v-model="recurringSchedule" class="dropdown">
          <option value="Once">Once</option>
          <option value="Weekly">Weekly</option>
          <option value="Every 2 Weeks">Every 2 Weeks</option>
          <option value="Every 4 Weeks">Every 4 Weeks</option>
          <option value="Every Month">Every Month</option>
          <option value="Last Day of Month">Last Day of Month</option>
          <option value="Every 2 Months">Every 2 Months</option>
          <option value="Every 4 Months">Every 4 Months</option>
          <option value="Every 6 Months">Every 6 Months</option>
          <option value="Every Year">Every Year</option>
        </select>
        <div class="modal-buttons">
          <ion-button @click="confirmRecurringSchedule">Confirm</ion-button>
          <ion-button color="medium" @click="closeRecurringModal">Cancel</ion-button>
        </div>
      </div>
    </div>


    <!-- Footer Component -->
    <Footer :current-route="route.path" />
  </ion-page>
</template>

<script setup>
import Header from '~/components/header.vue';
import Footer from '~/components/footer.vue';
import { useRoute } from 'vue-router';
import { useAppToast } from '~/composables/useAppToast';
import 'v-calendar/style.css';

definePageMeta({
  middleware: 'auth'
})

const appState = inject('appState')

const { toastError, toastSuccess } = useAppToast();
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const router = useRouter();
const route = useRoute();

//General
// Extract the category name passed via query parameter
const selectedCategory = ref(route.query.category || 'Expense');

// Watch for changes in the route's query parameter
watch(
  () => route.query.category,
  (newCategory) => {
    if (newCategory) {
      selectedCategory.value = newCategory;
    }
  }
);

// Date Management
const date = ref(new Date()); // Holds the selected date
console.log('Current date:', date);
const showModal = ref(false);
const formattedDate = ref(formatDate(new Date())); // Readable date display

// Format date function: e.g., "Wednesday, 18 December"
function formatDate(date) {
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  return date.toLocaleDateString('en-US', options);
}

// Handle date selection inside VDatePicker
const onDateChange = (newDate) => {
  date.value = newDate;
};

// Confirm button: set the formattedDate and close modal
const confirmDate = () => {
  formattedDate.value = formatDate(new Date(date.value));
  showModal.value = false;
};

// Close modal without changes
const closeModal = () => { showModal.value = false };

//Recurring Schedule
const showRecurringModal = ref(false);
const recurringSchedule = ref('Once'); //By default = Once

const confirmRecurringSchedule = () => {
  console.log('Selected recurring schedule:', recurringSchedule.value);
  showRecurringModal.value = false;
};

const closeRecurringModal = () => { showRecurringModal.value = false };

// Navigation Methods
const navBackExpenseHome = () => {
  date.value = new Date();
  formattedDate.value = formatDate(date.value);
  expenseAmount.value = '';
  expenseDescription.value = '';
  recurringSchedule.value = 'Once';
  router.push('/expensehomepage');
}


//INPUT PART - AMOUNT
// Variable to store the input amount
const expenseAmount = ref('');
const expenseDescription = ref('');

//Keypad functions
const inputDigit = (digit) => {
  if (digit === '.' && expenseAmount.value.includes('.')) return; //To prevent multi '.'

  //Make restriction to '.',limit 2 digit after it
  if (expenseAmount.value.includes('.')) {
    const [integerPart, decimalPart] = expenseAmount.value.split('.');
    if (decimalPart.length >= 2) return; // Prevent more than 2 digits after '.'
  };

  expenseAmount.value += digit;
};

const deleteLastDigit = () => {
  expenseAmount.value = expenseAmount.value.slice(0, -1);
}

//Function to ADD expense
const addExpense = async () => {
  //Validation
  if (!expenseAmount.value || isNaN(parseFloat(expenseAmount.value))) {
    toastError({ title: 'Error', description: 'Please enter a valid amount.' })
    return;
  }

  if (!expenseDescription.value) {
    toastError({ title: 'Error', description: 'Please add a note.' })
    return;
  }

  try {
    // Convert selected date to the local timezone (Malaysia: Asia/Kuala_Lumpur)
    const expenseDate = new Date(date.value.getTime() - date.value.getTimezoneOffset() * 60000)
      .toISOString()
      .split('T')[0]; // Get YYYY-MM-DD format without timezone adjustment

    // Debugging: Log the selected and formatted date
    console.log('Selected Date (raw):', date.value);
    console.log('Expense Date (formatted):', expenseDate);


    const { error } = await supabase
      .from('Expenses')
      .insert([
        {
          expenseDate: expenseDate,
          category: selectedCategory.value,
          expenseAmount: parseFloat(expenseAmount.value),
          expenseDescription: expenseDescription.value,
          recurringSchedule: recurringSchedule.value,
          user_id: user.value.id,
          lastRecurringDate: expenseDate,
        }
      ]);

    if (error) throw error;

    //Success feedback 
    toastSuccess({ title: 'Success', description: 'Expense added successfully!' });

    // Update local `appState`
    const addedAmount = parseFloat(expenseAmount.value);
    const todayDate = new Date().toISOString().split('T')[0];

    if (expenseDate === todayDate) {
      appState.todayExpense += addedAmount; // Add to today's expenses
    }

    const currentMonth = new Date().getMonth() + 1;
    const expenseMonth = new Date(date.value).getMonth() + 1;

    if (currentMonth === expenseMonth) {
      appState.monthlyExpense += addedAmount; // Add to monthly expenses
    }

    // Reset fields and navigate back
    date.value = new Date();
    formattedDate.value = formatDate(date.value);
    expenseAmount.value = '';
    expenseDescription.value = '';
    recurringSchedule.value = 'Once';
    router.push({ path: '/expensehomepage', query: { refresh: true } });
  } catch (err) {
    console.error('Error adding expense:', err.message);
    toastError({ title: 'Error', description: 'Failed to add expense. Please try again.' });
  }
};

</script>

<style scoped>
.custom-background {
  --background: #FFEDF5;
  /* height: 10000000px; */
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

.mdi--recurring-payment {
  display: inline-block;
  width: 30px;
  height: 30px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23ff65bc' d='M3 6v12h10.32a6.4 6.4 0 0 1-.32-2H7a2 2 0 0 0-2-2v-4c1.11 0 2-.89 2-2h10a2 2 0 0 0 2 2v.06c.67 0 1.34.12 2 .34V6zm9 3c-1.7.03-3 1.3-3 3s1.3 2.94 3 3c.38 0 .77-.08 1.14-.23c.27-1.1.72-2.14 1.83-3.16C14.85 10.28 13.59 8.97 12 9m7 2l2.25 2.25L19 15.5V14c-1.85 0-3.06 1.96-2.24 3.62l-1.09 1.09c-1.76-2.66.14-6.21 3.33-6.21zm0 11l-2.25-2.25L19 17.5V19c1.85 0 3.06-1.96 2.24-3.62l1.09-1.09c1.76 2.66-.14 6.21-3.33 6.21z'/%3E%3C/svg%3E");
}

.date-picker-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

.date-button {
  display: flex;
  align-items: center;
  background-color: #ffedf5;
  border: 1px solid #ffd6e5;
  padding: 10px 15px;
  font-size: 16px;
  color: #ff65bc;
  border-radius: 8px;
  cursor: pointer;
}

.calendar-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-right: 10px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23ff65bc' d='M7 11h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zM7 15h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zM19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 16H5V10h14zm0-12H5V6h14z'/%3E%3C/svg%3E");
  background-size: cover;
}

.date-text {
  color: #333;
  font-weight: bold;
}

/* Modal Styling */
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
  color: black;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

/* Amount part */
.input-row {
  display: flex;
  align-items: center;
  width: 100%;
  margin-top: 20px;
  padding: 10px;
}

.input-desc {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 20px;
}

/* Label Styling */
.input-label {
  background-color: #ffe6f0;
  /* Light pink */
  color: #333;
  font-weight: bold;
  text-align: center;
  padding: 12px 15px;
  /* Consistent padding */
  font-size: 24px;
  width: 120px;
  /* Fixed width */
  height: 50px;
  /* Ensure the label and input field have the same height */
  display: flex;
  align-items: center;
  /* Vertically center text */
  justify-content: center;
  border-radius: 8px 0 0 8px;
  /* Rounded left corners */
  box-sizing: border-box;
}

/* Input Field Styling */
.input-field {
  flex: 1;
  /* Expand input to fill remaining space */
  height: 50px;
  /* Match label height */
  padding: 12px;
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
}

.input-field[readonly] {
  background-color: #f9f9f9;
  /* Light gray to indicate it's readonly */
  cursor: not-allowed;
}

/* Focus State for Input */
.input-field:focus {
  border-color: #ff65bc;
  outline: none;
}

/* Keypad */
.keypad-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.keypad-row {
  display: flex;
  justify-content: center;
  margin: 5px;
}

.keypad-button {
  width: 70px;
  height: 70px;
  font-size: 24px;
  margin: 5px;
  border: none;
  background-color: #FFC2D1;
  border-radius: 10px;
  cursor: pointer;
}

button:active {
  background-color: #ccc;
}

/* PENC ICON */
.meteor-icons--pencil {
  display: inline-block;
  width: 30px;
  height: 30px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='%23ff65bc' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M16 4a1 1 0 0 1 3 3L7 19l-4 1l1-4zm-4 16h9'/%3E%3C/svg%3E");
}

.add-button {
  width: 300px;
  height: 70px;
  font-size: 50px;
  border: none;
  background-color: #FFC2D1;
  border-radius: 10px;
  cursor: pointer;
}

.add-container {
  padding: 20px;
  display: flex;
  justify-content: center;

}

.dropdown {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: white;
  color: #333;
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