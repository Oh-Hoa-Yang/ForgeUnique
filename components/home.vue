<template>
  <ion-content class="custom-background">
    <div class="container">
      <!-- Expense and To-Do List Sections (first row) -->
      <div class="row">
        <!-- Expense Section (Button Behavior) -->
        <button class="expense-button" @click="router.push('/expensehome')">
          <div class="expense">
            <h3 style="text-align: center; font-weight: bold;">Expense</h3>
            <p><b>Monthly Budget:</b> <br>{{ monthlyBudget }} MYR</p><br>
            <p><b>Total Monthly Expenses:</b><br> {{ totalExpenses }} MYR</p><br>
            <p><b>Today Expenses:</b> <br>{{ todayExpenses }} MYR</p>
          </div>
        </button>

        <!-- To-Do List Section -->
        <div class="todo-list">
          <h3 style="text-align: center; font-weight: bold;">To-Do List</h3>
          <ul>
            <li v-for="item in todos" :key="item.id">
              {{ item.description }}
              <button @click="editItem(item)" slot="end">✏️</button>
              <button @click="deleteItem(item)">❌</button>
              <button @click="markAsComplete(item)">✔️</button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Sketching Plan Section -->
      <div class="sketch-plan">
        <h3 style="text-align: center; font-weight: bold;">Sketching Plan</h3>

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
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h4>Available Sketchbooks</h4>
              <button @click="openModal" style="font-size: 24px; padding: 5px 10px; color: #FD8395">+</button>
            </div>
            <ul>
              <li v-for="sketch in paginatedSketchbooks" :key="sketch.id"
                :class="{ active: selectedSketch === sketch.id }">
                <span @click="selectSketchbook(sketch)">
                  {{ sketch.title }}
                </span>
                <div style="display: flex; justify-content: end; align-items: center;">
                  <button @click.stop="openEditModal(sketch)">✏️</button>
                  <button @click.stop="deleteSketchbook(sketch.id)">❌</button>
                </div>
              </li>
            </ul>
            <br>
            <div style="display: flex; justify-content: space-between;">
              <button @click="previousPage" :disabled="currentPage === 1" style="color: #FD8395;">
                <<<< </button>
                  <span>Page {{ currentPage }} of {{ totalPages }}</span>
                  <button @click="nextPage" :disabled="currentPage === totalPages" style="color: #FD8395;">>>></button>
            </div>
          </div>
        </div>

        <!-- Sketching Canvas Section  SECOND PART OF SKETCHING PLAN -->
        <div v-if="selectedSketch">
          <div style="display: flex; align-items: center;">
            <button @click="backToSketchbookList">
              < </button>
                <h4><b>Sketchbook: {{ selectedSketch.title }}</b> (Page {{ currentPageNumber }})</h4>
          </div>

          <!-- Tool Selection -->
          <div class="tool-selection">
            <button @click="selectTool('pencil')">✏️ Pencil</button>
            <button @click="selectTool('blue')">🔵 Blue</button>
            <button @click="selectTool('red')">🔴 Red</button>
            <button @click="selectTool('eraser')">🧽 Eraser</button>
          </div>

          <div class="canvas-controls">
            <button @click="prevPage">Previous</button>
            <button @click="undoAction">Undo</button>
            <button @click="redoAction">Redo</button>
            <button @click="saveCanvas">Save</button>
            <button @click="nextSketchPage">Next</button>
          </div>

          <!-- Sketch Canvas -->
          <vue-signature-pad :options="signatureOptions" ref="signaturePad" @end="onSketchEnd"
            class="signature-canvas" />
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
import { useAppToast } from '~/composables/useAppToast';
import { useAuthUser } from '~/composables/useAuthUser';
import { VueSignaturePad } from '@selemondev/vue3-signature-pad';
import { _backgroundColor, _maxWidth } from '#tailwind-config/theme';
import { nextTick } from 'vue';

const { toastError, toastSuccess } = useAppToast();
const { fetchUser } = useAuthUser();
const user = ref(null);

//Signature Pad Options in Sketch Canvas of template
const signatureOptions = ref({
  penColor: 'black',
  backgroundColor: 'white',
  maxWidth: 2,
  minwidth: 2,
  canvasWidth: 728,
  canvasHeight: 550,
})

const selectTool = (tool) => {
  if (tool === 'pencil') {
    signatureOptions.value.penColor = 'black'; // Set to black
  } else if (tool === 'blue') {
    signatureOptions.value.penColor = 'blue'; // Set to blue
  } else if (tool === 'red') {
    signatureOptions.value.penColor = 'red'; // Set to red
  } else if (tool === 'eraser') {
    signatureOptions.value.penColor = 'white'; // Set to eraser (white)
  }
}

