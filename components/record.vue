<template>
  <div class="custom-background">
    <div class="container mx-auto">
      <div style="display: flex; justify-items: center; justify-content: center; margin-top: 20px;">
        <button 
          @click="isRecording ? stopRecording() : startRecording()" 
          :class="['record-button', { 'recording': isRecording }]"
        >
          <span :class="isRecording ? 'fluent--record-stop-20-regular' : 'fluent--mic-record-28-regular'"></span>
        </button>
      </div>

      <!-- List of recordings -->
      <div v-for="clip in sortedRecordings" :key="clip.audio_number" style="display: flex; justify-content: space-between; align-items: center; margin-left: 20px; margin-right: 20px; border-bottom: 1px solid #eee; padding: 10px 5px;">
        <div class="audio-badge">
          {{ clip.audio_number }}
        </div>
        <audio :src="clip.src" controls class="custom-audio-player"></audio>
        <button @click="deleteAudio(clip)" class="delete-button">
          <span class="material-symbols--delete-outline"></span>
        </button>
      </div>  
    </div>
  </div>
</template>

<script setup>
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { useAppToast } from '~/composables/useAppToast.js';

const user = useSupabaseUser();
const supabase = useSupabaseClient();

const { toastError, toastSuccess } = useAppToast();

const isRecording = ref(false);
const recordings = ref([]); // Store the list of audio clips
const audioCounter = ref(0);

// Check if the device can record audio
const canRecord = async () => {
  const result = await VoiceRecorder.canDeviceVoiceRecord();
  return result.value;
};

// Request recording permission
const requestPermission = async () => {
  const permission = await VoiceRecorder.requestAudioRecordingPermission();
  return permission.value;
};

// Start recording
const startRecording = async () => {
  if (!(await canRecord())) {
    console.error('Device cannot record audio.');
    return;
  }

  if (!(await requestPermission())) {
    console.error('Permission denied.');
    return;
  }

  try {
    await VoiceRecorder.startRecording();
    console.log("Recording started successfully");
    isRecording.value = true;
  } catch (error) {
    console.error('Error starting recording:', error);
  }
};

// Stop recording and get the recorded data
const stopRecording = async () => {
  const result = await VoiceRecorder.stopRecording();
  isRecording.value = false;

  if (result.value && result.value.recordDataBase64) {
    const audioDataBase64 = result.value.recordDataBase64;
    const nextAudioNumber = await getNextAudioNumber(); // Get the next number first
    const audioClip = {
      src: `data:${result.value.mimeType};base64,${audioDataBase64}`,
      mimeType: result.value.mimeType,
      dataBase64: audioDataBase64,
      audio_number: nextAudioNumber, // Add the audio number to the clip
    };
    recordings.value.push(audioClip); // Add the new recording to the list
    await uploadClip(audioClip); // Upload the recording immediately
  } else {
    console.error('Failed to retrieve recording data');
  }
};

// Upload the clip to Supabase storage and save URL in the table
const uploadClip = async (clip) => {
  // Convert the base64 into blob
  const blob = new Blob([new Uint8Array(atob(clip.dataBase64).split('').map((c) => c.charCodeAt(0)))], {
    type: 'audio/mpeg',
  });

  // Use the audio_number that was already assigned
  const fileName = `${user.value.id}_audio${clip.audio_number}.mp3`;
  console.log('Generated File Name:', fileName);

  const file = new File([blob], fileName, { type: 'audio/mpeg' });

  try {
    // Upload audio to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('audio')
      .upload(fileName, file, {
        upsert: false,
        contentType: 'audio/mpeg',
      });

    if (uploadError) {
      console.error('Error uploading audio:', uploadError);
      toastError({ title: 'Error', description: 'Failed to upload audio clip!' });
      return;
    }

    console.log('Audio uploaded successfully:', uploadData);

    // Get public URL of the uploaded audio
    const { data: urlData, error: urlError } = await supabase
      .storage
      .from('audio')
      .getPublicUrl(fileName);

    if (urlError || !urlData.publicUrl) {
      console.error('Error fetching public URL:', urlError);
      toastError({ title: 'Error', description: 'Failed to generate public URL for the audio clip.' });
      return;
    }
    const publicUrl = urlData.publicUrl;
    console.log("Public URL of uploaded audio:", publicUrl);

    // Save the public URL and audio_number to the Supabase table
    await saveAudioUrl(publicUrl, clip.audio_number, fileName);
    audioCounter.value = clip.audio_number; // Update the counter with the current audio number
  
    const clipIndex = recordings.value.findIndex((rec) => rec.src === clip.src);
    if (clipIndex !== -1) {
      recordings.value[clipIndex].fileName = fileName; //Add fileName to the clip object
    }
  } catch (error) {
    console.error('Error uploading audio clip:', error);
    toastError({ title: 'Error', description: 'Failed to upload audio clip!' });
  }
};

// Save the uploaded audio URL to Supabase table
const saveAudioUrl = async (audioUrl, audioNumber, fileName) => {
  console.log('Saving audio with:', {
      audioUrl,
      audioNumber,
      fileName,
      user_id: user.value.id,
    });
  try {
    const { data, error } = await supabase
      .from('audio_clips')
      .insert([
        {
          audioClips: audioUrl,
          fileName: fileName,
          user_id: user.value.id,
          audio_number: audioNumber,
        },
      ]);
    if (error) {
      console.error('Error saving audio URL to database:', error);
      toastError({ title: 'Error', description: 'Failed to save audio URL to database.' });
    } else {
      toastSuccess({ title: 'Success', description: 'Audio clip uploaded and saved successfully!' });
    }
  } catch (error) {
    console.error('Error saving audio URL to database:', error);
    toastError({ title: 'Error', description: 'Failed to save audio URL to database.' });
  }
};

