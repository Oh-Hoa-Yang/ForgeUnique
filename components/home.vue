<template>
  <ion-content class="custom-background">
    <div class="container">
      <!-- Expense and To-Do List Sections (first row) -->
      <div class="row">
        <!-- Expense Section (Button Behavior) -->
        <button class="expense-button" @click="navigateToPage('/expensehome')">
          <div class="expense">
            <h3 style="text-align: center; font-weight: bold;">Expense</h3>
            <p><b>Monthly Budget:</b> <br>{{ monthlyBudget }} MYR</p><br>
            <p><b>Total Monthly Expenses:</b><br> {{ totalExpenses }} MYR</p><br>
            <p><b>Today Expenses:</b> <br>{{ todayExpenses }} MYR</p>
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

      <!-- Sketching Plan Section -->
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
            <div class="sketchbooks-header">
              <h4>Available Sketchbooks</h4>
              <button @click="openModal" class="add-sketchbook-button">+</button>
            </div>
            <ul>
              <li v-for="sketch in paginatedSketchbooks" :key="sketch.id"
                :class="{ active: selectedSketch === sketch.id }">
                <span @click="selectSketchbook(sketch)">
                  {{ sketch.title }}
                </span>
                <div class="action-buttons">
                  <button @click.stop="openEditModal(sketch)">✏️</button>
                  <button @click.stop="deleteSketchbook(sketch.id)">❌</button>
                </div>
              </li>
            </ul>

            <div class="pagination-controls">
              <button @click="previousPage" :disabled="currentPage === 1">Previous</button>
              <span>Page {{ currentPage }} of {{ totalPages }}</span>
              <button @click="nextSketchbookPage" :disabled="currentPage === totalPages">Next</button>
            </div>
          </div>
        </div>

        <!-- Sketching Canvas Section -->
        <div v-if="selectedSketch" class="canvas-container">
          <h4>Sketchbook: {{ selectedSketch.title }} (Page {{ currentPageNumber }})</h4>

          <!-- Tool Selection -->
          <div class="tool-selection">
            <button @click="selectTool('pencil')">✏️ Pencil</button>
            <button @click="selectTool('eraser')">🧽 Eraser</button>
          </div>

          <div class="canvas-controls">
            <button @click="prevPage">Previous Page</button>
            <button @click="nextSketchPage">Next Page</button>
            <button @click="undoAction">Undo</button>
            <button @click="redoAction">Redo</button>
            <button @click="saveCanvas">Save</button>
            <button @click="clearCanvas">Clear</button>
            <button @click="backToSketchbookList">Back</button>
          </div>

          <!-- Sketch Canvas -->
          <vue-signature :options="signatureOptions" ref="signaturePad" @end="onSketchEnd" class="signature-canvas" />
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
import VueSignature from 'vue3-signature';

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
const sketchPages = ref([]); // Pages in the selected sketchbook
const selectedPageActions = ref([]); // Actions for the selected page

const undoStack = ref([]); // Store sketch actions for undo
const redoStack = ref([]); // Store redo actions
const signaturePad = ref(null); // Reference for signature pad
const tool = ref('pencil'); // Selected tool (pencil/eraser)

const user = useSupabaseUser()

// Signature pad options
const signatureOptions = ref({
  backgroundColor: '#FFF',
  penColor: 'black',  // Default color for pencil
  width: 728,  // Match the container's full width
  height: 550  // Make the height taller to occupy more space
});

const supabase = useSupabaseClient(); const session = await supabase.auth.getSession();

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

// Tool selection
const selectTool = (selectedTool) => {
  tool.value = selectedTool;
  if (selectedTool === 'pencil') {
    signatureOptions.value.penColor = 'black'; // Set to pencil color
  } else if (selectedTool === 'eraser') {
    signatureOptions.value.penColor = '#FFF'; // Set to white (eraser effect)
  }
};

// Pagination controls
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

