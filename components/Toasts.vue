<script setup lang="ts">
import { allToasts } from "~/composables/useToast";

const errorToasts = computed(() => allToasts.filter((toast) => toast.type === "error"));
const lastErrorToast = computed(() => errorToasts.value[errorToasts.value.length - 1]);
const otherToasts = computed(() => allToasts.filter((toast) => toast.type !== "error"));
</script>

<template>
	<div>
		<BaseModal v-if="errorToasts.length" :model-value="true" :can-close="false" blur>
			<div class="error-modal flex flex-column items-center content=center">
				<div class="error-modal__icon flex items-center pointer content-center">
					<span @click="useRemoveToast(lastErrorToast.id)"><IconsX /></span>
				</div>
				<h6 class="error-modal__title weight-600">{{ lastErrorToast.title }}</h6>
				<p class="error-modal__message">{{ lastErrorToast.message }}</p>
				<BaseButton variant="danger" size="md" center full @click="useRemoveToast(lastErrorToast.id)">Okay</BaseButton>
			</div>
		</BaseModal>
		<Teleport to="body">
			<div class="toasts-wrapper">
				<TransitionGroup name="slide">
					<div v-for="toast in otherToasts" :key="toast.id" :class="['toast', `toast__${toast.type}`]">
						<div class="toast-icon">
							<IconsCircleCheck v-if="toast.type === 'success'" />
						</div>

						<div class="toast-info">
							<p class="toast-info__title">{{ toast.title }}</p>
							<p class="toast-info__message">{{ toast.message }}</p>
						</div>

						<button v-if="toast.canClose" class="toast-closebtn" @click="useRemoveToast(toast.id)">
							<IconsX />
						</button>
					</div>
				</TransitionGroup>
			</div>
		</Teleport>
	</div>
</template>

<style lang="scss">
.toasts-wrapper {
	position: fixed;
	top: 0;
	right: 0;
	z-index: 8;
	padding-top: 2rem;
	display: grid;
	gap: 1rem;

	.toast {
		width: 100vw;
		max-width: 30rem;
		background-color: $accent;
		border-top-left-radius: 0.6rem;
		border-bottom-left-radius: 0.6rem;
		padding: 1.6rem 0.8rem;
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		color: $accent;

		&-icon {
			svg {
				height: 2.4rem;
				width: 2.4rem;
			}
		}

		&-info {
			flex-grow: 1;
			display: grid;
			gap: 0.5rem;

			&__title {
				font-weight: 500;
				font-size: 1.6rem;
			}

			&__message {
				font-weight: 400;
				font-size: 1.4rem;
			}
		}

		&-closebtn {
			color: inherit;
		}

		&__success {
			background-color: $success;
		}

		&__error {
			background-color: $danger;
		}
	}
}

.slide-move,
.slide-enter-active,
.slide-leave-active {
	transition: all 320ms linear;
}

.slide-enter-from,
.slide-leave-to {
	opacity: 0;
	transform: translateX(100%);
}

.slide-enter-to,
.slide-leave-from {
	opacity: 1;
	transform: translateX(0);
}

.error-modal {
	gap: 1rem;
	width: 44rem;
	max-width: calc(100vw - 4rem);
	padding: 1.6rem;
	background-color: #fff;
	padding: 2.4rem 3.2rem;
	border-radius: 0.8rem;
	text-align: center;

	@include breakpoint(md) {
		gap: 2rem;
	}

	&__icon {
		@include element-size(4rem, 4rem);
		border-radius: 50%;
		color: $danger;
		background-color: rgba(239, 28, 28, 0.1);

		svg {
			@include element-size(1.6rem, 1.6rem);
			fill: #fff;
		}
	}

	&__title {
		@include typography(1.6rem, 2.4rem, 2.4rem);
		color: $text-black;
	}

	&__message {
		@include typography(1.4rem, 2rem, 1.6rem);
		color: $text-dark;
	}
}
</style>
