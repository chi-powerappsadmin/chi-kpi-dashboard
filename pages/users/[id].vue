<script setup lang="ts">
import { type GetEmployeeResponse } from "~/types/apiResponse/employees";

definePageMeta({
	layout: "dashboard",
	middleware: "auth",
});

const route = useRoute();

const { id } = route.params;

const { data } = await useAsyncData(
	"user",
	() =>
		useApi<GetEmployeeResponse>("/employees/id:guid", {
			query: {
				employeeID: id,
			},
		}),
	{
		transform(d) {
			return d.data;
		},
	},
);

const tabs = [
	{ value: `/users/${id}/`, label: "General" },
	{ value: `/users/${id}/objectives`, label: "Performance Objectives" },
	{ value: `/users/${id}/mission-statement`, label: "Mission Statement" },
	{ value: `/users/${id}/task-contribution/`, label: "Tasks Contributions" },
];
const activeTab = ref("");
</script>

<template>
	<div>
		<DashboardPageHeader>
		</DashboardPageHeader>
		<BaseTabs v-model="activeTab" :tabs="tabs" tag="nuxt-link"></BaseTabs>
		<NuxtPage :employee="data" />
	</div>
</template>

<style></style>
