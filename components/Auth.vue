<script setup lang="ts">
const { $msal } = useNuxtApp();

const authenticateWithMicrosoft = async () => {
	await $msal().signIn();
};
</script>

<template>
	<div class="auth flex flex-column">
		<AuthHeader title="Login" message="Welcome back !" />

		<button class="auth__button flex items-center content-center weight-600" @click="authenticateWithMicrosoft">
			<IconsMicrosoft />
			<span>Log in with Office 365</span>
		</button>
	</div>
</template>

<style lang="scss" scoped>
.auth {
	font-family: "Montserrat", sans-serif;
	gap: 3.2rem;
	max-width: 39.6rem;
	margin: 0 auto;
	padding: 3.2rem 0;

	&__button {
		@include typography(1.6rem, 4.8rem);
		padding: 0.6rem 1rem;
		background: $accent;
		border-radius: 12px;
		border: 1px solid $outline;
		gap: 1rem;
	}

	&__switcher {
		@include typography(1.4rem, normal);
		font-family: "Poppins", sans-serif;
		color: $text-dark;
		gap: 0.4rem;
		letter-spacing: -0.35px;

		&__link {
			color: $sec-brand;
		}
	}
}
</style>
