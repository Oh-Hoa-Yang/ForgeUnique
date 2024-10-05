<template>
  <ion-content class="custom-background">
    <div class="container">
      <!-- Expense and To-Do List Sections (first row) -->
      <div class="row">
        <!-- Expense Section (Button Behavior) -->
        <button class="expense-button" @click="navigateToPage('/expensehome')">
          <div class="expense">
            <h3 style="text-align: center; font-weight: bold;">Expense</h3>
            <br />
            <p style="text-align: start;">
              <b>Monthly Budget:</b> <br />{{ monthlyBudget }} MYR
            </p>
            <br />
            <p style="text-align: start;">
              <b>Total Monthly Expenses:</b> <br />{{ totalExpenses }} MYR
            </p>
            <br />
            <p style="text-align: start;">
              <b>Today Expenses:</b> <br />{{ todayExpenses }} MYR
            </p>
            <br />
          </div>
        </button>

        <!-- To-Do List Section -->
        <div class="todo-list">
          <h3>To-Do List</h3>
          <ul>
            <li v-for="item in todos" :key="item.id">
              {{ item.description }}
              <button @click="editItem(item)">✏️</button>
              <button @click="deleteItem(item)">❌</button>
              <button @click="markAsComplete(item)">✔️</button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Sketching Plan Section (second row) -->
      <div class="sketch-plan">
        <h3>Sketching Plan</h3>

        <!-- Modal for adding new sketchbook -->
        <div v-if="showModal" class="modal-overlay">
          <div class="modal-content">
            <ion-label>Create New Sketchbook</ion-label>
            <ion-input type="text" v-model="newSketchbookTitle" placeholder="Enter Sketchbook Title" />
            <div style="text-align: center;">
              <ion-button @click="createSketchbook">Create</ion-button>
              <ion-button @click="closeModal">Cancel</ion-button>
            </div>
          </div>
        </div>

        <!-- Sketchbook List and Create Button -->
        <div v-if="!selectedSketch">
          <!-- Available Sketchbooks with pagination -->
          <div class="sketchbooks">
            <h4>Available Sketchbooks</h4>
            <ul>
              <li v-for="sketch in paginatedSketchbooks" :key="sketch.id" :class="{ active: selectedSketch === sketch.id }">
                {{ sketch.title }}
                <!-- Edit and Delete Buttons next to each other -->
                <div class="action-buttons">
                  <button @click="openEditModal(sketch)" class="edit-btn">✏️</button>
                  <button @click="deleteSketchbook(sketch.id)" class="delete-btn">❌</button>
                </div>
              </li>
            </ul>

            <!-- Pagination controls -->
            <div class="pagination-controls">
              <button @click="previousPage" :disabled="currentPage === 1">Previous</button>
              <span>Page {{ currentPage }} of {{ totalPages }}</span>
              <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
            </div>

            <!-- Button to create a new sketchbook -->
            <div class="create-button">
              <button @click="openModal">+</button>
            </div>
          </div>
        </div>

        <!-- Modal for editing a sketchbook title -->
        <div v-if="showEditModal" class="modal-overlay">
          <div class="modal-content">
            <ion-label>Edit Sketchbook Title</ion-label>
            <ion-input type="text" v-model="editedSketchbookTitle" placeholder="Enter New Title" />
            <div style="text-align: center;">
              <ion-button @click="editSketchbookTitle">Save</ion-button>
              <ion-button @click="closeEditModal">Cancel</ion-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ion-content>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAppToast } from '~/composables/useAppToast';

const { toastError, toastSuccess } = useAppToast();

// Expense and To-Do Data (Dummy Data)
const monthlyBudget = ref(2000);
const totalExpenses = ref(1500);
const todayExpenses = ref(50);
const todos = ref([{ id: 1, description: 'fyp project - Chap 3.4' }]);

// Sketchbook Data
const newSketchbookTitle = ref('');
const sketchbooks = ref([]);
const selectedSketch = ref(null);
const currentPageNumber = ref(1);
const totalPages = ref(10); // Assume 10 pages for now
const currentPage = ref(1);
const itemsPerPage = ref(5); // Display 5 sketchbooks per page
const showModal = ref(false);
const showEditModal = ref(false);
const editedSketchbook = ref(null); // For editing
const editedSketchbookTitle = ref('');

// Vue Signature options
const router = useRouter();

// Modal management
const openModal = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  newSketchbookTitle.value = ''; // Reset input
};

const openEditModal = (sketch) => {
  editedSketchbook.value = sketch;
  editedSketchbookTitle.value = sketch.title; // Pre-fill with the current title
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editedSketchbook.value = null;
  editedSketchbookTitle.value = '';
};

