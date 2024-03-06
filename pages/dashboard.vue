<script setup lang="ts">
definePageMeta({
	layout: "dashboard",
	middleware: 'auth',
});
const route = useRoute();

const showPagesDropdown = ref(false);
const pages = [
	{ name: "dashboard-leadership-dashboard", title: "Leadership Dashboard" },
	{ name: "dashboard-employee-performance-objectives", title: "Employee Performance Objectives" },
	{ name: "dashboard-team-manager", title: "Team Manager Dashboard" },
];

const currentPageTitle = computed(() => pages.find((page) => page.name === route.name)?.title);

watch(
	() => route.fullPath,
	() => {
		showPagesDropdown.value = false;
	},
);
</script>

<template>
	<div>
		<DashboardPageHeader>
			<BaseButton size="sm" class="gap-4">
				<IconsArrowRefresh />
				Refresh All
			</BaseButton>
		</DashboardPageHeader>


		<div class="dashboard-pages">
			<div class="dashboard-pages__dropdown">
				<h4 class="flex items-center weight-500 gap-4" @click="showPagesDropdown = true">
					{{ currentPageTitle }}
					<button class="block chevron"><IconsChevronDown /></button>
				</h4>

				<BaseDropdown
					:show="showPagesDropdown"
					:position="{ maxWidth: 'fit-content' }"
					@close="showPagesDropdown = false">
					<NuxtLink v-for="page in pages" :key="page.name" :to="{ name: page.name }" class="dropdown__item flex items-center content-between gap-8">
						{{ page.title }}
						
						<IconsOutlineCheck v-if="page.name === $route.name" />
					</NuxtLink>
				</BaseDropdown>
			</div>
		</div>

		<NuxtPage />
	</div>
</template>

<style lang="scss" scoped>
.dashboard-pages {
	padding: 2rem;
	background: #fff;
	box-shadow: 0px -1px 0px 0px #e1e3e5 inset;

	@include breakpoint(md) {
		padding: 2rem 3.2rem;
	}

	h4 {
		@include typography(1.6rem, normal, 2.4rem);
		cursor: pointer;
		width: max-content;

		button {
			@include element-size(2.4rem, 2.4rem);
		}
	}
}
</style>
