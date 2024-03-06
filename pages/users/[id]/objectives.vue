<script setup lang="ts">
import type { TableColumn } from "~/components/Base/Table.vue";
import { splitStringByUppercase } from "~/helpers/functions";
import type { GetPerformanceObjectives } from "~/types/apiResponse/objectives";
import type { Employee } from "~/types/models/Employee";
definePageMeta({
	layout: "dashboard",
});
interface Props {
	employee: Employee;
}

defineProps<Props>();

const route = useRoute();

const {
	data: objectives,
	pending,
	refresh,
} = await useAsyncData(
	`employeeData-${route.params.id}`,
	async () => {
		const employeeID = route.params.id;
		const employeeObjectives = await useApi<GetPerformanceObjectives>("/employees/objectives", {
			query: { employeeID },
		});
		return employeeObjectives;
	},

	{
		transform(d) {
			return d.data;
		},
	},
);

const tableColumns: TableColumn[] = ["name", "status", "owner", "target", "actual", "weight", "progress", "type"].map(
	(col) => {
		return {
			value: col,
			label: col,
			width: "20rem",
		};
	},
);

const displayedData = computed(() => {
	return (
		objectives.value?.map((obj) => {
			return {
				id: obj.id,
				name: obj.name,
				status: splitStringByUppercase(obj.objectiveStatus.name),
				owner: obj.owningEmployee.name,
				target: obj.target.toFixed(2),
				actual: obj.actual ? obj.actual.toFixed(2) : "-",
				weight: obj.weight.toFixed(2),
				progress: obj.progress ? (obj.progress as number).toFixed(2) : "-",
				type: obj.measurement.name.split("_").join(" "),
			};
		}) || []
	);
});

const views = [
	"All Performance Objectives",
	"Open Performance Objectives",
	"Completed Performance Objectives",
] as const;

const filteredDisplayedData = computed(() => {
	const view = currentView.value;

	if (view === "Open Performance Objectives") {
		return displayedData.value.filter((d) => d.status !== "Completed");
	} else if (view === "Completed Performance Objectives")
		return displayedData.value.filter((d) => d.status === "Completed");

	return displayedData.value;
});

const showDropdown = ref(false);

function changeView(view: typeof currentView.value) {
	currentView.value = view;
	showDropdown.value = false;
}

const currentView = ref<(typeof views)[number]>(views[0]);
</script>

<template>
	<div class="wrapper">
		<div class="page-actions">
			<BaseButton size="sm" :disabled="pending" :loading="pending" @click="refresh">
				<IconsArrowRefresh />
				<span>Refresh</span>
			</BaseButton>
		</div>
		<div class="page__title flex items-center relative">
			<button class="flex items-center" @click="showDropdown = !showDropdown">
				<h4 class="weight-500">{{ currentView }}</h4>
				<IconsChevronDown />
			</button>

			<template v-if="showDropdown">
				<BaseDropdown
					:show="true"
					:position="{ top: '100%', left: '3.2rem', maxWidth: 'fit-content' }"
					@close="showDropdown = false">
					<button
						v-for="view in views"
						:key="view"
						class="dropdown__item content-between"
						@click.self.stop="changeView(view)">
						{{ view }}
						<IconsOutlineCheck v-if="currentView === view" style="height: 1.6rem; width: 1.6rem" />
					</button>
				</BaseDropdown>
			</template>
		</div>
		<div>
			<BaseTable :is-loading="pending" :columns="tableColumns" :table-data="filteredDisplayedData || []">
				<template #name="{ value, record }">
					<NuxtLink :to="`/objectives/${record.id}`" class="table__link">{{ value }}</NuxtLink>
				</template>
				<template #owner="{ value }">
					<div class="flex items-center gap-4">
						<BaseAvatar v-if="value" :name="value" size="sm" />
						<span>{{ value }}</span>
					</div>
				</template>
			</BaseTable>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.wrapper {
	padding: 2rem 0rem;
	.page-actions {
		display: flex;
		gap: 0.8rem;
		align-items: center;
		flex-wrap: wrap;
		padding: 0.8rem 1.2rem;
	}

	.page__title {
		margin: 1.2rem 0;
		padding: 1.2rem;

		h4 {
			@include typography(2rem, normal, 2.4rem);
		}

		button:not(.dropdown__item) {
			border: 0;
			height: 2.4rem;
			padding: 0;

			svg {
				height: 2.4rem;
				width: 2.4rem;
			}
		}
	}
}
</style>
