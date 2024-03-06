<script setup lang="ts">
interface Props {
	text: string;
}
defineProps<Props>();
const show = ref(true);
</script>

<template>
	<BaseModal v-model="show" :can-close="false">
		<div class="loading-modal flex items-center">
			<Loader />
			<p class="text-left">{{ text }}</p>
		</div>
	</BaseModal>
</template>

<style lang="scss" scoped>
.loading-modal {
	gap: 4rem;
	width: fit-content;
	max-width: 44rem;
	padding: 3.2rem;
	border-radius: 1.6rem;
	background-color: white;
	text-align: center;
	color: $grey;
}
</style>
