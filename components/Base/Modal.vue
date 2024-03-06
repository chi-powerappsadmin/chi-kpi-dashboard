<script setup lang="ts">
interface Props {
	canClose?: boolean;
	blur?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
	canClose: true,
	blur: false,
});

const showModal = defineModel<boolean>({
	required: true,
});

const modalContentRef = ref<HTMLDivElement>();

function attemptCloseModal() {
	const modalContent = unref(modalContentRef);
	if (!modalContent) return;
	if (props.canClose) {
		showModal.value = false;
		return;
	}

	modalContent.classList.add("shake");
	modalContent.onanimationend = () => {
		modalContent.classList.remove("shake");
	};
}
</script>

<template>
	<Teleport to="body">
		<div
			v-if="showModal"
			class="modal flex items-center content-center"
			:class="{ 'modal--blur': blur }"
			@click.self="attemptCloseModal">
			<div ref="modalContentRef" class="modal-content">
				<slot />
			</div>
		</div>
	</Teleport>
</template>

<style lang="scss" scoped>
.modal {
	position: fixed;
	z-index: 6;
	inset: 0;
	background-color: rgba($color: #2e2e2e, $alpha: 0.5);
    height: 100vh;
    width: 100vw;

    &--blur {
        backdrop-filter: blur(4px);
    }

	&-content {
	}
}

.modal-content.shake {
	animation: shake 0.32s forwards;
}

@keyframes shake {
	0% {
		scale: 1;
	}

	25% {
		scale: 0.98;
	}

	50% {
		scale: 1;
	}

	75% {
		scale: 0.98;
	}

	100% {
		scale: 1;
	}
}
</style>
