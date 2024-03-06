<script setup lang="ts">
interface Props {
	title?: string;
	description: string;
	yesText?: string;
	noText?: string;
}
interface Emits {
	(e: "yes" | "no"): void;
}

defineEmits<Emits>();
const { yesText = "Yes", noText = "No" } = defineProps<Props>();
const show = ref(true);
</script>

<template>
	<BaseModal v-model="show" :can-close="false">
		<div class="dialog flex flex-column">
			<p v-if="title" class="dialog__title weight-500">{{ title }}</p>
			<p class="dialog__description">
				{{ description }}
			</p>
			<div class="dialog__actions flex items-center">
				<BaseButton variant="success" size="sm" @click="$emit('yes')">{{ yesText }}</BaseButton>
				<BaseButton variant="danger" size="sm" @click="$emit('no')">{{ noText }}</BaseButton>
			</div>
		</div>
	</BaseModal>
</template>

<style lang="scss" scoped>
.dialog {
	gap: 1rem;
	width: 44rem;
	max-width: calc(100vw - 4rem);
	padding: 1.6rem;
	margin: 1.6rem;
	border-radius: 1.6rem;
	background-color: white;
	text-align: left;
	color: $text;

	&__title {
		font-size: 2rem;
	}

	&__description {
		font-size: 1.4rem;
		white-space: pre-line;
	}

	&__actions {
		margin-top: 2rem;
		gap: 2rem;
		button {
			flex: 1;
			justify-content: center;
		}
	}
}
</style>
