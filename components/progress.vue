<template>
  <ion-content>
    <div>
      <h3></h3>
      <button @click="startRecording" :disabled="isRecording">START</button>
      <button @click="stopRecording" :disable="!isRecording">STOP</button>

      <!-- List of recordings -->
       <div v-for="(clip, index) in recordings" :key="index" style="display: flex; flex-direction:row;">
         <audio :src="clip.src" controls></audio>
         <button @click="uploadClip(clip)">Upload</button>
         <button @click="deleteClip(clip)">Delete</button>
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
const recordings = ref([]); //Store the list of audio clips

//Check if the device can record audio 
const canRecord = async () => {
  const result = await VoiceRecorder.canDeviceVoiceRecord();
  return result.value;
};

//Request recording permission 
const requestPermission = async () => {
  const permission = await VoiceRecorder.requestAudioRecordingPermission();
  return permission.value;
};

//Start recording 
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

//Stop recording and get the recorded data
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
    recordings.value.push(audioClip); //Add the new recording to the list 
  } else {
    console.error('Failed to retrieve recording data');
  }
};

//Upload a specific clip to supabase storage and save the URL in supabase table
const uploadClip = async (clip) => {
  //Convert the base64 into blob
  const blob = new Blob([new Uint8Array(atob(clip.dataBase64).split('').map((c) => c.charCodeAt(0)))], {
    type: 'audio/mpeg',
  });

  //Unique name for storage saving 
  const fileName = `audio-${Date.now()}.mp3`
  const file = new File([blob], fileName, {type:'audio/mpeg'});

  try {
    const {data: uploadData, error: uploadError} = await supabase
    .storage
    .from('audio')
    .upload(`audio/${fileName}`, file, {
      // cacheControl: '3600',
      upsert: false,
      contentType: 'audio/mpeg',
    })
    if (uploadError) {
      console.error('Error uploading audio:', uploadError);
      toastError({ title:'Error', description:'Failed to upload audio clip!' });
      return;
    }
    console.log('Audio uploaded:', uploadData);

    //Get the public URL of the uploaded audio
    const { data: urlData, error: urlError } = await supabase
    .storage
    .from('audio')
    .getPublicUrl(`audio/${fileName}`);

    if (urlError || !urlData.publicUrl) {
      console.error('Error fetching public URL:', urlError);
      toastError({ title:'Error', description:'Failed to generate public URL for the audio clip.' });
      return;
    }
    const publicUrl = urlData.publicUrl;
    console.log("Public URL of uploaded audio:", publicUrl);

    //Save the public URL to the audio_clips table
    await saveAudioUrl(publicUrl);
  } catch (error) {
    console.error('Error uploading audio clip:', error);
    toastError({title: 'Error', description:'Failed to upload audio clip!'});
  }
};

// //Delete clip function 
// const deleteClip = async (clip) => {
//   if (!clip || !clip.src) {

//   }
// }

//Save the uploaded audio URL to Supabase table
const saveAudioUrl = async (audioUrl) => {
  try {
    const { data, error } = await supabase
    .from('audio_clips')
    .insert([
      {
        audioClips: audioUrl,
        user_id: user.value.id,
      },
    ]);
    if (error) {
      console.error('Error saving audio URL to database:', error);
      toastError({title:'Error', description:'Failed to save audio URL to database.'});
    } else {
      console.log('Audio URL saved to database:', data);
      toastSuccess({ title:'Success', description:'Audio clip uploaded and saved successfully!'});
    }
  } catch (error) {
    console.error({ title:'Error', description:'Failed to save audio URL to database.'});
    toastError({title:'Error', description:'Failed to save audio URL to database.'})
  }
};
</script>

<style scoped>
button {
  margin: 10px;
}
</style>
