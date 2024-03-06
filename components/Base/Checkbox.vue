<script lang="ts" setup>
interface CheckboxProps {
	id: string;
	label?: string;
	name: string;
	value?: string;
}

defineProps<CheckboxProps>();

const modelValue = defineModel();
</script>

<template>
	<label :for="id" class="checkbox flex items-center">
		<input :id="id" v-model="modelValue" type="checkbox" :checked="modelValue === value" :value="value" />
		<div class="checkbox__box flex content-center items-center"></div>
		<span v-if="!!label" class="checkbox__label">{{ label }}</span>
	</label>
</template>

<style lang="scss" scoped>
.checkbox {
	cursor: pointer;
	gap: 1.2rem;

	input {
		display: none;

		&:checked + .checkbox__box {
			background-color: $sec-brand;
			border-color: transparent;

			&::after {
				transform: scale(1);
			}
		}
	}

	&__box {
		height: 2.4rem;
		width: 2.4rem;
		border-radius: 6px;
		border: 1.125px solid $subtle-text;
		background-color: white;
		flex-shrink: 0;
		transition: all 0.25s linear;

		&::after {
			content: "";
			height: 1.6rem;
			width: 1.6rem;
			background-repeat: no-repeat;
			background-size: contain;
			background-position: center;
			transform: scale(0);
			background-image: url("@/assets/svgs/check.svg");
		}
	}
}
</style>
