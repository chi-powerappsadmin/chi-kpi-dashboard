<script setup lang="ts">
interface Props {
	title: string;
	message: string;
}

defineProps<Props>();
</script>

<template>
	<div class="auth__header flex flex-column items-center">
		<h4 class="auth__title weight-600">{{ title }}</h4>
		<p class="auth__message weight-600">{{ message }}</p>
	</div>
</template>

<style lang="scss" scoped>
.auth {
	&__header {
		font-family: "Montserrat", sans-serif;
		gap: 1rem;
	}

	&__title {
		@include typography(2.4rem, 2.8rem);
		letter-spacing: -0.15px;
	}

	&__message {
		@include typography(1.4rem, 1.8rem);
		color: $dark-grey;
		letter-spacing: -0.078px;
	}
}
</style>