// Paginate sketchbooks
const paginatedSketchbooks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return sketchbooks.value.slice(start, end);
});

const supabase = useSupabaseClient();

// Fetch authenticated user from Supabase
const fetchUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }
  return data.user;
};

// Create Sketchbook in Supabase
const createSketchbook = async () => {
  const user = await fetchUser();

  if (newSketchbookTitle.value && user) {
    try {
      const { data, error } = await supabase
        .from('Sketches')
        .insert([{ title: newSketchbookTitle.value, user_id: user.id }]);

      if (error) {
        toastError({
          title: 'Error',
          description: 'Failed to create sketchbook!'
        });
        return;
      }

      // After success, close modal, show toast, refresh data
      closeModal();
      toastSuccess({
        title: 'Successful',
        description: 'Sketchbook created successfully!'
      });

      await fetchSketchbooks(); // Refresh the list of sketchbooks

    } catch (e) {
      console.error('Error:', e);
      toastError({
        title: 'Error',
        description: 'An error occurred while creating the sketchbook.'
      });
    }
  } else {
    toastError({
      title: 'Error',
      description: 'User is not authenticated!'
    });
  }
};

// Delete Sketchbook from Supabase
const deleteSketchbook = async (sketchId) => {
  try {
    const { data, error } = await supabase
      .from('Sketches')
      .delete()
      .eq('id', sketchId);

    if (error) {
      toastError({
        title: 'Error',
        description: 'Failed to delete sketchbook!'
      });
    } else {
      toastSuccess({
        title: 'Deleted',
        description: 'Sketchbook deleted successfully!'
      });
      await fetchSketchbooks(); // Refresh list after deletion
    }
  } catch (e) {
    console.error('Error deleting sketchbook:', e);
    toastError({
      title: 'Error',
      description: 'An error occurred while deleting the sketchbook.'
    });
  }
};

// Edit Sketchbook Title in Supabase
const editSketchbookTitle = async () => {
  try {
    const { data, error } = await supabase
      .from('Sketches')
      .update({ title: editedSketchbookTitle.value })
      .eq('id', editedSketchbook.value.id);

    if (error) {
      toastError({
        title: 'Error',
        description: 'Failed to update sketchbook title!'
      });
    } else {
      toastSuccess({
        title: 'Updated',
        description: 'Sketchbook title updated successfully!'
      });
      closeEditModal();
      await fetchSketchbooks(); // Refresh list after update
    }
  } catch (e) {
    console.error('Error updating sketchbook:', e);
    toastError({
      title: 'Error',
      description: 'An error occurred while updating the sketchbook title.'
    });
  }
};

// Fetch available sketchbooks from Supabase
const fetchSketchbooks = async () => {
  const { data, error } = await supabase
    .from('Sketches')
    .select('*')
    .order('title', { ascending: true });

  if (error) {
    console.error('Error fetching sketchbooks:', error);
    return;
  }

  sketchbooks.value = data;
  totalPages.value = Math.ceil(sketchbooks.value.length / itemsPerPage.value);
};

// Fetch sketchbooks on mount
onMounted(() => {
  fetchSketchbooks();
});
</script>

<style scoped>
.custom-background {
  --background: #FFEDF5;
}

/* Container for grid layout */
.container {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;
  gap: 10px;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}

/* Row for expense and to-do list */
.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  height: 40%;
}

/* Button behavior for expense */
.expense-button {
  background-color: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.expense-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.expense-button:active {
  transform: translateY(0);
}

/* Expense section */
.expense {
  background-color: #fff;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.expense-button:hover .expense {
  background-color: #f2f2f2;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

/* To-Do list section */
.todo-list {
  background-color: #f9f9f9;
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

/* Sketching Plan section */
.sketch-plan {
  background-color: #fff;
  padding: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  height: 60%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* Adding some spacing */
h3 {
  margin-bottom: 10px;
}

/* Sketchbook creation */
.create-sketchbook {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

/* Sketchbooks section */
.sketchbooks ul {
  list-style: none;
  padding: 0;
}

.sketchbooks li {
  padding: 10px;
  cursor: pointer;
  background-color: #f0f0f0;
  margin-bottom: 5px;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sketchbooks li.active {
  background-color: #fdf5e6;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-buttons button {
  background: none;
  border: none;
  cursor: pointer;
}

/* Page navigation */
.page-navigation {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

/* Back button */
.back-button {
  margin-top: 10px;
  background-color: #f0f0f0;
  padding: 10px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}

/* Modal styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.pagination-controls {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.create-button {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