const nextSketchbookPage = () => {
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

// Modify the fetchSketchbooks function
const fetchSketchbooks = async () => {
  if (!user.value) {
    // Fetch the authenticated user again
    const { data: userData, error } = await supabase.auth.getUser();
    if (error || !userData) {
      toastError({ title: 'Error', description: 'User is not authenticated!' });
      return;
    }
    user.value = userData.user;
  }

  try {
    const { data, error } = await supabase
      .from('Sketches')
      .select('*')
      .eq('user_id', user.value.id) // Fetch sketches only for the current user
      .order('title', { ascending: true });

    if (error) {
      toastError({ title: 'Error', description: 'Failed to fetch sketchbooks!' });
    } else {
      sketchbooks.value = data;
      totalPages.value = Math.ceil(sketchbooks.value.length / itemsPerPage.value);
    }
  } catch (e) {
    console.error('Error fetching sketchbooks:', e);
  }
};

// Modify the createSketchbook function
const createSketchbook = async () => {
  if (!user.value) {
    // Fetch the authenticated user again
    const { data: userData, error } = await supabase.auth.getUser();
    if (error || !userData) {
      toastError({ title: 'Error', description: 'User is not authenticated!' });
      return;
    }
    user.value = userData.user;
  }

  if (!newSketchbookTitle.value) {
    toastError({ title: 'Error', description: 'Please enter a title for the sketchbook!' });
    return;
  }

  try {
    const { data, error } = await supabase
      .from('Sketches')
      .insert([{ title: newSketchbookTitle.value }]);

    if (error) {
      toastError({ title: 'Error', description: 'Failed to create sketchbook!' });
      return;
    }

    toastSuccess({ title: 'Success', description: 'Sketchbook created successfully!' });
    closeModal();
    await fetchSketchbooks(); // Refresh the list of sketchbooks
  } catch (e) {
    toastError({ title: 'Error', description: 'An error occurred while creating the sketchbook.' });
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

// Select a sketchbook and load its pages
const selectSketchbook = async (sketch) => {
  selectedSketch.value = sketch;
  undoStack.value = []; // Clear previous undo actions
  redoStack.value = []; // Clear previous redo actions

  // Load pages for the selected sketchbook
  const { data: pages, error } = await supabase
    .from('SketchPages')
    .select('*')
    .eq('sketch_id', sketch.id)
    .order('page_number', { ascending: true });

  if (error) {
    toastError({ title: 'Error', description: 'Failed to load sketch pages!' });
    return;
  }

  sketchPages.value = pages;
  if (sketchPages.value.length > 0) {
    currentPageNumber.value = 1;
    await loadPageActions(sketchPages.value[0].id); // Load actions for the first page
  }
};

// Load actions for a specific page
const loadPageActions = async (sketchpage_id) => {
  const { data: actions, error } = await supabase
    .from('PageActions')
    .select('*')
    .eq('sketchpage_id', sketchpage_id);

  if (error) {
    toastError({ title: 'Error', description: 'Failed to load page actions!' });
    return;
  }

  selectedPageActions.value = actions.length > 0 ? JSON.parse(actions[0].actionData) : [];
  signaturePad.value.fromData(selectedPageActions.value); // Load sketch data into the canvas
};

// Navigate to previous page
const prevPage = async () => {
  if (currentPageNumber.value > 1) {
    currentPageNumber.value--;
    const previousPage = sketchPages.value[currentPageNumber.value - 1];
    await loadPageActions(previousPage.id); // Load previous page actions
  }
};

// Navigate to next page
const nextSketchPage = async () => {
  if (currentPageNumber.value < sketchPages.value.length) {
    currentPageNumber.value++;
    const nextPage = sketchPages.value[currentPageNumber.value - 1];
    await loadPageActions(nextPage.id); // Load next page actions
  }
};

// Canvas sketching functions
const onSketchEnd = () => {
  const data = signaturePad.value.toData(); // Capture current sketch
  undoStack.value.push(data); // Save action for undo
  redoStack.value = []; // Clear redo stack after a new action
};

const undoAction = () => {
  if (undoStack.value.length > 0) {
    const lastAction = undoStack.value.pop(); // Remove last action
    redoStack.value.push(lastAction); // Save it for redo
    signaturePad.value.fromData(undoStack.value); // Re-render canvas without the last action
  }
};

const redoAction = () => {
  if (redoStack.value.length > 0) {
    const redoAction = redoStack.value.pop(); // Get last undone action
    undoStack.value.push(redoAction); // Re-add it to the actions
    signaturePad.value.fromData(undoStack.value); // Re-render canvas
  }
};

const saveCanvas = async () => {
  const user = await fetchUser();
  if (!user || !selectedSketch.value || sketchPages.value.length === 0) {
    toastError({ title: 'Error', description: 'User or Sketchbook not found!' });
    return;
  }

  const currentPage = sketchPages.value[currentPageNumber.value - 1];
  const sketchData = JSON.stringify(undoStack.value); // Convert the sketch actions to JSON

  try {
    const { data, error } = await supabase
      .from('PageActions')
      .upsert([{ sketchpage_id: currentPage.id, actionData: sketchData, user_id: user.id }], { onConflict: ['sketchpage_id'] });

    if (error) {
      toastError({ title: 'Error', description: 'Failed to save sketch!' });
    } else {
      toastSuccess({ title: 'Saved', description: 'Sketch saved successfully!' });
    }
  } catch (e) {
    console.error('Error saving canvas:', e);
    toastError({ title: 'Error', description: 'An error occurred while saving the sketch.' });
  }
};

const clearCanvas = () => {
  signaturePad.value.clear(); // Clear the canvas
  undoStack.value = []; // Reset undo stack
  redoStack.value = []; // Reset redo stack
};

const backToSketchbookList = () => {
  selectedSketch.value = null;
};

// On mounted, fetch the list of sketchbooks
onMounted(async () => {
  const { data: session, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Error retrieving session:", error);
  }
  console.log("Session in homepage:", session);
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
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.canvas-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.signature-canvas {
  width: 100%;
  height: 550px;
  border: 1px solid #ccc;
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

.sketchbooks-header {
  display: flex;
  justify-content: flex;
  align-items: center;
}

.add-sketchbook-button {
  display: flex;
  justify-content: flex-end;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.canvas-controls {
  display: flex;
  gap: 10px;
}

.pagination-controls {
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
