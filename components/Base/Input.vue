<script setup lang="ts">
interface InputProps {
	id: string;
	name: string;
	type?: string;
	label?: string;
	font?: string;
	placeholder?: string;
	disabled?: boolean;
	sizing?: "line-height" | "padding";
	padding?: string;
	weight?: string;
	isSearch?: boolean;
	searchPosition?: "left" | "right";
	hasError?: boolean,
	errorMessage?: string
	required?: boolean;
	hasIcon?: boolean
}

const { type = "text", disabled = false, sizing = "line-height", padding = "1.4rem 1.8rem", weight = "600", isSearch = false, searchPosition = "left", required = false, hasIcon = false } = defineProps<InputProps>();

const modelValue = defineModel<string | number>();
</script>

<template>
	<div :class="['input', `font-${font}`]">
		<label v-if="label" :for="id" class="input__label weight-600">
			<slot name="label">
				{{ label }}
			</slot>
			<span v-if="required" class="required-asterisk body-regular weight-500">*</span>
		</label>
		<div class="relative">
			<input :id="id" v-model="modelValue" :type="type" :name="name" class="input__element" :class="[`input__element--${sizing}`,
			`weight-${weight}`,
			{
				'input__element--padded-left': isSearch &&
					searchPosition === 'left', 'input__element-hasError': hasError
			}]" :placeholder="placeholder" :disabled="disabled" v-bind="$attrs" />
			<span v-if="isSearch" class="block search-icon" :class="`search-icon--${searchPosition}`">
				<IconsSearch />
			</span>
			<span v-if="type === 'date'" class="date-icon">
				<IconsDate />
			</span>
			<span v-if="hasIcon" class="icon">
				<slot name="icon" />
			</span>
		</div>
		<p v-if="hasError && errorMessage" class="input__error-message">{{ errorMessage }}</p>
	</div>
</template>

<style lang="scss" scoped>
.input {
	position: relative;
	display: flex;
	flex-direction: column;
	gap: 1.2rem;
	position: relative;

	&__label {
		@include typography(1.4rem, normal);
		color: $text-dark;
	}

	&__element {
		width: 100%;
		@include typography(1.6rem, normal);
		color: $text-black;
		padding: 0.6rem 1.6rem;
		border-radius: 12px;
		border: 1px solid $outline-stroke;
		background: transparent;

		&--line-height {
			@include typography(1.6rem, 4.8rem);
		}

		&--padding {
			padding: v-bind(padding);
		}

		&--padded-left {
			padding-left: 4.6rem;
		}

		&:disabled {
			color: rgb(121, 121, 121);
			cursor: not-allowed;
			background-color: $light-grey;
		}

		&-hasError {
			border-color: $danger;
		}
	}

	&__error-message {
		font-size: 1.2rem;
		color: $danger;
	}
}

.search-icon {
	position: absolute;
	background-color: #fff;
	top: 50%;
	transform: translateY(-50%);

	&--left {
		left: 1.8rem;
	}

	&--right {
		right: 1.9rem;
	}
}

.required-asterisk {
	color: $danger;
}

.date-icon {
	position: absolute;
	right: 1.8rem;
	background-color: #fff;
	pointer-events: none;
	top: 50%;
	transform: translateY(-50%);
}

.icon {
	position: absolute;
	right: 1.8rem;
	top: 50%;
	transform: translateY(-50%);
}
</style>
