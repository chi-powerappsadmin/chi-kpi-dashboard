<script setup lang="ts">
import type { TableColumn } from "~/components/Base/Table.vue";
import { splitStringByUppercase, stringToDate } from "~/helpers/functions";
import type { apiError } from "~/types/apiResponse/apiResponse";
import type { Objective } from "~/types/models/Objective";
import type { Task } from "~/types/models/Task";
interface Props {
	objective: Objective;
	tasks: Task[];
	loading: boolean;
}
interface Emits {
	(e: "refresh"): void;
}

const emit = defineEmits<Emits>();
const props = defineProps<Props>();

const showCreateNewTaskForm = ref(false);
const isCreating = ref(false);
const redirectUrl = ref(""); // url user wants to visit before unsaved changes prompt
const showUnsavedChangesModal = ref(false);
const {priorities} = storeToRefs(usePrioritiesStore());


const selectedData = ref([]);
const priorityOptions = priorities.value.map((priority) => ({
	label: priority.name,
	value: priority.value,
})) as { label: string; value: number }[
];
function getPriorityLabel(value: number) {
	return priorityOptions.find((opt) => opt.value === value)?.label || "";
}

const newTaskForm = reactive({
	subject: "",
	description: "",
	target: "",
	priority: 0,
	startDate: new Date().toISOString().split("T")[0],
	endDate: new Date().toISOString().split("T")[0],
	objective: props.objective.id,
});

const tableColumns: TableColumn[] = (() => {
	return (
		[
			"subject",
			"activity_status",
			"owner",
			"target",
			"actual",
			"priority",
			"start_date",
			"end_date",
			"created_on",
			"due_date",
		] as const
	).map((val) => {
		function width() {
			if (val === "target" || val === "actual") return "10rem";
			return "20rem";
		}
		return {
			value: val,
			label: val.split("_").join(" "),
			width: width(),
		};
	});
})();

const displayedData = computed(() => {
	return props.tasks.map((task) => {
		const {
			id,
			subject,
			activityStatus,
			target,
			actual,
			priority,
			startDate,
			createdOn,
			endDate,
			owningEmployee,
			permissions,
		} = task;
		// TODO: change owner and due date and created_on
		return {
			id,
			subject,
			activity_status: splitStringByUppercase(activityStatus.name || "null"),
			owner: owningEmployee.name,
			target,
			actual: actual ?? "",
			priority: priority.value,
			start_date: stringToDate(startDate),
			duration: "2 hours",
			due_date: stringToDate(new Date()),
			created_on: stringToDate(createdOn),
			end_date: stringToDate(endDate),
			permissions,
		};
	});
});

const {
	clonedData: clonedTasks,
	clonedDataHasBeenEditted,
	getArrayOfEdittedData,
	resetClonedData,
} = useCloneAndCompareData(displayedData);

const isUpdating = ref(false);

async function updateEdittedTasks() {
	const edittedTasks = getArrayOfEdittedData().map((task) => {
		const { id, actual, priority } = task;
		return {
			id,
			actual,
			priority,
		};
	});
	if (!edittedTasks.length) return;

	try {
		isUpdating.value = true;
		await Promise.all(
			edittedTasks.map((task) =>
				useApi("/tasks/update/id:guid", {
					method: "PATCH",
					body: task,
				}),
			),
		);
		emit("refresh");
		useToast("success", "Success", "Successfully editted", 3500, true);
	} catch (error) {
		const err = error as apiError;
		useToast("error", "Error Updating Tasks", err.message, 20000, false);
	} finally {
		isUpdating.value = false;
	}
}

function resetForm() {
	newTaskForm.subject = "";
	newTaskForm.priority = 0;
	newTaskForm.description = "";
	newTaskForm.target = "";
	newTaskForm.startDate = new Date().toISOString().split("T")[0];
	newTaskForm.endDate = new Date().toISOString().split("T")[0];
	newTaskForm.objective = props.objective.id;
}

function handleTaskCreationSuccess() {
	showCreateNewTaskForm.value = false;
	resetForm();
	emit("refresh");
}

function handleCancel() {
	showCreateNewTaskForm.value = false;
	resetForm();
}

const toggleUnsavedChangesModal = (value: boolean) => (showUnsavedChangesModal.value = value);

onBeforeRouteLeave((to, _, next) => {
	if (clonedDataHasBeenEditted.value && !redirectUrl.value) {
		toggleUnsavedChangesModal(true);
		redirectUrl.value = to.fullPath;
		next(false);
	} else {
		next();
	}
});
</script>

