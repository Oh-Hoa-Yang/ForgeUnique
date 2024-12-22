<template>
  <ion-content class="custom-background">
    <div class="container">
      <!-- Expense and To-Do List Sections (first row) -->
      <div class="row">
        <!-- Expense Section (Button Behavior) -->
        <button class="expense-button" @click="router.push('/expensehomepage')">
          <div class="expense">
            <h3 style="text-align: center; font-weight: bold;">Expense</h3>
            <p><b>Monthly Budget:</b> <br>{{ budget }} MYR</p><br>
            <p><b>Total Monthly Expenses:</b><br> {{ monthlyExpense }} MYR</p><br>
            <p><b>Today Expenses:</b> <br>{{ todayExpense }} MYR</p>
          </div>
        </button>

        <!-- To-Do List Section -->
        <div class="todo-list">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="font-weight: bold;">To-Do List</h3>
            <button @click="openAddTodoModal" style="font-size: 24px; padding: 5px 10px; color: #FD8395;">+</button>
          </div>
          <ul>
            <li v-for="todo in todos.filter(todo => todo.todosStatus === 'incomplete')" :key="todo.id"
              style="display: flex; justify-content: space-between; align-items: center;">
              <span :class="{ priority: todo.todosPriority }">{{ todo.todosPriority }}</span>
              <h4>{{ todo.todosDescription }}</h4>
              <div>
                <button @click="editItem(todo)">✏️</button>
                <button @click="confirmDelete(todo.id)">❌</button>
                <button v-if="todo.todosStatus === 'incomplete'" @click="confirmComplete(todo)">✔️</button>
              </div>
            </li>
          </ul>
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
const user = useSupabaseUser();

const router = useRouter();

const appState = inject('appState');
if (!appState) {
  console.error('Failed to inject appState. Ensure App.vue provides it.');
}

const fetchBudget = async () => {
  if (!user.value) return;

  try {
    const {data, error} = await supabase 
    .from('Users')
    .select('budget')
    .eq('user_id', user.value.id)
    .single()

    if (error) throw error;

    if (data && data.budget) {
      appState.budget = data.budget //Update appState with fetched budget
      return data.budget;
    }
    return 0; //Return 0 if no budget is found
  } catch (err) {
    console.error('Error fetching budget from supabase:', err.message);
    return 0;
  }
}; 

//Reactive state for budget 
const budget = computed(() => {
  if (appState.budget === 0) {
    fetchBudget().then((fetchedBudget) => { 
      appState.budget = fetchedBudget; // Update appState after manual fetch
    });
  }
  return appState.budget;
})

const fetchExpenses = async () => {
  if (!user.value) return;

  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based
    const todayDate = currentDate.toISOString().split('T')[0];

    const { data: expenses, error } = await supabase
      .from('Expenses')
      .select('expenseAmount, expenseDate')
      .eq('user_id', user.value.id);

    if (error) throw error;

    let fetchedMonthlyExpense = 0;
    let fetchedTodayExpense = 0;

    if (expenses) {
      fetchedMonthlyExpense = expenses
        .filter((expense) => {
          const expenseDate = new Date(expense.expenseDate);
          return (
            expenseDate.getFullYear() === currentYear &&
            expenseDate.getMonth() + 1 === currentMonth
          );
        })
        .reduce((sum, expense) => sum + expense.expenseAmount, 0);

      fetchedTodayExpense = expenses
        .filter((expense) => expense.expenseDate === todayDate)
        .reduce((sum, expense) => sum + expense.expenseAmount, 0);
    }

    appState.monthlyExpense = fetchedMonthlyExpense;
    appState.todayExpense = fetchedTodayExpense;

    return { monthlyExpense: fetchedMonthlyExpense, todayExpense: fetchedTodayExpense };
  } catch (err) {
    console.error('Error fetching expenses from Supabase:', err.message);
    return { monthlyExpense: 0, todayExpense: 0 };
  }
};

// Reactive state for expenses
const monthlyExpense = computed(() => {
  if (appState.monthlyExpense === 0) {
    fetchExpenses().then(({ monthlyExpense }) => {
      appState.monthlyExpense = monthlyExpense; // Update appState after manual fetch
    });
  }
  return appState.monthlyExpense;
});

const todayExpense = computed(() => {
  if (appState.todayExpense === 0) {
    fetchExpenses().then(({ todayExpense }) => {
      appState.todayExpense = todayExpense; // Update appState after manual fetch
    });
  }
  return appState.todayExpense;
});





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

  // //Check if the next poge exists before navigating 
  // const nextPage = await fetchPage(nextPageNumber);

  // if (!nextPage) {
  //   //If the next page doesn't exist, create it
  //   await createPage(nextPageNumber);
  // }

  // currentPageNumber.value = nextPageNumber;
  await loadCanvasData();
};

//PAGE NAV FOR SKETCH - CANVAS
const prevPage = async () => {
  if (currentPageNumber.value > 1) {
    if (!isSaved.value) {
      await saveCanvas(); // Save the current page before navigating
    }

    currentPageNumber.value--;

    await nextTick(); //Ensure the DOM is ready before clearing the pad

    //Explicitly clear the canvas before loading the previous page 
    if (signaturePad.value && typeof signaturePad.value.clear === 'function') {
      signaturePad.value.clear();
    }
    await loadCanvasData();
  } else {
    console.log('Your are already on the first page')
  }
};

const loadCanvasData = async () => {
  const currentPage = await fetchPage(currentPageNumber.value);

  //Ensure the signaturePad is initialized 
  if (!signaturePad.value) {
    console.error('Signature pad is not initialized.');
    return;
  }

  //Clear the canvas first before loading any data
  signaturePad.value.clearCanvas();

  if (!currentPage || !currentPage.id) {
    console.error('Invalid page');
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
        //Load the image into canvas 
        signaturePad.value.fromDataURL(imageUrl);
        console.log('Image loaded on canvas');
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

const createPage = async (pageNumber) => {
  const { data, error } = await supabase
    .from('SketchPages')
    .insert([{ page_number: pageNumber, sketch_id: selectedSketch.value.id }])
    .select('*')
    .single()

  if (error) {
    console.error('Error creating new pages: ', error)
    throw error;
  }
  console.log('New page created: ', data)
  return data;
}


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
        toastError({title:'Error', description:'Failed to update the todos.'});
      } 
    } else {
      //Add new todo
      const { error } = await supabase
        .from('ToDoLists')
        .insert([{ ...currentTodo.value, userEmail: userEmail, user_id: user.value.id }])
      if (error) {
        console.error('Error adding new todo:', error.message);
        toastError({title:'Error', description:'Failed to add the todos.'});
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
  if (confirmationAction.value === 'delete') {
    await supabase
      .from('ToDoLists')
      .delete()
      .eq('id', todoToDelete.value);
  } else if (confirmationAction.value === 'complete') {
    await supabase
      .from('ToDoLists')
      .update({ todosStatus: 'completed' })
      .eq('id', todoToDelete.value);
    todos.value = todos.value.filter(todo => todo.id !== todoToDelete.value);
  }
  closeConfirmationModal();
  fetchTodos();
};

const closeConfirmationModal = () => {
  showConfirmationModal.value = false;
  todoToDelete.value = null;
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
  z-index: 1000;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 90%;
  width: 500px;
  margin: 0 auto;
  z-index: 1001;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
  position: relative;
  text-align: center;
}

.canvas-controls,
.tool-selection {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}
</style>
