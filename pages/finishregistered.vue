<template>
  <ion-page>
    <ion-content class="ion-padding custom-background">
      <div>
        <ion-card>
          <ion-card-header>
            <ion-card-title>Registered Successful!</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            You are registered successfully! Please open the mobile app and log in. 
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
definePageMeta({
  layout: 'auth'
})
</script>


<style scoped>
.custom-background {
  --background: #FFEDF5;
  /* height: 100000000000000000000px; */
}
</style>