<template>
	<div>
		<div class="group-and-actions flex content">
			<div class="actions">
				<BaseButton v-if="clonedDataHasBeenEditted" size="sm" class="gap-4" @click="updateEdittedTasks">
					<IconsSave />
					Save
				</BaseButton>
				<BaseButton
					v-if="clonedDataHasBeenEditted"
					size="sm"
					class="gap-4"
					variant="danger"
					@click="resetClonedData">
					<IconsX />
					Cancel Edit
				</BaseButton>
				<BaseButton
					v-if="!(objective.approvalStatus.value === 20)"
					size="sm"
					@click="showCreateNewTaskForm = true">
					<IconsAddSquare />
					<span>New Task</span>
				</BaseButton>
				<BaseButton size="sm" @click="$emit('refresh')">
					<IconsArrowRefresh />
					<span>Refresh</span>
				</BaseButton>
			</div>
		</div>
		<div>
			<BaseTable
				v-model="selectedData"
				:columns="tableColumns"
				:table-data="clonedTasks"
				show-select
				:is-loading="loading">
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
				<template #actual="{ key, record, value }">
					<input
						v-if="record.permissions.canUpdate"
						v-model="record[key]"
						type="text"
						class="table__input-edittable" />
					<p v-else>{{ value }}</p>
				</template>

				<template #priority="{ key, record, value }">
					<select v-if="record.permissions.canUpdate" v-model="record[key]" class="table__input-edittable">
						<option
							v-for="{ label, value: val } in priorityOptions"
							:key="label"
							:selected="val === value"
							:value="val">
							{{ label }}
						</option>
					</select>
					<p v-else>{{ getPriorityLabel(value) }}</p>
				</template>
			</BaseTable>
		</div>

		<BaseSideDrawer v-model="showCreateNewTaskForm" :can-close="!isCreating">
			<div class="drawer-wrapper">
				<DashboardTaskCreationForm
					v-model="newTaskForm"
					:show-objective-select="false"
					:redirect-after-creation="false"
					@cancel="handleCancel"
					@is-loading="(val) => (isCreating = val)"
					@success="handleTaskCreationSuccess">
					<template #objective-name-and-owner>
						<div class="objective-info">
							<div class="objective-info__item">
								<p>Perfomance Objective</p>
								<p class="flex items-center">
									<IconsTarget />
									<span>{{ objective.name }}</span>
								</p>
							</div>
							<div class="objective-info__item">
								<p>Owner</p>
								<p class="flex items-center">
									<BaseAvatar :name="objective.owningEmployee.name || 'NO NAME'" size="sm" />
									<NuxtLink :to="`/users/${objective.owningEmployee.id}`">
										{{ objective.owningEmployee.name || "NO NAME" }}
									</NuxtLink>
								</p>
							</div>
						</div>
					</template>
				</DashboardTaskCreationForm>
			</div>
		</BaseSideDrawer>

		<BaseLoadingModal v-if="isUpdating" :text="'Updating Tasks'" />

		<BaseDialogModal
			v-if="showUnsavedChangesModal"
			title="Discard changes?"
			:description="`Some information have been changed and are currently unsaved. Are you sure to continue without saving?`"
			yes-text="No, stay"
			no-text="Yes, leave"
			@no="toggleUnsavedChangesModal(false), navigateTo(redirectUrl)"
			@yes="toggleUnsavedChangesModal(false), (redirectUrl = '')"></BaseDialogModal>
	</div>
</template>

<style lang="scss" scoped>
.group-and-actions {
	padding: 2.4rem 3.2rem;
	gap: 0.8rem;
	flex-direction: column-reverse;

	.grouping {
		gap: 0.8rem;
	}

	.actions {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 1.2rem;
		flex-wrap: wrap;
	}

	@include breakpoint(lg) {
		flex-direction: row;
	}
}

.drawer-wrapper {
	width: 100vw;
	max-width: 44.5rem;
	padding: 1.6rem;

	.objective-info {
		margin-top: 2rem;
		display: grid;
		gap: 2rem;

		&__item {
			display: grid;
			grid-template-columns: 0.5fr 1fr;
			align-items: center;
			gap: 4rem;

			p {
				color: #4a4a68;
			}

			p:last-of-type {
				gap: 0.8rem;
				color: $sec-brand;
			}
		}

		svg {
			height: 2rem;
			width: 2rem;
		}
	}
}
</style>
