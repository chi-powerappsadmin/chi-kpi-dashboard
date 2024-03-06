<script setup lang='ts'>
const modelValue = defineModel<boolean>()
interface Props {
    canClose?: boolean
}
interface Emits {
    (e: 'close-drawer'): void,
}

const { canClose = true } = defineProps<Props>()
defineEmits<Emits>()

const drawerRefContent = ref<HTMLDivElement>()
function close() {
    if (canClose) {
        modelValue.value = false
        return
    }

    if (!drawerRefContent.value) return

    drawerRefContent.value.classList.add('shake')
    drawerRefContent.value.onanimationend = () => {
        if (!drawerRefContent.value) return
        drawerRefContent.value.classList.remove('shake')
    }
}



</script>

<template>
    <Teleport to="body">
        <Transition name="slide">
            <div v-if="modelValue" class="side-drawer flex content-end" @click.self="close">
                <div ref="drawerRefContent" class="side-drawer__content">
                    <slot />
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style lang="scss" scoped>
$time: 0.25s;

.side-drawer {
    position: fixed;
    inset: 0;
    top: 7.2rem;
    bottom: 0;
    height: calc(100dvh - 7.2rem);
    overflow: auto;
    z-index: 6;
    background-color: rgba($color: #2e2e2e, $alpha: 0.5);

    &__content {
        overflow: auto;
        min-height: 100%;
        background-color: white;
    }
}



.slide-enter-from,
.slide-leave-to {
    opacity: 0;

    .side-drawer__content {
        transform: translateX(100%);
    }
}

.slide-enter-to,
.slide-leave-from {
    opacity: 1;

    .side-drawer__content {
        transform: translateX(0%);
    }
}

.slide-enter-active,
.slide-leave-active {
    transition: all $time;

    .side-drawer__content {
        transition: $time linear;
    }
}


.side-drawer__content.shake {
    animation: shake 0.32s forwards;
}

@keyframes shake {
    0% {
        scale: 1 1;
    }

    25% {
        scale: 0.98 1;
    }

    50% {
        scale: 1 1;
    }

    75% {
        scale: 0.98 1;
    }

    100% {
        scale: 1 1;
    }
}
</style>