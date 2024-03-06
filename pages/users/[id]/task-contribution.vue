<script setup lang="ts">
import { splitStringByUppercase, stringToDate } from "~/helpers/functions";
import type{ GetTasksResponse } from "~/types/apiResponse/tasks";

import type { Employee } from "~/types/models/Employee";

interface Props {
	employee: Employee;
}
const props = defineProps<Props>();

const { getPriorityLabel } = usePrioritiesStore();

const tableColumns  = [
	{ value: "name", label: "Name", width: "23.5rem" },
	{ value: "status", label: "Status", width: "12rem" },
	{ value: "owner", label: "Owner", width: "16.4rem" },
	{ value: "target", label: "Target", width: "9rem" },
	{ value: "actual", label: "Actual", width: "9rem" },
	{ value: "priority", label: "Priority", width: "10rem" },
	{ value: "startDate", label: "Start Date", width: "12rem" },
	{ value: "endDate", label: "End Date", width: "12rem" },
	{ value: "created_on", label: "Created On", width: "15rem" },
	{ value: "completed_on", label: "Completed On", width: "15rem" },
];


const {
	data: tasks,
	pending,
} = await useAsyncData(
	"tasks",
	async () => {
		const { data } = await useApi<GetTasksResponse>("/employees/contributorobjectivetasks", {
			query: {
				employeeID: props.employee.id,
			},
		});
		return { data };
	},
	{
		transform(data) {
			const tasks = data.data.map((task) => {
				return {
					id: task.id,
					name: task.subject,
					owner: task.owningEmployee.name || "N/A",
					status: splitStringByUppercase(task?.activityStatus?.name ?? ""),
					target: task?.target ?? "",
					actual: task.actual ?? "",
					priority: task.priority.name,
					startDate: task.startDate ? new Date(task.startDate).toLocaleDateString() : "",
					endDate: task.endDate ? new Date(task.endDate).toLocaleDateString() : "",
					created_on: stringToDate(task.createdOn),
					completed_on: task.completionDate ? stringToDate(task.completionDate) : "",
					permissions: task.permissions,
				};
			});

			return tasks;
		},
		default() {
			return [];
		},
	},
);

</script>

<template>
	<div class="wrapper">
		<BaseTable :columns="tableColumns" :table-data="tasks" :is-loading="pending">
		<template #name="{ value, record }">
						<NuxtLink :to="`/tasks/${record.id}`" class="table__link">
							{{ value }}
						</NuxtLink>
					</template>
			<template #owner="{ value }">
				<div class="flex items-center" style="gap: 0.8rem">
					<BaseAvatar v-if="value !== 'N / A'" :name="value" size="sm" />
					<span>{{ value }}</span>
				</div>
			</template>

			<template #subject="{ value, record }">
				<NuxtLink :to="`/tasks/${record.id}`" class="table__link">
					{{ value }}
				</NuxtLink>
			</template>

			<template #priority="{ value }">
				<p>{{ getPriorityLabel(value) }}</p>
			</template>
		</BaseTable>
	</div>
</template>

<style lang="scss" scoped>
.wrapper {
	padding: 2rem 3.2rem;
}
</style>
