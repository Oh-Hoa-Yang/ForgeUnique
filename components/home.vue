<template>
  <div class="custom-background">
    <!-- <PullRefresh v-model="loading" @refresh="handleRefresh"
      style="background-color: #FFD6E5; color: black; font-weight: bold;" pulling-text="Pull to refresh"
      loosing-text="Release to refresh" loading-text="Loading..." success-text="Refreshed successfully"
      success-duration="500" animation-duration="300" head-height="50"> -->

      <div class="container mx-auto">
        <!-- Expense and To-Do List Sections (first row) -->
        <div class="row">
          <!-- Expense Section (Button Behavior) -->
          <button class="expense-button" @click="router.push('/expensehomepage')">
            <div class="expense">
              <h3 style="text-align: center; font-weight: bold;">Expense</h3>
              <p><b>Monthly Budget:</b> <br>{{ budget }} MYR</p><br>
              <p><b>Total Monthly Expenses:</b><br> {{ monthlyExpense }} MYR</p><br>
              <p><b>Today Expenses:</b> <br>{{ todayExpense }} MYR</p>
              <br>
              <p class="text-start font-italic">Click this section to manage your expenses.</p>
            </div>
          </button>
  
          <!-- To-Do List Section -->
          <div class="todo-list">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h3 style="font-weight: bold;">To-Do List</h3>
              <button @click="openAddTodoModal" style="font-size: 24px; padding: 5px 10px; color: #FD8395;">+</button>
            </div>
            <ul>
              <li v-for="todo in paginatedTodos" :key="todo.id"
                style="display: flex; justify-content: space-between; align-items: center;">
                <span :class="{ priority: todo.todosPriority }">{{ todo.todosPriority }}</span>
                <h4 class="text-start mx-9">{{ todo.todosDescription }}</h4>
                <div class="flex flex-row whitespace-nowrap gap-2">
                  <button @click="editItem(todo)"><span class="line-md--edit-twotone"></span></button>
                  <button @click="confirmDelete(todo.id)"><span class="ic--twotone-delete"></span></button>
                  <button v-if="todo.todosStatus === 'incomplete'" @click="confirmComplete(todo)"><span
                      class="hugeicons--task-done-01"></span></button>
                </div>
              </li>
            </ul>
            <!-- Add Pagination Controls -->
            <div v-if="todos.length > 0" style="display: flex; justify-content: space-between; margin-top: 10px;">
              <button @click="previousTodoPage" :disabled="currentTodoPage === 1" style="color: #FD8395;">
                <<<</button>
              <span>Page {{ currentTodoPage }} of {{ totalTodoPages }}</span>
              <button @click="nextTodoPage" :disabled="currentTodoPage === totalTodoPages" style="color: #FD8395;">>>></button>
            </div>
          </div>
        </div>
  
        <!-- Add/Edit Modal -->
        <div v-if="showAddEditModal" class="modal-overlay">
          <div class="modal-content">
            <h3 style="text-align: center; font-weight: bold;">{{ isEditing ? 'Edit To-Do' : 'Add To-Do' }}</h3>
            <form @submit.prevent="saveTodo">
              <ion-label>Description</ion-label>
              <ion-input v-model="currentTodo.todosDescription" placeholder="Description" required />
  
              <ion-label>Priority</ion-label>
              <ion-input v-model.number="currentTodo.todosPriority" placeholder="Priority (e.g., 1, 2, 3)" required
                type="number" />
  
              <ion-label>Deadline</ion-label>
              <ion-input v-model="currentTodo.todosDeadline" type="datetime-local" required />
  
              <div style="text-align: center; margin-top: 15px;">
                <ion-button type="submit">Save</ion-button>
                <ion-button @click="closeTodosModal">Cancel</ion-button>
              </div>
            </form>
          </div>
        </div>
  
        <!-- Confirmation Modal for Delete/Complete -->
        <div v-if="showConfirmationModal" class="modal-overlay">
          <div class="modal-content">
            <p>Want to make this listing as {{ confirmationAction }}? </p>
            <div style="text-align: center; margin-top: 15px;">
              <ion-button @click="confirmAction">Yes</ion-button>
              <ion-button @click="closeConfirmationModal">No</ion-button>
            </div>
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
                  :class="{ active: selectedSketch === sketch.id }" style="border-bottom: 3px solid #f0f0f0;">
                  <span @click="selectSketchbook(sketch)">
                    {{ sketch.title }}
                  </span>
                  <div style="display: flex; justify-content: end; align-items: center;">
                    <button @click.stop="openEditModal(sketch)"><span class="line-md--edit-twotone"></span></button>
                    <button @click.stop="deleteSketchbook(sketch.id)"><span class="ic--twotone-delete"></span></button>
                  </div>
                </li>
              </ul>
              <br>
              <div style="display: flex; justify-content: space-between;">
                <button @click="previousPage" :disabled="currentPage === 1" style="color: #FD8395;">
                  <<<< </button>
                    <span>Page {{ currentPage }} of {{ totalPages }}</span>
                    <button @click="nextPage" :disabled="currentPage === totalPages"
                      style="color: #FD8395;">>>></button>
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
              <button @click="selectTool('black')">⚫️ Black</button>
              <button @click="selectTool('blue')">🔵 Blue</button>
              <button @click="selectTool('red')">🔴 Red</button>
              <button @click="selectTool('eraser')"><span class="solar--eraser-bold-duotone"></span> Eraser</button>
            </div>
  
            <div class="canvas-controls">
              <button @click="prevPage">Previous</button>
              <button @click="saveCanvas">Save</button>
              <button @click="nextSketchPage">Next</button>
            </div>
  
            <!-- Sketch Canvas -->
            <div class="h-screen">
              <div class="signature-container h-full border border-black-100">
                <vue-signature-pad 
                  ref="signaturePad" 
                  :options="signatureOptions"  
                  class="signature-canvas"
                  @end="onSketchEnd" 
                />
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
    <!-- </PullRefresh> -->
  </div>
