<script setup lang="ts"></script>

<template>
	<div class="page-header flex items-center gap-8">
		<slot />
	</div>
</template>

<style lang="scss" scoped>
.page-header {
	background-color: $accent;
	flex-wrap: wrap;
	padding: 2.4rem 2rem;

	@media screen and (min-width: 600px) {
		padding: 2.4rem 3.2rem;
	}
}
</style>