// Fetch the next audio number for the user (by finding the max audio_number)
const getNextAudioNumber = async () => {  
  try {
    const { data: maxAudioNumberData, error: fetchError } = await supabase
      .from('audio_clips')
      .select('audio_number')
      .eq('user_id', user.value.id)
      .order('audio_number', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('Error fetching max audio number:', fetchError);
      return 1; // If there are no records, return 1 as the first audio number
    }

    const nextAudioNumber = maxAudioNumberData.length > 0 ? maxAudioNumberData[0].audio_number + 1 : 1;
    return nextAudioNumber;
  } catch (error) {
    console.error('Error fetching next audio number:', error);
    return 1; // If fetching fails, return 1 as the first audio number
  }
};

// Delete audio from Supabase storage and remove from table
const deleteAudio = async (clip) => {
  const {fileName} = clip; // Extract file name from URL
  if (!fileName) {
      console.error("File name not found in clip:", clip);
      toastError({ title: 'Error', description: 'Failed to find file name for deletion.' });
      return;
    }

  try {
    // Remove from Supabase storage
    const { error: deleteError } = await supabase
      .storage
      .from('audio')
      .remove([fileName]);

    if (deleteError) {
      console.error("Error deleting audio file from storage:", deleteError);
      toastError({ title: 'Error', description: 'Failed to delete audio file from storage.' });
      return;
    }

    // Remove from Supabase table
    const { error: tableError } = await supabase
      .from('audio_clips')
      .delete()
      .eq('fileName', fileName); // Use the public URL or the unique identifier (audio_number)

    if (tableError) {
      console.error("Error deleting audio record from database:", tableError);
      toastError({ title: 'Error', description: 'Failed to delete audio record from database.' });
      return;
    }

    // Update the recordings list by removing the deleted clip
    recordings.value = recordings.value.filter((record) => record.fileName !== fileName);
    toastSuccess({ title: 'Success', description: 'Audio clip deleted successfully!' });
  } catch (error) {
    console.error('Error deleting audio:', error);
    toastError({ title: 'Error', description: 'Failed to delete audio clip!' });
  }
};

// Fetch audio clips from Supabase when the page loads
onMounted(async () => {
  try {
    const { data: audioData, error: fetchError } = await supabase
      .from('audio_clips')
      .select('*')
      .eq('user_id', user.value.id)
      .order('audio_number', { ascending: true });

    if (fetchError) {
      console.error('Error fetching audio clips:', fetchError);
      return;
    }

    recordings.value = audioData.map((clip) => ({
      src: clip.audioClips,
      fileName: clip.fileName,
      audio_number: clip.audio_number,
    }));

    // Set the audio counter to the last audio_number
    if (audioData.length > 0) {
      audioCounter.value = audioData[audioData.length - 1].audio_number;
    }
  } catch (error) {
    console.error('Error fetching audio clips:', error);
    toastError({ title: 'Error', description: 'Failed to fetch audio clips.' });
  }
});

// Add this computed property for sorted recordings
const sortedRecordings = computed(() => {
  return [...recordings.value].sort((a, b) => a.audio_number - b.audio_number);
});
</script>

<style scoped>
.custom-background {
  background: #FFEDF5;
  min-height: 100vh;
  width: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  flex: 1;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.record-button {
  margin: 10px;
  transition: opacity 0.3s ease;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
}

.record-button.recording {
  opacity: 0.6;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.custom-audio-player {
  width: 75%;
  height: 50px;
}

.fluent--mic-record-28-regular {
  display: inline-block;
  width: 80px;
  height: 80px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28'%3E%3Cpath fill='%23ff65bc' d='M8.5 6.5a4.5 4.5 0 1 1 9 0v7.124a7.5 7.5 0 0 0-1.5.875V6.5a3 3 0 1 0-6 0v8a3 3 0 0 0 3.656 2.928a7.5 7.5 0 0 0-.506 1.57L13 19a4.5 4.5 0 0 1-4.5-4.5zM13.016 21H13a6.5 6.5 0 0 1-6.5-6.5v-.75a.75.75 0 1 0-1.5 0v.75a8 8 0 0 0 7.25 7.965v2.785a.75.75 0 0 0 1.5 0v-1.477A7.5 7.5 0 0 1 13.016 21m7.484 4.5a5 5 0 1 1 0-10a5 5 0 0 1 0 10m0 1.5a6.5 6.5 0 1 0 0-13a6.5 6.5 0 0 0 0 13m0-3a3.5 3.5 0 1 0 0-7a3.5 3.5 0 0 0 0 7'/%3E%3C/svg%3E");
}

.fluent--record-stop-20-regular {
  display: inline-block;
  width: 80px;
  height: 80px;    
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath fill='%23ff65bc' d='M10 3a7 7 0 1 0 0 14a7 7 0 0 0 0-14m-8 7a8 8 0 1 1 16 0a8 8 0 0 1-16 0m5-2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1z'/%3E%3C/svg%3E");
}

.material-symbols--delete-outline {
  width: 50px;
  height: 50px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23ff65bc' d='M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zM17 6H7v13h10zM9 17h2V8H9zm4 0h2V8h-2zM7 6v13z'/%3E%3C/svg%3E");
}

.audio-badge {
  background-color: #FFC2D1;
  color: black;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  min-width: 30px;
}

.delete-button {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.delete-button:hover {
  transform: scale(1.1);
}
</style>