</template>

<script setup>
import { useAppToast } from '~/composables/useAppToast';
import { useAuthUser } from '~/composables/useAuthUser';
import { VueSignaturePad } from '@selemondev/vue3-signature-pad';
import { _backgroundColor, _maxWidth } from '#tailwind-config/theme';
import { nextTick } from 'vue';
// import PullRefresh from 'pull-refresh-vue3';
import { onIonViewWillEnter } from '@ionic/vue';

const loading = ref(false);
// const handleRefresh = async () => {
//   try {
//     loading.value = true; // Start loading
//     await fetchExpenses();
//   } catch (error) {
//     console.error('Refresh error:', error);
//     toastError({ title: 'Error', description: 'Failed to refresh data.' });
//   } finally {
//     loading.value = false; // Stop loading
//   }
// };

const { toastError, toastSuccess } = useAppToast();
const { fetchUser } = useAuthUser();
const user = useSupabaseUser();
const supabase = useSupabaseClient();

const router = useRouter();

// Comment out appState
// const appState = inject('appState');
// if (!appState) {
//   console.error('Failed to inject appState. Ensure App.vue provides it.');
// }

// Direct refs for local state
const monthlyExpense = ref(0);
const todayExpense = ref(0);
const budget = ref(0);

// Initialize data
const initializeData = async () => {
  try {
    // Make sure we have a user
    if (!user.value) {
      user.value = await fetchUser();
      if (!user.value) {
        toastError({ title: 'Error', description: 'User is not authenticated!' });
        return;
      }
    }
    await refreshAllData();
  } catch (error) {
    console.error('Error initializing data:', error);
    toastError({ title: 'Error', description: 'Failed to initialize data' });
  }
};

// Fetch budget from Supabase
const fetchBudget = async () => {
  if (!user.value) {
    console.log('No user found for fetching budget');
    return;
  }

  try {
    console.log('Fetching budget for user:', user.value.id);
    const { data, error } = await supabase
      .from('Users')
      .select('budget')
      .eq('user_id', user.value.id)
      .single() 

    if (error) throw error;

    budget.value = data?.budget || 0;
    console.log('Fetched budget:', budget.value);
  } catch (err) {
    console.error('Error fetching budget from supabase:', err.message);
    toastError({ title: 'Error', description: 'Failed to fetch budget' });
  }
};

