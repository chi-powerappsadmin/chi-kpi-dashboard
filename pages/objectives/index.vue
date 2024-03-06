<script setup lang="ts">
import omit from "lodash/omit";
import type { TableColumn } from "~/components/Base/Table.vue";
import { splitStringByUppercase, stringToDate } from "~/helpers/functions";
import type { apiError } from "~/types/apiResponse/apiResponse";
import type { GetPerformanceObjectives } from "~/types/apiResponse/objectives";

definePageMeta({
	layout: "dashboard",
	middleware: "auth",
});
const { department } = storeToRefs(useUserStore());
const {getPriorityLabel} = usePrioritiesStore();

const { user } = storeToRefs(useUserStore());



const { objectives: objectivesFromStore, measurementTypes } = storeToRefs(useObjectivesStore());
const {
	data: objectives,
	refresh,
	pending,
} = await useAsyncData(
	"objective",
	() =>
		useApi<GetPerformanceObjectives>("/objectives", {
			headers: {
				department: department.value?.id || "",
			},
		}),
	{
		transform(d) {
			return d.data;
		},
		default: () => objectivesFromStore.value,
	},
);

const tableColumns: TableColumn[] = [
	{ value: "name", label: "Name", width: "22rem" },
	{ value: "status", label: "status", width: "16rem" },
	{ value: "priority", label: "Priority", width: "15rem" },
	{ value: "period", label: "Period", width: "18rem" },
	{ value: "owner", label: "Owner", width: "18rem" },
	{ value: "target", label: "Target", width: "10rem" },
	{ value: "actual", label: "Actual", width: "10rem" },
	{ value: "weight", label: "Weight", width: "10rem" },
	{ value: "progress", label: "Progress", width: "10rem" },
	{ value: "type", label: "Type", width: "20rem" },
	{ value: "created_on", label: "Created On", width: "20rem" },
];

const displayedData = computed(() => {
	return (
		objectives.value?.map((obj) => {
			return {
				id: obj.id,
				name: obj.name,
				status: splitStringByUppercase(obj.objectiveStatus.name),
				period: obj.period.name,
				priority: getPriorityLabel(obj.priority.value),
				owner: obj.owningEmployee.name,
				ownerId: obj.owningEmployee.id,
				target: obj.target,
				actual: obj.actual,
				weight: obj.weight,
				progress: obj.progress,
				type: measurementTypes.value.find((val) => +val.value === +obj.measurement.value)?.name,
				created_on: stringToDate(obj.createdOn),
			};
		}) || []
	);
});

const views = [
	"All Performance Objectives",
	"All Completed Performance Objectives",
	"All Open Performance Objectives",
	"My Open Performance Objectives",
	"My Completed Performance Objectives",
] as const;

const currentView = ref<(typeof views)[number]>("All Performance Objectives");

function changeView(view: typeof currentView.value) {
	currentView.value = view;
	showDropdown.value = false;
}

const filteredDisplayedData = computed(() => {
	const view = currentView.value;
	if (view === "All Completed Performance Objectives") {
		return displayedData.value.filter((d) => d.status === "Completed");
	} else if (view === "All Open Performance Objectives") {
		return displayedData.value.filter((d) => d.status !== "Completed");
	} else if (view === "My Open Performance Objectives") {
		return displayedData.value.filter((d) => d.ownerId === user.value?.userData?.id && d.status !== "Completed");
	} else if (view === "My Completed Performance Objectives") {
		return displayedData.value.filter((d) => d.ownerId === user.value?.userData?.id && d.status === "Completed");
	} else {
		return displayedData.value;
	}
});

const showDropdown = ref(false);

function exportToXlsx() {
	let dataToExport;
	if (selectedObjectivesIds.value.length) {
		dataToExport = filteredDisplayedData.value.filter((d) => selectedObjectivesIds.value.includes(d.id));
	} else {
		dataToExport = filteredDisplayedData.value;
	}
	dataToExport = dataToExport.map((d) => omit(d, ["id"]));
	useDownloadXlsx(dataToExport, currentView.value);
}
const showNewObjectiveForm = ref(false);
const isAddingNewObjective = ref(false);
function handleSuccess() {
	showNewObjectiveForm.value = false;
	refresh();
}
const selectedObjectivesIds = ref<string[]>([]);
const isDeleting = ref(false);
const showDeleteDialog = ref(false);

