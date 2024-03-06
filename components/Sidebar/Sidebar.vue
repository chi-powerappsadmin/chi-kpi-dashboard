<script setup lang='ts'>
const route = useRoute();
const isAdmin = true
const isOpen = ref(!true)

const sidebarRef = ref<HTMLDivElement>()

useListen('sidebar:toggle', val => {
    isOpen.value = val
})

function closeSidebar(e: MouseEvent) {
    e.stopPropagation()
    const sidebar = sidebarRef.value
    if (!sidebar) return

    if (!e.composedPath().includes(sidebar)) {
        useEvent('sidebar:toggle', false)
    }
}

onMounted(() => {
    window.addEventListener('click', closeSidebar)
})

onUnmounted(() => {
    window.removeEventListener('click', closeSidebar)
})


watch(() => route.fullPath, () => {
    if(isOpen) isOpen.value = false
})
</script>

<template>
    <div ref="sidebarRef" class="sidebar" :class="{
        'open': isOpen
    }">
        <div class="sidebar-content">
            <SidebarAdminContent v-if="isAdmin" />
        </div>
    </div>
</template>

<style scoped lang="scss">
.sidebar {
    background-color: $light;
    transition: all 320ms linear;
    z-index: 5;
    transform: translateX(-100%);

    &.open {
        transform: translateX(0%);
    }

    @include breakpoint(md) {
        transform: translate(0%);
    }

    .sidebar-content {
        padding: 4rem 3.2rem;
        height: 100%;
        overflow: auto;
    }
}
</style>