// //Reactive state for budget 
// const budget = computed(() => {
//   if (appState.budget === 0) {
//     fetchBudget().then((fetchedBudget) => { 
//       appState.budget = fetchedBudget; // Update appState after manual fetch
//     });
//   }
//   return appState.budget;
// })

const fetchExpenses = async () => {
  if (!user.value) {
    console.log('No user found for fetching expenses');
    return;
  }

  try {
    console.log('Fetching expenses for user:', user.value.id);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based

    // Create a new Date object for Malaysia's current time (UTC+8)
    const malaysiaDate = new Date(currentDate.toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
    
    // Format Malaysia's date to YYYY-MM-DD for comparison
    const malaysiaDateString = malaysiaDate.toLocaleString('en-US', { 
      timeZone: 'Asia/Kuala_Lumpur',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).split('/').join('-');

    console.log('Current Malaysia Date:', malaysiaDateString);

    const { data: expenses, error } = await supabase
      .from('Expenses')
      .select('expenseAmount, expenseDate')
      .eq('user_id', user.value.id);

    if (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }

    console.log('Fetched expenses:', expenses);

    // Calculate monthly expenses
    const total = expenses ? expenses.filter((expense) => {
      const expenseDate = new Date(expense.expenseDate);
      return (
        expenseDate.getFullYear() === currentYear &&
        expenseDate.getMonth() + 1 === currentMonth
      );
    })
    .reduce((sum, expense) => sum + (expense.expenseAmount || 0), 0)
    : 0;

    // Calculate today's expenses (using Malaysia timezone)
    const todayTotal = expenses ? expenses
      .filter(expense => {
        console.log('Comparing expense date:', expense.expenseDate, 'with Malaysia date:', malaysiaDateString);
        // Convert both dates to YYYY-MM-DD format for comparison
        const expenseDateObj = new Date(expense.expenseDate);
        const expenseDateString = expenseDateObj.toLocaleString('en-US', {
          timeZone: 'Asia/Kuala_Lumpur',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).split('/').join('-');
        
        return expenseDateString === malaysiaDateString;
      })
      .reduce((sum, expense) => sum + (expense.expenseAmount || 0), 0)
      : 0;

    console.log('Monthly total:', total);
    console.log('Today total:', todayTotal);

    monthlyExpense.value = total;
    todayExpense.value = todayTotal;

  } catch (err) {
    console.error('Error fetching expenses from Supabase:', err.message);
    toastError({ title: 'Error', description: 'Failed to fetch expenses' });
  }
};

// Signature Pad Options in Sketch Canvas of template
const signatureOptions = ref({
  penColor: 'black',
  backgroundColor: 'white',
  maxWidth: 0.5,
  minwidth: 0.5,
  canvasWidth: 728,
  canvasHeight: 800,
})

const selectTool = (tool) => {
  if (tool === 'black') {
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
  if (!signaturePad.value || typeof signaturePad.value.saveSignature !== 'function') {
    console.error('Signature pad not initialized or missing saveSignature method');
    toastError({ title: 'Error', description: 'Sketchpad is not ready. Try again.' });
    return;
  }

  // Get the current sketch data as a base64 image
  const sketchData = signaturePad.value.saveSignature('image/png'); // Get signature as a base64 data URL
  if (!sketchData) {
    console.error('Failed to generate data URL');
    return;
  }

  // Simplify Blob Creation
  const base64Data = sketchData.split(',')[1];
  const blob = await (await fetch(`data:image/png;base64,${base64Data}`)).blob();
  console.log('Blob object created:', blob);

  // Unique file name for the current page (ensures only one file per page)
  const fileName = `${selectedSketch.value.id}_${currentPageNumber.value}.png`; // Fixed file name for the page

  try {
    // Step 1: Remove the existing image (if any)
    const { error: deleteError } = await supabase
      .storage
      .from('sketches') // Ensure this matches your bucket name
      .remove([fileName]);

    if (deleteError && deleteError.statusCode !== 404) {
      // Ignore 404 errors (file does not exist)
      console.error('Error deleting previous image:', deleteError);
      throw deleteError;
    }

    console.log('Existing file deleted successfully or did not exist.');

    // Step 2: Upload the new Blob to Supabase Storage
    const { error: uploadError } = await supabase
      .storage
      .from('sketches') // Ensure this matches your bucket name
      .upload(fileName, blob, { contentType: 'image/png' });

    if (uploadError) {
      console.error('Error uploading new image:', uploadError);
      throw uploadError;
    }

    console.log('New image uploaded successfully.');

    // Step 3: Get the public URL of the uploaded image
    const { data, error: urlError } = await supabase
      .storage
      .from('sketches')
      .getPublicUrl(fileName);

    if (urlError || !data.publicUrl) {
      console.error('Error fetching public URL:', urlError);
      toastError({ title: 'Error', description: 'Failed to generate public URL for the image.' });
      return;
    }

    const publicUrl = data.publicUrl;
    console.log('Public URL of uploaded image:', publicUrl);

    // Step 4: Save or update the URL in the database
    const currentPage = await getOrCreatePage();
    const { data: existingPageAction, error: fetchError } = await supabase
      .from('PageActions')
      .select('*')
      .eq('sketchpage_id', currentPage.id)
      .maybeSingle();

    if (fetchError) {
      console.error('Error checking for existing PageActions record:', fetchError);
      return;
    }

    if (existingPageAction) {
      // Update the existing record with the new image URL
      const { error: updateError } = await supabase
        .from('PageActions')
        .update({ actionData: publicUrl }) // Update with the new URL
        .eq('id', existingPageAction.id); // Match by the existing record's ID

      if (updateError) {
        console.error('Error updating PageActions:', updateError);
        throw updateError;
      }

      console.log('Successfully updated PageActions table.');
    } else {
      // No existing record, insert a new one
      const { error: insertError } = await supabase
        .from('PageActions')
        .insert([{ actionData: publicUrl, sketchpage_id: currentPage.id }]);

      if (insertError) {
        console.error('Error saving to PageActions:', insertError);
        throw insertError;
      }

      console.log('Successfully inserted into PageActions table.');
    }

    // Step 5: Clear undo/redo stacks after saving
    undoStack.value = [];
    redoStack.value = [];
    toastSuccess({ title: 'Success', description: 'Sketch saved successfully!' });
    isSaved.value = true; // Set the flag to true after saving
  } catch (error) {
    console.error('Error during saveCanvas:', error);
    toastError({ title: 'Error', description: 'Failed to save sketch!' });
  }
};


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

    if (!data) {
      console.log('No data found for page', pageNumber);
      return null;
    }

    console.log('Fetching page data: ', data);
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

const   loadCanvasData = async () => {
  // Ensure the signaturePad is initialized 
  if (!signaturePad.value) {
    console.error('Signature pad is not initialized.');
    return;
  }

  //Clear the canvas first before loading any data
  signaturePad.value.clearCanvas();

  const currentPage = await fetchPage(currentPageNumber.value);

  if (!currentPage || !currentPage.id) {
    console.log('No page data found for page', currentPageNumber.value);
    return;
  }

  try {
    //Fetch the actionData (image URL) from PageActions table using sketchpage_id
    const { data, error } = await supabase
      .from('PageActions')
      .select('actionData')
      .eq('sketchpage_id', currentPage.id)
      .maybeSingle() //Safely handle cases where no rows are found

    if (error) {
      throw new Error('Error fetching image from PageActions:' + error.message);
    }

    if (data && data.actionData) {
      const imageUrl = data.actionData;

      //Ensure signaturePad is available and initialized 
      if (signaturePad.value && typeof signaturePad.value.fromDataURL === 'function') {
        // Force a fresh fetch of the image by adding a timestamp
        const timestamp = new Date().getTime();
        const imageUrlWithTimestamp = `${imageUrl}?t=${timestamp}`;
        //Load the image into canvas 
        signaturePad.value.fromDataURL(imageUrlWithTimestamp);
        console.log('Image loaded on canvas with timestamp:', timestamp);
      } else {
        console.error('Signature pad not initialized properly');
      }
    } else {
      console.log('No image found for the current page, clearing the canvas')
      signaturePad.value.clearCanvas();  //Clear the canvas if no image is found
    }
  } catch (error) {
    console.error('Error fetching image from PageActions: ', error)
  }
}

const nextSketchPage = async () => {
  if (!isSaved.value) {
    await saveCanvas(); // Save the current page before navigating
  }

  currentPageNumber.value++;
  await nextTick();

  //Explicitly clear the canvas before loading the new page
  if (signaturePad.value && typeof signaturePad.value.clear === 'function') {
    signaturePad.value.clear();
  }

  await loadCanvasData();
  // Reset undo/redo stacks for the new page
  undoStack.value = [];
  redoStack.value = [];
};

const prevPage = async () => {
  if (currentPageNumber.value > 1) {
    if (!isSaved.value) {
      await saveCanvas(); // Save the current page before navigating
    }

    currentPageNumber.value--;
    await nextTick();

    //Explicitly clear the canvas before loading the previous page 
    if (signaturePad.value && typeof signaturePad.value.clear === 'function') {
      signaturePad.value.clear();
    }
    await loadCanvasData();
    // Reset undo/redo stacks for the new page
    undoStack.value = [];
    redoStack.value = [];
  } else {
    console.log('You are already on the first page')
  }
};

// Add a watch on currentPageNumber to ensure fresh data is loaded when page changes
watch(currentPageNumber, async (newPage, oldPage) => {
  if (newPage !== oldPage) {
    await loadCanvasData();
  }
});

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
    // Step 1: Fetch all associated pages for the sketchbook
    const { data: pages, error: fetchPagesError } = await supabase
      .from('SketchPages')
      .select('id, page_number')
      .eq('sketch_id', sketchId);

    if (fetchPagesError) {
      throw new Error('Error fetching associated pages: ' + fetchPagesError.message);
    }

    // Step 2: Construct file names for deletion
    const fileNames = pages.map((page) => `${sketchId}_${page.page_number}.png`);

    if (fileNames.length === 0) {
      console.log('No files to delete from storage.');
    } else {
      console.log('Files to be deleted:', fileNames);

      // Step 3: Delete files from Supabase storage
      const { error: deleteFilesError } = await supabase
        .storage
        .from('sketches') // Ensure this matches your storage bucket name
        .remove(fileNames);

      if (deleteFilesError) {
        throw new Error('Error deleting files from storage: ' + deleteFilesError.message);
      }

      console.log('Files deleted successfully from storage.');
    }

    // Step 4: Delete the sketchbook from the database (this cascades pages and actions)
    const { error: deleteSketchbookError } = await supabase
      .from('Sketches')
      .delete()
      .eq('id', sketchId);

    if (deleteSketchbookError) {
      throw new Error('Error deleting sketchbook: ' + deleteSketchbookError.message);
    }

    // Success notification
    toastSuccess({
      title: 'Success',
      description: 'Sketchbook and all associated data deleted successfully!',
    });

    // Refresh the sketchbooks list
    await fetchSketchbooks();
  } catch (error) {
    console.error('Error during deletion:', error);
    toastError({
      title: 'Error',
      description: 'Failed to delete sketchbook and associated files.',
    });
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

//TO-dos part 
const todos = ref([]);
const showAddEditModal = ref(false);
const showConfirmationModal = ref(false);
const confirmationAction = ref('');
const isEditing = ref(false);
const currentTodo = ref({});
const todoToDelete = ref(null);

const fetchTodos = async () => {
  const { data, error } = await supabase
    .from('ToDoLists')
    .select('*')
    .order('todosPriority', { ascending: true })
    .eq('user_id', user.value.id)
  if (!error) {
    todos.value = data;
    console.log('Fetched todos:', todos.value);
  } else {
    console.error('Error fetching todos:', error.message);
  }
};

onMounted(fetchTodos);

//Open modal to add a new to-do item
const openAddTodoModal = () => {
  currentTodo.value = { todosDescription: '', todosPriority: '', todosDeadline: '', todosStatus: 'incomplete' };
  isEditing.value = false;
  showAddEditModal.value = true;
};

//Open modal to edit an existing to-do item
const editItem = (todo) => {
  currentTodo.value = { ...todo };
  isEditing.value = true;
  showAddEditModal.value = true; // Use showAddEditModal to toggle the modal for both add and edit
};

//Save to-do item (either new or update existing)
const saveTodo = async () => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Error fetching session:', sessionError.message);
      return;
    }

    const userEmail = user.value.email;
    if (!userEmail) {
      console.error('User is not authenticated');
      return;
    }

    if (isEditing.value) {
      //Update todo
      const { error } = await supabase
        .from('ToDoLists')
        .update({ ...currentTodo.value, userEmail: userEmail })
        .eq('id', currentTodo.value.id);

      if (error) {
        console.error('Error updating todo:', error.message);
        toastError({ title: 'Error', description: 'Failed to update the todos.' });
      }
    } else {
      //Add new todo
      const { error } = await supabase
        .from('ToDoLists')
        .insert([{ ...currentTodo.value, userEmail: userEmail, user_id: user.value.id }])
      if (error) {
        console.error('Error adding new todo:', error.message);
        toastError({ title: 'Error', description: 'Failed to add the todos.' });
      }
    }
    closeTodosModal();
    fetchTodos();
    toastSuccess({ title: 'Success', description: 'To-Do item saved successfully!' });
  } catch (error) {
    console.error('Error saving todo: ', error);
  }
};

const closeTodosModal = () => showAddEditModal.value = false;

const confirmDelete = (id) => {
  confirmationAction.value = 'delete';
  todoToDelete.value = id;
  showConfirmationModal.value = true;
};

const confirmComplete = (todo) => {
  confirmationAction.value = 'complete';
  todoToDelete.value = todo.id;
  currentTodo.value = { ...todo, todosStatus: 'completed' };
  showConfirmationModal.value = true;
};

const confirmAction = async () => {
  try {
    if (confirmationAction.value === 'delete') {
      const { error } = await supabase
        .from('ToDoLists')
        .delete()
        .eq('id', todoToDelete.value);
      
      if (error) throw error;
      toastSuccess({ title: 'Success', description: 'Task is deleted successfully!' });
    } else if (confirmationAction.value === 'complete') {
      const { error } = await supabase
        .from('ToDoLists')
        .update({ todosStatus: 'completed' })
        .eq('id', todoToDelete.value);
      
      if (error) throw error;
      todos.value = todos.value.filter(todo => todo.id !== todoToDelete.value);
      toastSuccess({ title: 'Success', description: 'Task is marked as completed!' });
    }
    closeConfirmationModal();
    await fetchTodos();
  } catch (error) {
    console.error('Error during todo action:', error);
    toastError({ title: 'Error', description: 'Failed to process the action. Please try again.' });
  }
};

const closeConfirmationModal = () => {
  showConfirmationModal.value = false;
  todoToDelete.value = null;
};

//New add to replace PullRefresh
const refreshAllData = async () => {
  try {
    await fetchBudget();
    await fetchExpenses();
    await fetchTodos();
    await fetchSketchbooks();
    // If there's a selected sketch, reload its data
    if (selectedSketch.value) {
      await loadCanvasData();
    }
  } catch (error) {
    console.error('Error refreshing data:', error);
    toastError({ title: 'Error', description: 'Failed to refresh data' });
  }
};

// Initialize data when component mounts
onMounted(async () => {
  await initializeData();
});

// Use Ionic's lifecycle hook to refresh data when view enters
onIonViewWillEnter(async () => {
  await refreshAllData();
});

// Add a watch on selectedSketch to ensure canvas data is loaded when sketch is selected
watch(selectedSketch, async (newSketch) => {
  if (newSketch) {
    await nextTick();
    await loadCanvasData();
  }
});

// Add pagination variables for todos
const currentTodoPage = ref(1);
const todosPerPage = 5;
const totalTodoPages = computed(() => Math.ceil(todos.value.filter(todo => todo.todosStatus === 'incomplete').length / todosPerPage));

// Add computed property for paginated todos
const paginatedTodos = computed(() => {
  const incompleteTodos = todos.value.filter(todo => todo.todosStatus === 'incomplete');
  const start = (currentTodoPage.value - 1) * todosPerPage;
  const end = start + todosPerPage;
  return incompleteTodos.slice(start, end);
});

// Add pagination navigation functions
const previousTodoPage = () => {
  if (currentTodoPage.value > 1) {
    currentTodoPage.value--;
  }
};

const nextTodoPage = () => {
  if (currentTodoPage.value < totalTodoPages.value) {
    currentTodoPage.value++;
  }
};

</script>




<style scoped>
.custom-background {
  background: #FFEDF5;
  width: 100%;
  display: flex;
  flex-direction: column;
  &:has(.modal-overlay) {
    position: fixed;
    overflow: hidden;
    height: 100vh;
    width: 100vw;
    inset: 0;
  }
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
  flex: 1;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
}

.row {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  margin-bottom: 20px;
}

.expense-button {
  background-color: white;
  border: none;
  padding: 0;
  cursor: pointer;
  width: 100%;
  height: 100%; /* Take full height of grid cell */
  text-align: left;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
}

.expense-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.expense {
  background-color: #fff;
  padding: 20px;
  line-height: 1.5;
  border-radius: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.todo-list {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  height: 100%;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.sketch-plan {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  flex: 1;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  min-height: 1400px; /* Ensure minimum height for sketching area */
}

.signature-container {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
}

.signature-canvas {
  touch-action: none;
  user-select: none;
  width: 100% !important;
  height: 100% !important;
  border: 1px solid #aaaaaa;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  width: 100dvw;
  height: 100dvh;
  min-height: -webkit-fill-available;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overscroll-behavior: contain;
  touch-action: none;
  pointer-events: all;
  overflow: hidden;
  -webkit-overflow-scrolling: none;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 90%;
  width: 500px;
  margin: 20px;
  z-index: 10000;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
  position: relative;
  max-height: 80vh;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

ion-input {
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-top: 10px;
  margin-bottom: 10px;
  width: 100%; 
}

.canvas-controls,
.tool-selection {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
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

.hugeicons--task-done-01 {
  display: inline-block;
  width: 24px;
  height: 24px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cg fill='none' stroke='%23ff65bc' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' color='%23ff65bc'%3E%3Cpath d='M13.5 20s1 0 2 2c0 0 3.177-5 6-6M7 16h4m-4-5h8M6.5 3.5c-1.556.047-2.483.22-3.125.862c-.879.88-.879 2.295-.879 5.126v6.506c0 2.832 0 4.247.879 5.127C4.253 22 5.668 22 8.496 22h2.5m4.496-18.5c1.556.047 2.484.22 3.125.862c.88.88.88 2.295.88 5.126V13.5'/%3E%3Cpath d='M6.496 3.75c0-.966.784-1.75 1.75-1.75h5.5a1.75 1.75 0 1 1 0 3.5h-5.5a1.75 1.75 0 0 1-1.75-1.75'/%3E%3C/g%3E%3C/svg%3E");
}

.solar--eraser-bold-duotone {
  display: inline-block;
  width: 24px;
  height: 24px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23fa65bc' d='M14.952 3c-1.037 0-1.872.835-3.542 2.505l-4.91 4.91l7.085 7.085l4.91-4.91C20.165 10.92 21 10.085 21 9.048c0-1.038-.835-1.873-2.505-3.543S15.99 3 14.952 3' opacity='0.5'/%3E%3Cpath fill='%23fa65bc' d='M13.585 17.5L6.5 10.415l-.995.995C3.835 13.08 3 13.915 3 14.952c0 1.038.835 1.873 2.505 3.543S8.01 21 9.048 21c1.037 0 1.872-.835 3.542-2.505z'/%3E%3Cpath fill='%23fa65bc' d='M9.033 21H9zm.03 0c.796-.006 1.476-.506 2.51-1.5H21a.75.75 0 0 1 0 1.5z' opacity='0.5'/%3E%3C/svg%3E");
}
</style>
