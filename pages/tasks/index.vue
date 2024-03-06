<script setup lang="ts">
import { splitStringByUppercase, stringToDate } from "~/helpers/functions";
import type { GetTasksResponse } from "~/types/apiResponse/tasks";

definePageMeta({
	layout: "dashboard",
	middleware: "auth",
});

const {
	data: tableData,
	pending,
	refresh,
} = await useAsyncData(
	"tasks",
	async () => {
		const { data } = await useApi<GetTasksResponse>("/tasks");
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

const selectedRows = ref([]);
const activeDropdown = ref("active-tasks");
const showDropdown = ref(false);
const currentAction = ref("");
const redirectUrl = ref(""); // url user wants to visit before unsaved changes prompt
const showUnsavedChangesModal = ref(false);

const filteredTableData = computed(() => {
	if (activeDropdown.value === "completed-tasks")
		return tableData.value.filter((task) => task.status === "Completed");
	return tableData.value.filter((task) => task.status !== "Completed");
});

const {
	clonedData: clonedTasks,
	clonedDataHasBeenEditted,
	getArrayOfEdittedData,
	resetClonedData,
} = useCloneAndCompareData(filteredTableData);

const columns = [
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
const priorityOptions = ["Low", "Normal", "High"];
const dropdownList = [
	{ value: "active-tasks", label: "Active Objective Tasks" },
	{ value: "completed-tasks", label: "Completed Objective Tasks" },
];
const selectedViewName = computed(() => dropdownList.find((item) => item.value === activeDropdown.value)?.label);

const changeView = (view: string) => {
	activeDropdown.value = view;
	showDropdown.value = !showDropdown.value;
};

const exportTasksToXLSX = () => {
	const data = selectedRows.value.length
		? selectedRows.value.map((id) => filteredTableData.value.find((data) => data.id === id))
		: filteredTableData.value;
		
	const dataToExport = data.map((item) => {
		const { id: _, permissions: _2, ...rest } = item;
		return { ...rest };
	});


	useDownloadXlsx(dataToExport, selectedViewName.value || 'Tasks');
};

const deleteTasks = async () => {
	try {
		currentAction.value = "deleting";
		await Promise.all(
			selectedRows.value.map((id) =>
				useApi("/tasks/delete/id:guid", {
					method: "DELETE",
					query: {
						objectiveTaskID: id,
					},
				}),
			),
		);
		selectedRows.value = [];
		await refresh();
	} catch (error) {
		useToast("error", "Error", JSON.stringify(error), 1500, true);
	} finally {
		currentAction.value = "";
	}
};

const saveChanges = async () => {
	const edittedTasks = getArrayOfEdittedData().map((item) => {
		return { id: item.id, actual: item.actual, priority: item.priority.toLowerCase() };
	});
	try {
		currentAction.value = "saving";
		await Promise.all(
			edittedTasks.map((task) =>
				useApi("/tasks/update/id:guid", {
					method: "PATCH",
					body: task,
				}),
			),
		);
		refresh();
	} catch (error) {
		useToast("error", "Error!", "An error occurred trying to save changes made. Please try again.", 2000, true);
	} finally {
		currentAction.value = "";
	}
};

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
	<div class="tasks-page">
		<DashboardPageHeader>
			<BaseButton
				v-if="selectedRows.length"
				size="sm"
				class="gap-4"
				:disabled="currentAction === 'deleting'"
				@click="deleteTasks">
				<IconsTrash />
				Delete
			</BaseButton>
			<BaseButton size="sm" class="gap-4" :disabled="pending" @click="refresh">
				<IconsArrowRefresh />
				Refresh
			</BaseButton>
			<BaseButton v-if="tableData?.length" size="sm" class="gap-8" @click="exportTasksToXLSX">
				<IconsExcelColor />
				Export to Excel
			</BaseButton>
		</DashboardPageHeader>

		<div class="tasks-page__body">
			<div class="tasks-page__title">
				<h4 class="weight-500 flex items-center gap-4" @click.stop="showDropdown = true">
					{{ selectedViewName }}
					<span class="block chevron">
						<IconsChevronDown />
					</span>
					<BaseDropdown
						:show="showDropdown"
						:position="{ top: '4rem', left: '0', maxWidth: '36rem' }"
						@close="showDropdown = false">
						<div
							v-for="item in dropdownList"
							:key="item.label"
							class="dropdown__item content-between font-montserrat"
							@click.stop="changeView(item.value)">
							<span>{{ item.label }}</span>
							<IconsOutlineCheck v-if="item.value === activeDropdown" />
						</div>
					</BaseDropdown>
				</h4>
			</div>
			<div class="tasks-page__table">
				<div v-if="clonedDataHasBeenEditted" class="tasks-page__table__action flex items-center gap-8">
					<BaseButton size="sm" class="gap-4" :disabled="currentAction === 'saving'" @click="saveChanges">
						<IconsSave />
						Save
					</BaseButton>
					<BaseButton
						size="sm"
						class="gap-4"
						variant="danger"
						:disabled="currentAction === 'saving'"
						@click="resetClonedData">
						<IconsX />
						Cancel
					</BaseButton>
				</div>
				<BaseTable
					v-model="selectedRows"
					:is-loading="pending"
					:show-select="true"
					:columns="columns"
					:table-data="clonedTasks ?? []">
					<template #name="{ value, record }">
						<NuxtLink :to="{ name: 'tasks-id', params: { id: record.id } }" class="table__link">
							{{ value }}
						</NuxtLink>
					</template>
					<template #owner="{ value }">
						<span v-if="value === 'N/A'">N/A</span>
						<div v-else class="flex items-center avatar gap-8">
							<BaseAvatar :name="value" size="sm" />
							<span class="avatar__text weight-600">{{ value }}</span>
						</div>
					</template>
					<template #actual="{ key, record, value }">
						<input
							v-if="record.permissions.canUpdate"
							v-model="record[key]"
							type="number"
							class="table__input-edittable"
							min="0" />
						<p v-else>{{ value }}</p>
					</template>
					<template #priority="{ key, record, value }">
						<select
							v-if="record.permissions.canUpdate"
							v-model="record[key]"
							class="table__input-edittable">
							<option v-for="p in priorityOptions" :key="p" :selected="p === value" :value="p">
								{{ p }}
							</option>
						</select>
						<p v-else>{{ value }}</p>
					</template>
				</BaseTable>
			</div>
		</div>

		<BaseLoadingModal
			v-if="!!currentAction"
			:text="
				currentAction === 'deleting'
					? 'Please wait while we delete these tasks.'
					: 'Please wait while we save your changes.'
			" />

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
%padded-container {
	padding: 2.4rem 2rem;

	@media screen and (min-width: 600px) {
		padding: 2.4rem 3.2rem;
	}
}

.tasks-page {
	padding-bottom: 10rem;

	&__title {
		@extend %padded-container;
		box-shadow: 0px -1px 0px 0px #e1e3e5 inset;
		position: relative;

		h4 {
			@include typography(2.4rem, normal);
			cursor: pointer;
			position: relative;
		}

		.chevron {
			@include element-size(2.4rem, 2.4rem);
		}
	}

	&__table__action {
		@extend %padded-container;
		box-shadow: 0px -1px 0px 0px #e1e3e5 inset;
		justify-content: end;

		.btn-sm:nth-child(2) svg {
			height: 1.2rem;
			width: 1.2rem;
		}
	}
}

.drawer-wrapper {
	width: 100vw;
	max-width: 44.5rem;
	padding: 1.6rem;
}

.avatar__text {
	@include typography(1.3rem, normal);
}
</style>
