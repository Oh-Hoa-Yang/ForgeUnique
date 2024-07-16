<script setup>
definePageMeta({
  middleware: ['auth'],
})
</script>

<template>
	<ion-page>
		<ion-header>
			<ion-toolbar>
				<ion-title>Login</ion-title>
			</ion-toolbar>
		</ion-header>
		<ion-content class="ion-padding">
			Login Page
			<ion-button router-link="/register">Register</ion-button>
		</ion-content>
	</ion-page>
</template>