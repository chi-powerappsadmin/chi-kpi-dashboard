<script setup lang="ts">
import cloneDeep from "lodash/cloneDeep";
import type { GetTaskResponse } from "~/types/apiResponse/tasks";
import type { Employee } from "~/types/models/Employee";
interface Props {
	employee: Employee;
}
const props = defineProps<Props>();
const currentRoute = useRoute();
const { taskId } = currentRoute.params;
const task = ref({
	subject: "",
	description: "",
	target: 0,
	actual: 0,
	startDate: new Date().toISOString().split("T")[0],
	endDate: new Date().toISOString().split("T")[0],
	objective: "",
});
const {
	data: taskData,
	pending,
	refresh,
} = await useAsyncData(
	`tasks-employee-${props.employee.id}`,
	() =>
		useApi<GetTaskResponse>("/tasks/id:guid", {
			query: {
				objectiveTaskID: taskId,
			},
		}),
	{
		transform(d) {
			return d.data;
		},
	},
);

watch(
	taskData,
	(newVal) => {
		if (!newVal) return;
		const clonedTask = cloneDeep(newVal);
		task.value = {
			subject: clonedTask.subject,
			description: clonedTask.description,
			target: clonedTask.target,
			actual: clonedTask.actual,
			startDate: clonedTask.startDate.split("T")[0],
			endDate: clonedTask.endDate.split("T")[0],
			objective: clonedTask.objective.id,
		};
	},
	{ immediate: true },
);

const contributorsToRemove = ref<string[]>([]);
</script>

<template>
	<div v-if="taskData">
		<div class="task-page__content">
			<div class="task-page__body">
				<div class="task-page__form">
					<DashboardTaskCreationForm v-model="task" :show-title="false" usage="update" :show-objective-select="false" :show-actions="false" />
				</div>
				<DashboardTaskContributorsList v-model="contributorsToRemove" :contributors="taskData?.contributors ?? []" :loading="pending" @refresh="refresh" />
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.task-page__content {
	padding: 2rem 3.2rem;
}
.task-page__body {
	display: grid;
	gap: 1.2rem;

	@include breakpoint(lg) {
		grid-template-columns: 1fr 1.5fr;
	}

	.task-page__form {
		background-color: $light-grey;
		padding: 1.6rem;
		border-radius: 1.2rem;
		border: 0.1rem solid $outline-stroke;
	}
}
</style>