const signaturePad = ref(null) //Refer to the Sketch Canvas of template too for vue-signature-pad


onMounted(async () => {
  user.value = await fetchUser();
  if (!user.value) {
    toastError({ title: 'Error', description: 'User is not authenticated!' });
    return;
  }
  await fetchSketchbooks(); // Fetch all sketchbooks on load
});

const monthlyBudget = ref(2000); // Fix for the missing "monthlyBudget"
const totalExpenses = ref(1500); // Fix for the missing "totalExpenses"
const todayExpenses = ref(50); // Fix for the missing "todayExpenses"
const todos = ref([{ id: 1, description: 'fyp project - Chap 3.4' }]); // Fix for the missing "todos"

const newSketchbookTitle = ref('');
const sketchbooks = ref([]);
const selectedSketch = ref(null);
const showModal = ref(false);
const showEditModal = ref(false);
const editedSketchbookTitle = ref('');

// Add the missing ref for the edited sketchbook
const editedSketchbook = ref(null);

const currentPage = ref(1);
const itemsPerPage = ref(5);
const totalPages = ref(1);

const currentPageNumber = ref(1); //CANVAS use

const supabase = useSupabaseClient();

// Fetch sketchbooks in A to Z order
const fetchSketchbooks = async () => {
  if (!user.value || !user.value.id) {
    toastError({ title: 'Error', description: 'User not found!' });
    return;
  }

  try {
    const { data, error } = await supabase
      .from('Sketches')
      .select('*')
      .eq('user_id', user.value.id)
      .order('title', { ascending: true });

    if (error) throw error;

    sketchbooks.value = data;
    totalPages.value = Math.ceil(data.length / itemsPerPage.value);
  } catch (error) {
    toastError({ title: 'Error', description: 'Failed to fetch sketchbooks!' });
  }
};

// Function to handle sketchbook and load its details ---- CANVAS PART - need to save page in supabase
const selectSketchbook = async (sketch) => {
  selectedSketch.value = sketch;
  currentPageNumber.value = 1; //Reset page number when sketch is selected
  // Wait for the sketchbook canvas to render before interacting with it 
  await nextTick();

  if (!signaturePad.value) {
    console.error('Signature pad not initialized correctly');
  } else {
    console.log('Signature pad initialized correctly');
  }
}

const saveCanvas = async () => {
  const sketchData = signaturePad.value.saveSignature(); // Get signature as data 
  const currentPage = await getOrCreatePage(); // Get or create the current page

  try {
    const { data, error } = await supabase
      .from('PageActions')
      .insert([{ actionData: sketchData, sketchpage_id: currentPage.id }]);

    if (error) {
      toastError({ title: 'Error', description: 'Failed to save sketch data!' });
    } else {
      toastSuccess({ title: 'Success', description: 'Sketch saved successfully!' });
    }
  } catch (e) {
    console.error('Error saving sketch:', e);
  }
}

const getOrCreatePage = async () => {
  let currentPage = await fetchPage(currentPageNumber.value);

  if (!currentPage) {
    const { data, error } = await supabase
      .from('SketchPages')
      .insert([{ page_number: currentPageNumber.value, sketch_id: selectedSketch.value.id }])
      .select('*')
      .single();

    currentPage = data;
  }

  return currentPage;
};

const fetchPage = async (pageNumber) => {
  const { data, error } = await supabase
    .from('SketchPages')
    .select('*')
    .eq('page_number', pageNumber)
    .eq('sketch_id', selectedSketch.value.id)
    .single();

  if (error) {
    return null;
  }

  return data;
};

//UNDO AND REDO Actions
const undoStack = ref([]);
const redoStack = ref([]);

const onSketchEnd = async () => {
  const data = signaturePad.value.toData();

  if (data && data.length > 0) {
    undoStack.value.push(data); // Save current state for undo
    redoStack.value = []; // Clear redo stack on a new action
    console.log('undo stack updated:', undoStack.value);
  } else {
    console.log('No drawing actions detected, skipping save to undo stack.')
  }
};

const undoAction = () => {
  if (undoStack.value.length > 1) {
    redoStack.value.push(undoStack.value.pop()); //Move last state to redo stack
    signaturePad.value.fromData(undoStack.value[undoStack.value.length - 1]); // Load the previous state
  } else {
    console.log('No more undo actions available')
  }
};

