<script setup lang="ts">
interface Props {
	title: string;
	body: string;
	badge: string;
}

defineProps<Props>();
</script>

<template>
	<div class="flex items-center badge-card">
		<IconsTasksBadge v-if="badge === 'tasks'" />
		<IconsObjectivesBadge v-if="badge === 'objectives'" />
		<div class="flex flex-column gap-4">
			<h6 class="body-small weight-500">{{ title }}</h6>
			<p class="weight-500">{{ body }}</p>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.badge-card {
	border-radius: 1.2rem;
	border: 1px solid $outline;
	background: $light-grey;
	padding: 12px 16px;
	gap: 10px;
	color: $text;

	p {
		@include typography(1rem, 140%);
	}
}
</style>
