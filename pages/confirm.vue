<template>
  <div>
    Redirecting...
  </div>
</template>

<script setup>
const user = useSupabaseUser()

watch (user, (user) => {
  if (user) {
    console.log(message= 'Signed In!')
  }
}, { immediate: true})
</script>

<style>

</style>