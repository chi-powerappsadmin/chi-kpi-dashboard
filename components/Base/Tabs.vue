<script setup lang="ts">
interface Tab {
	value: string;
	label: string;
}

interface TabsProps {
	tabs: Tab[];
	showRelated?: boolean;
	tag?: keyof HTMLElementTagNameMap | "nuxt-link";
}

const { showRelated = false, tag = "li" } = defineProps<TabsProps>();

const modelValue = defineModel<string>();

const componentToRender = computed(() => {
	if (tag === "nuxt-link") return resolveComponent("NuxtLink");
	return tag;
});
</script>

<template>
	<ul class="tabs">
		<div class="tabs__items flex items-center no-scrollbar">
			<component :is="componentToRender" v-for="tab in tabs" :key="tab.value" class="tabs__item" :class="{ 'tabs__item--active': tab.value === modelValue }" :to="{ path: tab.value }" @click.prevent.stop="modelValue = tab.value">
				{{ tab.label }}
			</component>
			<li v-if="showRelated" class="tabs__item tabs__item--related flex items-center">
				Related
				<span class="block"><IconsChevronDown /></span>
			</li>
		</div>
	</ul>
</template>

<style lang="scss" scoped>
.tabs {
	background: #fff;
	position: relative;
	z-index: 1;

	&__items {
		overflow-y: auto;
	}

	&::after {
		position: absolute;
		content: "";
		height: 0.2rem;
		width: 100%;
		background-color: rgba(232, 232, 232, 0.93);
		left: 0;
		bottom: 0;
		z-index: -1;
	}

	&__item {
		@include typography(1.6rem, 140%);
		padding: 1.4rem 2.4rem;
		cursor: pointer;
		border-bottom: 0.2rem solid transparent;
		color: $text;
		flex-shrink: 0;

		&:first-child {
			padding: 1.4rem 3.5rem;
		}

		&--active,
		&.router-link-exact-active {
			border-color: $sec-brand;
		}

		&--related {
			gap: 1rem;

			span {
				height: 1.6rem;
				width: 1.6rem;
			}
		}
	}
}
</style>