const redoAction = () => {
  if (redoStack.value.length > 0) {
    const lastRedo = redoStack.value.pop();
    undoStack.value.push(lastRedo); //Add the last redo action to undo stack
    signaturePad.value.fromData(lastRedo); // Load the redo state   -- undoStack.value
  } else {
    console.log('No more redo actions available');
  }
};

//PAGE NAV FOR SKETCH - CANVAS
const prevPage = async () => {
  if (currentPageNumber.value > 1) {
    await saveCanvas(); // Save the current page before navigating
    currentPageNumber.value--;
    await loadCanvasData();
  }
};

const nextSketchPage = async () => {
  await saveCanvas(); // Save the current page before navigating
  currentPageNumber.value++;
  await loadCanvasData();
};

const loadCanvasData = async () => {
  const page = await fetchPage(currentPageNumber.value);

  if (page) {
    const { data, error } = await supabase
      .from('PageActions')
      .select('*')
      .eq('sketchpage_id', page.id)
      .single();

    if (data && data.actionData) {
      signaturePad.value.fromData(JSON.parse(data.actionData)); // Load sketch data
    } else {
      signaturePad.value.clear(); // Clear canvas if no data exists
    }
  } else {
    signaturePad.value.clear(); // Clear canvas if no data exists
  }
};


//BACK FUNCTION FOR CANVAS TO BOOK TITLE SELECTION
const backToSketchbookList = () => {
  selectedSketch.value = null; // Clear the selected sketch
  signaturePad.value.clear(); // Clear the canvas
};


// Create a new sketchbook
const createSketchbook = async () => {
  if (!newSketchbookTitle.value) {
    toastError({ title: 'Error', description: 'Please enter a title!' });
    return;
  }

  try {
    const { data, error } = await supabase
      .from('Sketches')
      .insert([{ title: newSketchbookTitle.value, user_id: user.value.id }]);

    if (error) throw error;

    toastSuccess({ title: 'Success', description: 'Sketchbook created successfully!' });
    closeModal();
    await fetchSketchbooks(); // Refresh list after creation
  } catch (error) {
    toastError({ title: 'Error', description: 'Failed to create sketchbook!' });
  }
};

// Edit a sketchbook title
const editSketchbookTitle = async () => {
  if (!editedSketchbook.value || !editedSketchbookTitle.value) {
    toastError({ title: 'Error', description: 'Please select a sketchbook and enter a new title!' });
    return;
  }

  try {
    const { data, error } = await supabase
      .from('Sketches')
      .update({ title: editedSketchbookTitle.value }) // Updating the title
      .eq('id', editedSketchbook.value.id); // Matching the sketchbook by ID

    if (error) {
      console.error('Error updating sketchbook:', error); // Debugging log
      toastError({ title: 'Error', description: 'Failed to update sketchbook!' });
    } else {
      toastSuccess({ title: 'Success', description: 'Sketchbook updated successfully!' });
      closeEditModal();
      await fetchSketchbooks(); // Refresh list after update
    }
  } catch (e) {
    console.error('Unexpected error:', e);
    toastError({ title: 'Error', description: 'An error occurred while updating the sketchbook title.' });
  }
};

// Delete a sketchbook
const deleteSketchbook = async (sketchId) => {
  try {
    const { error } = await supabase
      .from('Sketches')
      .delete()
      .eq('id', sketchId);

    if (error) throw error;

    toastSuccess({ title: 'Success', description: 'Sketchbook deleted successfully!' });
    await fetchSketchbooks(); // Refresh list after deletion
  } catch (error) {
    toastError({ title: 'Error', description: 'Failed to delete sketchbook!' });
  }
};

// Modal control
const openModal = () => showModal.value = true;
const closeModal = () => {
  showModal.value = false;
  newSketchbookTitle.value = '';
};

const openEditModal = (sketch) => {
  editedSketchbook.value = sketch;  // Make sure the sketch object is passed and assigned correctly
  editedSketchbookTitle.value = sketch.title; // Set the current title for editing
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editedSketchbookTitle.value = '';
};

// Pagination
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
  border-radius: 10px;
}

.todo-list {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
}

.sketch-plan {
  background-color: #fff;
  padding: 10px;
  border-radius: 8px;
}

.signature-canvas {
  touch-action: none;
  /* Prevent touch scrolling on the canvas */
  -ms-touch-action: none;
  /* For Internet Explorer */
  -webkit-user-select: none;
  /* Disable user selection */
  user-select: none;
  width: 100%;
  height: 550px;
  border: 1px solid #ccc;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
}

.canvas-controls,
.tool-selection {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}
</style>
