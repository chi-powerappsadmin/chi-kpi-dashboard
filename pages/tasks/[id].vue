<script setup lang="ts">
import type { GetTaskResponse } from "@/types/apiResponse/tasks";

definePageMeta({
	layout: "dashboard",
	middleware: "auth",
});

const route = useRoute();

const {
	data: taskData,
	pending,
	refresh,
} = await useAsyncData(
	"task",
	() =>
		useApi<GetTaskResponse>("/tasks/id:guid", {
			query: {
				objectiveTaskID: route.params.id,
				loadContributors: true,
			},
		}),
	{
		transform(data) {
			return data.data;
		},
	},
);

const currentTab = ref("general");
const currentAction = ref("");
const tabs = [{ value: "general", label: "General" }];
const contributorsToRemove = ref<string[]>([]);
const redirectUrl = ref(""); // url user wants to visit before unsaved changes prompt
const showUnsavedChangesModal = ref(false);
const closeAfterSaving = ref(false);

const loadingModalText = computed(() => {
	if (currentAction.value === "deleting-task") return "Please wait while we delete the task.";
	if (currentAction.value === "saving-task") return "Please wait while we save your changes.";
	if (currentAction.value === "removing-contributors") return "Please wait while we remove the contributors";
	return "";
});
const mappedTask = computed(() => {
	if (!taskData.value) return;
	return {
		subject: taskData.value?.subject ?? "",
		description: taskData.value?.description ?? "",
		target: taskData.value?.target ?? "",
		actual: taskData.value?.actual ?? "",
		startDate: new Date(taskData.value?.startDate ?? new Date()).toISOString().slice(0, 10),
		endDate: new Date(taskData.value?.endDate ?? new Date()).toISOString().slice(0, 10),
	};
});

const { clonedData, clonedDataHasBeenEditted } = useCloneAndCompareData(computed(() => [mappedTask.value]));

const deleteTask = async () => {
	currentAction.value = "deleting-task";
	try {
		await useApi("/tasks/delete/id:guid", {
			method: "DELETE",
			query: {
				objectiveTaskID: route.params.id,
			},
		});
		useToast("success", "Successful", "Task have been successfully created", 1500, true);
		navigateTo({ name: "tasks" });
	} catch (error) {
		useToast("error", "Error", JSON.stringify(error), 1500, true);
	} finally {
		currentAction.value = "";
	}
};

const updateTaskData = async (close: boolean) => {
	currentAction.value = "saving-task";
	closeAfterSaving.value = close;
	try {
		await useApi("/tasks/update/id:guid", {
			method: "PATCH",
			body: { ...clonedData.value[0], id: taskData.value?.id },
		});
		useToast("success", "Successful", "Changes have been saved successfully.", 1500, true);
		if (close) {
			navigateTo({
				name: "objectives-id",
				params: { id: taskData.value?.objective.id },
				query: { tab: "tasks" },
			});
		} else {
			refresh();
		}
	} catch (error) {
		useToast("error", "Error", JSON.stringify(error), 1500, true);
	} finally {
		currentAction.value = "";
	}
};

const removeContributorsFromTask = async () => {
	currentAction.value = "removing-contributors";
	try {
		await useApi("/tasks/removecontributors", {
			method: "PATCH",
			query: {
				objectiveTaskID: route.params.id,
			},
			body: contributorsToRemove.value,
		});
		useToast("success", "Successful", "Contributors have removed succesfully", 1500, false);
		contributorsToRemove.value = [];
		refresh();
	} catch (error) {
		useToast("error", "Error", JSON.stringify(error), 1500, true);
	} finally {
		currentAction.value = "";
	}
};

const toggleUnsavedChangesModal = (value: boolean) => (showUnsavedChangesModal.value = value);

onBeforeRouteLeave((to, _, next) => {
	if (clonedDataHasBeenEditted.value && !redirectUrl.value) {
		toggleUnsavedChangesModal(closeAfterSaving.value === false);
		redirectUrl.value = to.fullPath;
		next(false);
	} else {
		next();
	}
});
</script>

