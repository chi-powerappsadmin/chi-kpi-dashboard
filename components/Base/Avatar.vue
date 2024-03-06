<script setup lang="ts">
interface Props {
	name: string;
	imageUrl?: string;
	size?: "sm" | "md" | "lg" | "xl";
	wrapperTag?: keyof HTMLElementTagNameMap;
}

const { size = "md", wrapperTag = "div", ...props } = defineProps<Props>();

const colors = ["#4285F4", "#0F9D58", "#F4B400", "#DB4437", "#673AB7", "#E91E63", "#795548", "#9E9E9E", "#FF5722", "#3F51B5", "#2196F3", "#00BCD4", "#009688", "#8BC34A", "#CDDC39", "#FFC107"];

function stringToHashCode(str: string) {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
	}
	return hash;
}

const color = computed(() => {
	const hashCode = stringToHashCode(props.name);
	const nonNegativeIndex = Math.abs(hashCode % 16);
	return colors[nonNegativeIndex];
});

function initials() {
	const splitArr = props.name.split(" ");
	return splitArr[0].charAt(0) + splitArr[1].charAt(0);
}
</script>

<template>
	<component :is="wrapperTag" :class="['avatar', `avatar-${size}`]">
		<img v-if="imageUrl" :src="imageUrl" loading="lazy" />
		<span>{{ initials() }}</span>
	</component>
</template>

<style lang="scss" scoped>
.avatar {
	flex-shrink: 0;
	position: relative;
	border-radius: 50%;
	background-color: v-bind(color);
	color: $white;
	text-transform: uppercase;
	overflow: hidden;

	&-sm {
		height: 2rem;
		width: 2rem;
		font-size: 1rem;
	}

	&-md {
		height: 3rem;
		width: 3rem;
		font-size: 1.5rem;
	}

	&-lg {
		height: 4rem;
		width: 4rem;
		font-size: 2rem;
	}

	&-xl {
		height: 5.2rem;
		width: 5.2rem;
		font-size: 2.4rem;
	}

	img {
		height: 100%;
		width: 100%;
		top: 0;
		left: 0;
		position: absolute;
	}

	span {
		@include flex-center;
		height: 100%;
		width: 100%;
	}
}
</style>
