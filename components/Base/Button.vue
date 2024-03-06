<script setup lang="ts">
type solidVariant = "white" | "grey" | "purple" | "success" | "danger" | 'transparent';
type OutlineVariant = "outline-white" | "outline-purple" | "outline-success" | "outline-danger" | "outline-info";
interface Props {
	variant?: solidVariant | OutlineVariant;
	size?: "sm" | "md" | "lg";
	tag?: "button" | "nuxt-link" | "a";
	full?: boolean;
	center?: boolean;
	loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	tag: "button",
	variant: "white",
	size: "md",
	full: false,
	center: false,
	loading: false,
});

const componentToRender = computed(() => {
	if (props.tag === "nuxt-link") return resolveComponent("NuxtLink");
	return props.tag;
});
</script>

<template>
	<component :is="componentToRender" :class="['btn', `btn-${variant} btn-${size} ${full ? 'btn-full' : ''}`, center ? 'btn-center' : '']">
		<span v-if="loading" class="btn__spinner"><IconsSpinner /></span>
		<slot />
	</component>
</template>

<style scoped lang="scss">
.btn {
	font-weight: 500;
	border: 0.1rem solid;
	display: flex;
	align-items: center;
	gap: 1rem;

	&.router-link-active {
		background-color: $sec-brand;
		color: $white;
	}

	&__spinner {
        display: block;
		line-height: 0;
		animation: spinner 1000ms linear 0s infinite;
	}
}

.btn {
	&-full {
		width: 100%;
	}

	&-sm {
		padding: 0.8rem;
		height: 3.6rem;
		font-size: 1.4rem;
		border-radius: 0.8rem;

		:deep(svg) {
			height: 1.8rem;
			width: 1.8rem;
		}
	}

	&-md {
		padding: 1.6rem;
		height: 5.6rem;
		font-size: 1.6rem;
		border-radius: 1.2rem;

		:deep(svg) {
			height: 2.4rem;
			width: 2.4rem;
		}
	}

	&-center {
		justify-content: center;
	}
}

.btn {
	&-white {
		border-color: rgba($color: $outline, $alpha: 0.91);
		background: $white;
		color: $dark;

		&:hover {
			color: $dark;
			background-color: darken($color: $white, $amount: 5%);
			border-color: transparent;
		}
	}

	&-purple {
		background-color: $sec-brand;
		color: $light;
		border-color: transparent;

		&:hover,
		&:active {
			background-color: darken($color: $sec-brand, $amount: 5%);
		}
	}

	&-grey {
		background-color: $outline;
		color: $text;
		border-color: transparent;

		&:hover,
		&:active {
			background-color: darken($color: $outline, $amount: 5%);
		}
	}

	&-success {
		background-color: $success;
		color: $white;
		border-color: transparent;

		&:hover,
		&:active {
			background-color: darken($color: $success, $amount: 5%);
		}
	}

	&-danger {
		background-color: $danger;
		color: $light;
		border-color: transparent;

		&:hover,
		&:active {
			background-color: darken($color: $danger, $amount: 10%);
		}
	}

	&-transparent {
		background-color: transparent;
		border: none;
	}
}

.btn {
	&-outline {
		&-white {
			border-color: rgba($color: $outline, $alpha: 0.91);
			background-color: $white;
			color: $dark;

			&:hover,
			&:active {
				background-color: rgba($color: $outline, $alpha: 0.91);
			}
		}

		&-purple {
			border-color: $sec-brand;
			color: $sec-brand;

			&:hover,
			&:active {
				background-color: $sec-brand;
				color: $white;
			}
		}

		&-success {
			border-color: $success;
			color: $success;

			&:hover,
			&:active {
				background-color: $success;
				color: $white;
			}
		}

		&-danger {
			border-color: $danger;
			color: $danger;

			&:hover,
			&:active {
				background-color: $danger;
				color: $white;
			}
		}

		&-info {
			border-color: $info;
			color: $info;

			&:hover,
			&:active {
				background-color: $info;
				color: $white;
			}
		}
	}
}

.btn {
	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
}

@keyframes spinner {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}
</style>
