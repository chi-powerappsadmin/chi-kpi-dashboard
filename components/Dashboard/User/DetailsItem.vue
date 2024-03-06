<script setup lang="ts">
interface Props {
	title: string;
	body?: string;
	mainGap?: string;
	innerGap?: string;
	isHeading?: boolean;
}

interface Emits {
	(event: "manage"): void;
}

defineEmits<Emits>();
const { mainGap = "4", innerGap = "4", isHeading = false } = defineProps<Props>();
</script>

<template>
	<div class="user-info__item flex flex-column" :class="[`gap-${mainGap}`]">
		<div class="flex flex-column" :class="[`gap-${innerGap}`]">
			<p class="weight-500" :class="[isHeading ? 'heading body-regular' : 'body-small title']">{{ title }}</p>
			<h6 class="body-small weight-500" :class="[isHeading ? 'title' : 'color-dark']">{{ body }}</h6>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.user-info__item {
	.title {
		color: #4a4a68;
	}

	.heading {
		color: #000;
	}
}
</style>
