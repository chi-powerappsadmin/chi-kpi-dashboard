<script setup lang="ts">
interface Contributor {
	id: string;
	name: string;
}

interface Props {
	contributor: Contributor;
}

interface Emits {
	(event: "remove", id: string): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>

<template>
	<div class="contributor-item flex items-center gap-8 bg-accent">
		<BaseAvatar size="sm" :name="contributor.name" />
		<p class="name weight-500 color-sec">{{ contributor.name }}</p>
		<button class="button flex items-center content-center" @click="$emit('remove', contributor.id)">
			<span class="block icon"><IconsClose /></span>
		</button>
	</div>
</template>

<style lang="scss" scoped>
.contributor-item {
	padding: 0.8rem;
	border-radius: 0.8rem;
	border: 0.1rem solid $outline;
	min-width: 13.7rem;
	flex-shrink: 0;

	.name {
		@include typography(1.4rem, 140%);
	}

	.button {
		@include element-size(1.6rem, 1.57rem);
		border-radius: 50%;
		background: rgba(116, 116, 128, 0.08);
		backdrop-filter: blur(14.497142791748047px);
		line-height: 0;

		.icon {
			@include element-size(0.66rem, 0.63rem);
		}
	}
}
</style>
