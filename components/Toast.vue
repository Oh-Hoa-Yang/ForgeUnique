<template>
  <ion-toast :icon="Icon" :color="color" :header="header" :is-open="open" swipe-gesture="vertical" :duration="3000"
    :message="Error"></ion-toast>
</template>

<script setup>
const props = defineProps({
  Icon: String,
  header: String,
  message: String,
  open: Boolean
})

setTimeout(() => {
  props.open = false
})
</script>