<script setup lang="ts">
export interface SelectOption {
	value: string | number;
	label: string;
}

interface SelectProps {
	id: string;
	name: string;
	label?: string;
	placeholder?: string;
	font?: string;
	options: SelectOption[];
	invalid?: boolean;
	errorMessage?: string;
	required?: boolean;
}

const { placeholder = "Select an option" } = defineProps<SelectProps>();

const modelValue = defineModel<string | number>();
</script>

<template>
	<div :class="['select flex flex-column', { 'select--montserrat': font === 'montserrat' }]">
		<label v-if="label" :for="id" class="select__label weight-600">
			{{ label }}
			<span v-if="required" class="required-asterisk body-regular weight-500">*</span>
		</label>
		<div class="relative">
			<select
				:id="id"
				v-model="modelValue"
				:name="name"
				class="select__element weight-500"
				:class="{ 'select__element--error': invalid }">
				<option v-if="placeholder" value="">{{ placeholder }}</option>
				<option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
			</select>
			<span class="chevron-icon">
				<IconsChevronDown />
			</span>
		</div>
		<p v-if="invalid && errorMessage" class="select__error-message">{{ errorMessage }}</p>
	</div>
</template>

<style lang="scss" scoped>
.select {
	gap: 1.2rem;
	position: relative;

	&--montserrat {
		font-family: "Montserrat", sans-serif;
	}

	&__label {
		@include typography(1.4rem, normal);
		color: $text-dark;
	}

	&__element {
		width: 100%;
		font-size: 1.6rem;
		color: $text-black;
		background: $white;
		padding: 0 1.6rem;
		height: 5.6rem;
		border-radius: 12px;
		border: 1px solid $outline-stroke;
		cursor: pointer;
		-webkit-appearance: none;
		appearance: none;

		&--error {
			border-color: $danger;
			color: $danger;
		}
	}

	&__error-message {
		font-size: 1.2rem;
		color: $danger;
	}
}

.chevron-icon {
	position: absolute;
	right: 1.6rem;
	top: 50%;
	transform: translateY(-50%);
	pointer-events: none;
	background: $white;
	height: 2.4rem;
	width: 2.4rem;
}

.required-asterisk {
	color: $danger;
}
</style>
