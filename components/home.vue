<template>
  <ion-content class="custom-background">
    <div class="container">
      <!-- Expense and To-Do List Sections (first row) -->
      <div class="row">
        <!-- Expense Section (Button Behavior) -->
        <button class="expense-button" @click="navigateToPage('/expensehome')">
          <div class="expense">
            <h3 style="text-align: center; font-weight: bold;">Expense</h3>
            <p><b>Monthly Budget:</b> {{ monthlyBudget }} MYR</p>
            <p><b>Total Monthly Expenses:</b> {{ totalExpenses }} MYR</p>
            <p><b>Today Expenses:</b> {{ todayExpenses }} MYR</p>
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
          <div class="sketchbooks">
            <h4>Available Sketchbooks</h4>
            <ul>
              <li v-for="sketch in paginatedSketchbooks" :key="sketch.id" :class="{ active: selectedSketch === sketch.id }" @click="selectSketchbook(sketch)">
                {{ sketch.title }}
                <div class="action-buttons">
                  <button @click.stop="openEditModal(sketch)">✏️</button>
                  <button @click.stop="deleteSketchbook(sketch.id)">❌</button>
                </div>
              </li>
            </ul>

            <div class="pagination-controls">
              <button @click="previousPage" :disabled="currentPage === 1">Previous</button>
              <span>Page {{ currentPage }} of {{ totalPages }}</span>
              <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
            </div>

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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAppToast } from '~/composables/useAppToast';

const { toastError, toastSuccess } = useAppToast();

const monthlyBudget = ref(2000);
const totalExpenses = ref(1500);
const todayExpenses = ref(50);
const todos = ref([{ id: 1, description: 'fyp project - Chap 3.4' }]);

const newSketchbookTitle = ref('');
const sketchbooks = ref([]);
const selectedSketch = ref(null);
const currentPageNumber = ref(1);
const totalPages = ref(1); 
const currentPage = ref(1);
const itemsPerPage = ref(5);
const showModal = ref(false);
const showEditModal = ref(false);
const editedSketchbook = ref(null);
const editedSketchbookTitle = ref('');

const supabase = useSupabaseClient();
const router = useRouter();

const openModal = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  newSketchbookTitle.value = ''; 
};

const openEditModal = (sketch) => {
  editedSketchbook.value = sketch;
  editedSketchbookTitle.value = sketch.title;
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editedSketchbook.value = null;
  editedSketchbookTitle.value = '';
};

const paginatedSketchbooks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return sketchbooks.value.slice(start, end);
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

const fetchUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }
  return data.user;
};

const createSketchbook = async () => {
  const user = await fetchUser();

  if (newSketchbookTitle.value && user) {
    try {
      const { data, error } = await supabase
        .from('Sketches')
        .insert([{ title: newSketchbookTitle.value, user_id: user.id }]);

      if (error) {
        toastError({ title: 'Error', description: 'Failed to create sketchbook!' });
        return;
      }

      closeModal();
      toastSuccess({ title: 'Successful', description: 'Sketchbook created successfully!' });
      await fetchSketchbooks(); 
    } catch (e) {
      console.error('Error:', e);
      toastError({ title: 'Error', description: 'An error occurred while creating the sketchbook.' });
    }
  } else {
    toastError({ title: 'Error', description: 'User is not authenticated!' });
  }
};

const deleteSketchbook = async (sketchId) => {
  try {
    const { data, error } = await supabase
      .from('Sketches')
      .delete()
      .eq('id', sketchId);

    if (error) {
      toastError({ title: 'Error', description: 'Failed to delete sketchbook!' });
    } else {
      toastSuccess({ title: 'Deleted', description: 'Sketchbook deleted successfully!' });
      await fetchSketchbooks(); 
    }
  } catch (e) {
    console.error('Error deleting sketchbook:', e);
    toastError({ title: 'Error', description: 'An error occurred while deleting the sketchbook.' });
  }
};

const editSketchbookTitle = async () => {
  try {
    const { data, error } = await supabase
      .from('Sketches')
      .update({ title: editedSketchbookTitle.value })
      .eq('id', editedSketchbook.value.id);

    if (error) {
      toastError({ title: 'Error', description: 'Failed to update sketchbook title!' });
    } else {
      toastSuccess({ title: 'Updated', description: 'Sketchbook title updated successfully!' });
      closeEditModal();
      await fetchSketchbooks(); 
    }
  } catch (e) {
    console.error('Error updating sketchbook:', e);
    toastError({ title: 'Error', description: 'An error occurred while updating the sketchbook title.' });
  }
};

const selectSketchbook = (sketch) => {
  selectedSketch.value = sketch;
  currentPageNumber.value = 1; 
};

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

onMounted(() => {
  fetchSketchbooks();
});
</script>

<style scoped>
.custom-background {
  --background: #FFEDF5;
}

.container {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;
  gap: 10px;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  height: 40%;
}

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

.todo-list {
  background-color: #f9f9f9;
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

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

h3 {
  margin-bottom: 10px;
}

.create-sketchbook {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

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

.page-navigation {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.back-button {
  margin-top: 10px;
  background-color: #f0f0f0;
  padding: 10px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}

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
