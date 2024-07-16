<script setup>
definePageMeta({
  middleware: ['auth'],
})
</script>

<template>
  <ion-page>
		<ion-header>
			<ion-toolbar>
				<ion-title>Register</ion-title>
			</ion-toolbar>
		</ion-header>
		<ion-content class="ion-padding">
			Register Page
			<ion-button router-link="/login">Login</ion-button>
		</ion-content>
	</ion-page>
</template>

<script setup>

</script>

<style>

</style>