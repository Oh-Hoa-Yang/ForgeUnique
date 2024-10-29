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
                <h4><b>Sketchbook: {{ selectedSketch?.title }}</b> (Page {{ currentPageNumber }})</h4>
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
          <div class="signature-container">
            <vue-signature-pad ref="signaturePad" :options="signatureOptions" class="signature-canvas"
              @end="onSketchEnd" />
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
  canvasHeight: 800,
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

// onMounted should not try to access signaturePad at all since it won't be rendered yet  -- so console error for here is normal (for testing)
onMounted(async () => {
  user.value = await fetchUser();
  if (!user.value) {
    toastError({ title: 'Error', description: 'User is not authenticated!' });
    return;
  }

  //Ensure signaturePad is ready after the DOM is fully rendered
  await nextTick();

  if (signaturePad.value && typeof signaturePad.value.clear === 'function') {
    console.log('Signature pad initialized correctly');
  } else {
    console.error('Signature pad not initialized correctly');
  }


  await fetchSketchbooks(); // Fetch all sketchbooks on load
});

const monthlyBudget = ref(2000); // Fix for the missing "monthlyBudget"
const totalExpenses = ref(1500); // Fix for the missing "totalExpenses"
const todayExpenses = ref(50); // Fix for the missing "todayExpenses"
const todos = ref([{ id: 1, description: 'fyp project - Chap 3.4' }]); // Fix for the missing "todos"

const newSketchbookTitle = ref('');
const sketchbooks = ref([]);
const selectedSketch = ref(null); //For user to select the Sketchbook
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

  if (signaturePad.value && typeof signaturePad.value.fromDataURL === 'function') {
    console.log('Signature pad initialized correctly', signaturePad.value);
    //Load the canvas image
    await loadCanvasData();

  } else {
    console.log('Signature pad not initialized correctly');
  }
}

const isSaved = ref(true); //New flag to track if the sketch has been saved

//Function to handle canvas save
const saveCanvas = async () => {
  //Chcek the signatureURL whether is availble and has the methof toDataURL
  if (!signaturePad.value || typeof signaturePad.value.saveSignature !== 'function') {
    console.error('Signature pad not initialized or missing saveSignature method');
    toastError({ title: 'Error', description: 'Sketchpad is not ready. Try again.' });
    return;
  }

  //Get the current sketch data as a base64 image
  const sketchData = signaturePad.value.saveSignature('image/png'); // Get signature as a base64 data URl
  if (!sketchData) {
    console.error('Failed to generate data URL');
    return;
  }

  //Saving Canvas as image (base64 string)
  //Simplify Blob Creation
  const base64Data = sketchData.split(',')[1]
  const blob = await (await fetch(`data:image/png;base64,${base64Data}`)).blob()
  console.log("Blob object created:", blob);

  const fileName = `${selectedSketch.value.id}_${currentPageNumber.value}.png`; // Create a unique file name

  try {
    //Remove the existing image from Supabase storage (if it exists)
    const { error: deleteError } = await supabase
      .storage
      .from('sketches')
      .remove([fileName])

    if (deleteError && deleteError.statusCode !== '404') {
      //Log if the delete failed (ignore 404 errors since it means the file didn't exist)
      console.error('Error deleting previous image: ', deleteError);
      throw deleteError;
    }

    //Upload the Blob to Supabase Storage 
    const { error: uploadError } = await supabase
      .storage
      .from('sketches') //bucket name
      .upload(fileName, blob, { contentType: 'image/png', });

    if (uploadError) {
      console.error('Error uploading image:', uploadError); //Log full error
      throw uploadError;
    }

    //Get the public URL of the uploaded image
    const { data, error: urlError } = await supabase
      .storage
      .from('sketches')
      .getPublicUrl(fileName)

    if (urlError || !data.publicUrl) {
      console.error('Error fetching public URL: ', urlError)
      toastError({ title: 'Error', description: 'Failed to generate public URL for the image.' });
      return;
    }

    const publicUrl = data.publicUrl;
    console.log("Public URL of uploaded image:", publicUrl)

    //Save the image URL to the PageActions table 
    const currentPage = await getOrCreatePage(); //Get or create the current page
    const { error: pageError } = await supabase
      .from('PageActions')
      .upsert([{ actionData: publicUrl, sketchpage_id: currentPage.id }])
      .eq('sketchpage_id', currentPage.id)

    if (pageError) {
      console.error("Error saving public URL to PageActions:", pageError);
      throw pageError;
    }
    console.log("Successfully inserted public URL into PageActions table");

    //Disable undo/redo after saving 
    undoStack.value = [];
    redoStack.value = [];

    toastSuccess({ title: 'Success', description: 'Sketch saved successfully!' });
    isSaved.value = true; //Set the flag to true after saving
  } catch (error) {
    console.error('Error uploading image:', error);
    toastError({ title: 'Error', description: 'Failed to upload sketch image!' });
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

    if (error) {
      console.error('Error creating or fetching page:', error);
      throw error;
    }

    currentPage = data;
  }
  console.log('Fetching or created current page:', currentPage);
  return currentPage;
};

const fetchPage = async (pageNumber) => {
  try {
    const { data, error } = await supabase
      .from('SketchPages')
      .select('*')
      .eq('page_number', pageNumber)
      .eq('sketch_id', selectedSketch.value.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching page:', error);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Unexpected error fetching page:', error);
    return null;
  }
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
    isSaved.value = false; //Set the flag to false when there is a new sketch
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
    if (!isSaved.value) {
      await saveCanvas(); // Save the current page before navigating
    }
    currentPageNumber.value--;
    await loadCanvasData();
  }
};

const nextSketchPage = async () => {
  if (!isSaved.value) {
    await saveCanvas(); // Save the current page before navigating
  }
  currentPageNumber.value++;
  await loadCanvasData();
};

const loadCanvasData = async () => {
  const currentPage = await fetchPage(currentPageNumber.value);

  if (!currentPage || !currentPage.id) {
    console.error('Invalid page');
    return;
  }

  //Fetch the actionData (image URL) from PageActions table using sketchpage_id
  const { data, error } = await supabase
    .from('PageActions')
    .select('actionData')
    .eq('sketchpage_id', currentPage.id)
    .single() //Assuming onepage can have one image, hence using 'single'

  if (error) {
    console.error('Error fetching image from PageActions:', error);
    signaturePad.value.clear();
    return;
  }

  if (data && data.actionData) {
    const imageUrl = data.actionData;
    console.log('Image URL fetched: ', imageUrl);

    //Ensure signaturePad is available and initialized 
    if (signaturePad.value && typeof signaturePad.value.fromDataURL === 'function') {
      //Load the image into canvas 
      signaturePad.value.fromDataURL(imageUrl);
      console.log('Image loaded on canvas');
    } else {
      console.error('Signature pad not initialized properly');
    }
  } else {
    signaturePad.value.clear();  //Ckear the canvas if no image is found
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
  await supabase
    .storage
    .from('sketches')
    .remove([`${selectedSketch.value.id}_${currentPageNumber.value}.png`])
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

.signature-container {
  width: 100%;
  height: 1200px;
  position: relative;
}

.signature-canvas {
  touch-action: none;
  /* Prevent touch scrolling on the canvas */
  /* -ms-touch-action: none; */
  /* For Internet Explorer */
  /* -webkit-user-select: none; */
  /* Disable user selection for Webkit-based browsers */
  user-select: none;
  /* Disable user selection */
  width: 100% !important;
  height: 100% !important;
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
