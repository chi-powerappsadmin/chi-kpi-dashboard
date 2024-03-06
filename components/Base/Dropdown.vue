<script setup lang="ts">
import { onClickOutside } from "@vueuse/core";

interface Props {
	position?: { top?: string; left?: string; right?: string; bottom?: string, maxWidth?: string };
	show: boolean;
}

interface Emits {
	(event: "close"): void;
}

defineProps<Props>();
const emits = defineEmits<Emits>();

const dropdown = ref<HTMLDivElement | null>(null);

onClickOutside(dropdown, (event) => {
	event.stopPropagation();
	emits("close");
});
</script>

<template>
	<div v-if="show" ref="dropdown" class="dropdown" v-bind="$attrs" :style="{ ...position }">
		<div class="dropdown__list">
			<slot />
		</div>
	</div>
</template>

<style scoped></style>