async function deleteObjectives() {
	if (selectedObjectivesIds.value.length < 1) return;
	try {
		showDeleteDialog.value = false;
		isDeleting.value = true;
		await Promise.all([
			selectedObjectivesIds.value.map((id) =>
				useApi("/objectives/delete/id:guid", {
					method: "DELETE",
					query: {
						objectiveID: id,
					},
				}),
			),
		]);

		useToast("success", "Success", `${selectedObjectivesIds.value.length} objectives(s) deleted!`, 3500, true);
		selectedObjectivesIds.value = [];
		refresh();
	} catch (error) {
		const err = error as apiError;
		useToast("error", "Error", err.message, 3500, true);
	} finally {
		isDeleting.value = false;
	}
}

function messageForConfirmingDelete() {
	return `Do you want to delete ${selectedObjectivesIds.value.length} objective(s)?. \n \n All Objective Tasks related to the Objective(s) will also be deleted if the user continue with the deletion`;
}
</script>

<template>
	<div class="objectives-page">
		<div class="objectives-page__top">
			<div class="objectives-page__actions flex-wrap">
				<BaseButton
					size="sm"
					:disabled="isDeleting || isAddingNewObjective || pending"
					@click="showNewObjectiveForm = true">
					<IconsAddSquare />
					<span>New</span>
				</BaseButton>
				<BaseButton
					v-if="selectedObjectivesIds.length"
					size="sm"
					:disabled="isDeleting || isAddingNewObjective || pending"
					:loading="isDeleting"
					@click="showDeleteDialog = true">
					<IconsTrash />
					<span>Delete</span>
				</BaseButton>
				<BaseButton
					size="sm"
					:disabled="isDeleting || isAddingNewObjective || pending"
					:loading="pending"
					@click="refresh">
					<IconsArrowRefresh />
					<span>Refresh</span>
				</BaseButton>
				<BaseButton size="sm" @click="exportToXlsx">
					<IconsExcelColor />
					<span>Export to Excel</span>
				</BaseButton>
			</div>
		</div>

		<div class="objectives-page__main">
			<div class="objectives-page__main-title flex items-center relative">
				<button class="flex items-center" @click.stop="showDropdown = !showDropdown">
					<p class="weight-500">{{ currentView }}</p>
					<IconsChevronDown />
				</button>
				<template v-if="showDropdown">
					<BaseDropdown
						:show="true"
						:position="{ top: '100%', left: '3.2rem', maxWidth: '100%' }"
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
				<BaseTable
					v-model="selectedObjectivesIds"
					:columns="tableColumns"
					:table-data="filteredDisplayedData"
					show-select
					:is-loading="pending || isAddingNewObjective || isDeleting">
					<template #name="{ value, record }">
						<NuxtLink :to="`/objectives/${record.id}`" class="table__link">
							{{ value }}
						</NuxtLink>
					</template>
				</BaseTable>
			</div>
		</div>
		<BaseSideDrawer v-model="showNewObjectiveForm" :can-close="!isAddingNewObjective">
			<DashboardObjectiveNewObjectiveForm
				@is-loading="(v) => (isAddingNewObjective = v)"
				@success="handleSuccess"
				@cancel="showNewObjectiveForm = false" />
		</BaseSideDrawer>
		<BaseDialogModal
			v-if="showDeleteDialog"
			yes-text="Yes, Delete"
			no-text="Cancel"
			title="Delete Objective(s)"
			:description="messageForConfirmingDelete()"
			@yes="deleteObjectives"
			@no="showDeleteDialog = false" />
		<BaseLoadingModal v-if="isDeleting" text="Deleting Objective(s)" />
	</div>
</template>

<style lang="scss" scoped>
.objectives-page {
	&__main {
		&-title {
			max-width: fit-content;
			padding: 2rem 3.2rem;

			button:not(.dropdown__item) {
				border: 0;
				height: 2.4rem;
				padding: 0;

				svg {
					height: 2.4rem;
					width: 2.4rem;
				}
			}

			p {
				@include typography(1.6rem, normal, 2.4rem);
			}
		}
	}
}
</style>