<template>
	<div class="task-page">
		<DashboardPageHeader>
			<BaseButton
				v-if="(taskData?.permissions.canUpdateAll || taskData?.permissions.canUpdate) && clonedDataHasBeenEditted"
				size="sm"
				class="gap-4"
				@click="updateTaskData(false)">
				<IconsSave />
				Save
			</BaseButton>
			<BaseButton v-if="(taskData?.permissions.canUpdateAll || taskData?.permissions.canUpdate) && clonedDataHasBeenEditted" size="sm" class="gap-4" @click="updateTaskData(true)">
				<IconsSaveClose />
				Save & close
			</BaseButton>
			<!-- <BaseButton size="sm" class="gap-4">
				<IconsDeactivate />
				Deactivate
			</BaseButton> -->
			<BaseButton
				v-if="taskData?.permissions.canDelete"
				size="sm"
				class="gap-4"
				:disabled="currentAction === 'deleting'"
				@click="deleteTask">
				<IconsTrash />
				Delete
			</BaseButton>
			<BaseButton
				v-if="contributorsToRemove.length"
				size="sm"
				class="gap-4"
				:disabled="currentAction === 'removing-contributors'"
				@click="removeContributorsFromTask">
				<IconsTrash />
				Remove
			</BaseButton>
			<BaseButton size="sm" class="gap-4" @click="refresh">
				<IconsArrowRefresh />
				Refresh
			</BaseButton>
		</DashboardPageHeader>
		<div v-if="taskData" class="task-page__content">
			<DashboardTaskDetails :task="taskData" />
			<BaseTabs v-model="currentTab" :tabs="tabs" />
			<div class="task-page__body flex flex-column">
				<div class="task-page__form flex flex-column">
					<DashboardTaskCreationForm
						v-model="clonedData[0]"
						:show-title="false"
						usage="update"
						:show-objective-select="false"
						:show-actions="false"
						:permissions="taskData?.permissions" />
					<div class="task-page__objectives flex items-center">
						<p class="weight-500">Performance Objective</p>
						<NuxtLink class="flex items-center gap-8" :to="`/objectives/${taskData?.objective.id}`">
							<IconsPerformanceObjective />
							<span class="weight-500 body-small color-sec">{{ taskData?.objective.name }}</span>
						</NuxtLink>
					</div>
					<div class="task-page__owner flex items-center">
						<p class="weight-500">Owner</p>
						<div v-if="taskData" class="flex items-center gap-8">
							<BaseAvatar size="sm" :name="taskData.owningEmployee.name || ''" />
							<span class="weight-500 body-small color-sec">{{ taskData.owningEmployee.name }}</span>
						</div>
					</div>
				</div>
				<DashboardTaskContributorsList
					v-model="contributorsToRemove"
					:contributors="taskData?.contributors ?? []"
					:loading="pending"
					@refresh="refresh" />
			</div>
		</div>

		<BaseLoadingModal v-if="currentAction" :text="loadingModalText" />

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
%content-padding {
	padding: 2rem;

	@include breakpoint(md) {
		padding: 2rem 3.2rem;
	}
}

%content-background {
	border-radius: 1.2rem;
	border: 0.1rem solid $outline-stroke;
	background: $light-grey;
	gap: 2rem;
}

.task-page {
	&__body {
		@extend %content-padding;
		gap: 1.2rem;
		padding-bottom: 10rem;

		@include breakpoint(lg) {
			display: grid;
			grid-template-columns: 40% 60%;
		}
	}

	&__form {
		padding: 1.6rem;
		@extend %content-background;
		width: 100%;
	}

	&__objectives,
	&__owner {
		justify-content: space-between;
		gap: 4.6rem;

		@include breakpoint(md) {
			gap: 7.6rem;
		}

		p:first-child {
			@include typography(1.4rem, 140%);
			color: #4a4a68;
			width: 100%;
			max-width: 8.9rem;
		}

		> div,
		> a {
			width: 100%;
		}
	}
}
</style>
