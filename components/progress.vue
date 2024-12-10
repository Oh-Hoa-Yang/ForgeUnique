<template>
  <ion-content>
    <div>
      <button @click="startRecording" :disabled="isRecording">START</button>
      <button @click="stopRecording" :disable="!isRecording">STOP</button>

      <!-- List of recordings -->
      <div v-for="(clip, index) in recordings" :key="clip.audio_number">
        <audio :src="clip.src" controls></audio>
        <button @click="deleteAudio(clip)">Delete</button>
      </div>
    </div>
  </ion-content>
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
    const audioClip = {
      src: `data:${result.value.mimeType};base64,${audioDataBase64}`,
      mimeType: result.value.mimeType,
      dataBase64: audioDataBase64,
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

  // Get the next audio_number for the user from Supabase
  const nextAudioNumber = await getNextAudioNumber();
  console.log('Next Audio Number:', nextAudioNumber);

  // Unique file name with the format {user.value.id}_audio{nextAudioNumber}
  const fileName = `${user.value.id}_audio${nextAudioNumber}.mp3`;
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
    await saveAudioUrl(publicUrl, nextAudioNumber, fileName);
    audioCounter.value = nextAudioNumber; // Increment the counter for the next audio file
  
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
</script>

<style scoped>
button {
  margin: 10px;
}
</style>
