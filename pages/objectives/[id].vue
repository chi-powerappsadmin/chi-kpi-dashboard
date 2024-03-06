<script setup lang="ts">
import { splitStringByUppercase } from "~/helpers/functions";
import type { apiError } from "~/types/apiResponse/apiResponse";
import type { GetPerformanceObjectiveByIdResponse } from "~/types/apiResponse/objectives";
import { type Objective } from "~/types/models/Objective";
definePageMeta({
	layout: "dashboard",
	middleware: "auth",
});

const route = useRoute();
const router = useRouter();

const {
	data: objective,
	pending,
	refresh,
} = await useAsyncData(
	`objectives/${route.params.id}`,
	() =>
		useApi<GetPerformanceObjectiveByIdResponse>("/objectives/id:guid", {
			query: {
				objectiveID: route.params.id,
				loadTasks: true,
			},
		}),
	{
		transform(d) {
			const sortedNotes = d.data.notes
				? d.data.notes.sort((a, b) => {
						if (new Date(a.modifiedOn) > new Date(b.modifiedOn)) return -1;
						else return 1;
				  })
				: [];
			return { ...d.data, notes: sortedNotes } as Objective;
		},
	},
);

const tabs = [
	{ value: "general", label: "General" },
	{ value: "tasks", label: "Tasks" },
];

const currentTab = ref(route?.query?.tab ?? "general");

const showApprovalModal = ref(false);
const showRejectionModal = ref(false);
const showSubmitObjectiveModal = ref(false);
const showBusinessErrorModal = ref(false);
const isDeleting = ref(false);
const rejectionReason = ref("");
const actionText = ref("");
const redirectUrl = ref(""); // url user wants to visit before unsaved changes prompt
const showUnsavedChangesModal = ref(false);
const approveModal = ref(false);
const reviseModal = ref(false);
const recallModal = ref(false);

async function deleteObjective() {
	try {
		isDeleting.value = true;
		await useApi("/objectives/delete/id:guid", {
			method: "DELETE",
			query: {
				objectiveID: route.params.id,
			},
		});

		useToast("success", "Deleted!", "Objective deleted!", 3500, true);

		router.replace("/objectives");
	} catch (error) {
		const err = error as apiError;
		useToast("error", "Error!", err.message, 3500, true);
	} finally {
		isDeleting.value = false;
	}
}

const mappedObjective = computed(() => {
	if (!objective.value) return null;
	return {
		name: objective.value.name,
		description: objective.value.description,
		weight: objective.value.weight.toFixed(2),
		measurement: objective.value.measurement.value,
		currency: objective.value.currency,
		target: objective.value.target,
		actual: objective.value.actual || "-",
		period: objective.value.period.id,
		progress: objective.value.progress || 0,
		priority:objective.value.priority.value,
		owner: objective.value.owningEmployee.name || "-",
	};
});

const { clonedData, clonedDataHasBeenEditted } = useCloneAndCompareData(computed(() => [mappedObjective.value]));

const isUpdating = ref(false);

async function handleUpdate() {
	if (!clonedData.value[0]) return;

	try {
		actionText.value = "Updating Objective!";
		isUpdating.value = true;
		const { name, description, weight, measurement, target, period, currency, priority } = clonedData.value[0];
		const data = {
			id: objective.value?.id,
			name,
			description,
			weight,
			measurement,
			target,
			period,
			currency,
			priority,
		};

		await useApi("/objectives/update", {
			method: "PATCH",
			body: data,
		});
		await refresh();
		useToast("success", "Success!", "Objective Updated!", 3500, true);
	} catch (error) {
		const err = error as apiError;
		useToast("error", "Error updating objective!", err.message, 8000, true);
	} finally {
		isUpdating.value = false;
	}
}

async function setApprovalStatus(statusType: "submit" | "approve" | "reject" | "revise" | "recall") {
	if (statusType === "reject" && !rejectionReason.value) return;
	try {
		let status = 10;
		if (statusType === "submit")
			actionText.value = "Please wait while we submit your Performance Objective for Approval.";
		if (statusType === "approve") {
			actionText.value = "Please wait while we approve this Performance Objective.";
			status = 20;
			approveModal.value = false;
		}
		if (statusType === "reject") {
			actionText.value = "Please wait while we reject this Performance Objective.";
			status = 30;
		}
		if (statusType === "revise") {
			actionText.value = "Please wait while we submit this Performance Objective for revision.";
			status = 0;
			reviseModal.value = false;
		}
		if (statusType === "recall") {
			actionText.value = "Please wait while we recall this Performance Objective.";
			status = 0;
			recallModal.value = false;
		}
		isUpdating.value = true;
		await useApi("/objectives/approval", {
			method: "PATCH",
			body: {
				id: objective.value?.id,
				status,
				recordURL: window.location.href,
				...(statusType === "reject" && { approverComment: rejectionReason.value }),
			},
		});
		await refresh();
		if (statusType === "submit") useToast("success", "Success!", "Submitted for approval", 3500, true);
		if (statusType === "approve") showApprovalModal.value = true;
		if (statusType === "reject")
			useToast("success", "Success!", "The Performance Objective has been successfully rejected.", 3500, true);
		if (statusType === "revise") useToast("success", "Success!", "Submitted for revision", 3500, true);
	} catch (error) {
		const err = error as apiError;
		useToast("error", "Error !", err.message, 3500, true);
	} finally {
		isUpdating.value = false;
	}
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
	<div class="objectives-page">
		<div class="objectives-page__top">
			<div class="objectives-page__actions">
				<BaseButton v-if="objective?.permissions.canDelete" size="sm" @click="deleteObjective">
					<IconsTrash />
					<span>Delete</span>
				</BaseButton>
				<BaseButton size="sm" :loading="pending" @click="refresh">
					<IconsArrowRefresh />
					<span>Refresh</span>
				</BaseButton>
				<BaseButton v-if="clonedDataHasBeenEditted" size="sm" :loading="pending" @click="handleUpdate">
					<IconsSave />
					<span>Save</span>
				</BaseButton>

				<BaseButton
					v-if="objective?.permissions.canSubmit"
					size="sm"
					variant="outline-purple"
					@click="showSubmitObjectiveModal = true">
					Get Approval
				</BaseButton>

				<template v-if="objective?.permissions.canApprove">
					<BaseButton size="sm" variant="outline-success" @click="approveModal = true">
						Approve Request
						<IconsCheckCircle />
					</BaseButton>
					<BaseButton size="sm" variant="outline-danger" @click="showRejectionModal = true">
						Reject Request
						<IconsCloseCircle />
					</BaseButton>
				</template>

				<BaseButton
					v-if="objective?.permissions.canRevise"
					size="sm"
					variant="outline-info"
					@click="reviseModal = true">
					Revise Request
					<IconsEditCircle />
				</BaseButton>
				<BaseButton
					v-if="objective?.permissions.canRecall"
					size="sm"
					variant="outline-danger"
					@click="recallModal = true">
					Recall Request
					<IconsEditCircle />
				</BaseButton>
			</div>
		</div>
		<div class="objectives-page__main">
			<div>
				<div class="objectives-page__main-title flex relative">
					<div>
						<p class="weight-500 flex items-center">
							{{ objective?.name }} •
							<small>saved</small>
						</p>
						<p>Performance Objective</p>
					</div>
					<div class="objectives-page__main-status">
						<div>
							<div class="flex items-start flex-column">
								<p class="weight-500">
									{{ splitStringByUppercase(objective?.approvalStatus.name || "") }}
								</p>
								<p>Approval Status</p>
							</div>
						</div>
						<IconsDividerVertical />
						<div class="flex items-center">
							<div class="flex items-start flex-column">
								<p class="weight-500">
									{{ splitStringByUppercase(objective?.objectiveStatus.name || "") }}
								</p>
								<p>Objective Status</p>
							</div>
						</div>
					</div>
				</div>
				<div style="z-index: 3">
					<BaseTabs v-model="currentTab" :tabs="tabs" />
				</div>
			</div>

			<div v-if="objective" class="objectives-page__details">
				<div v-if="currentTab === 'general'" style="padding: 2rem 3.2rem">
					<DashboardObjectiveDetailsGeneral
						v-if="clonedData[0]"
						v-model="clonedData[0]"
						:objective="objective"
						:notes="objective.notes || []"
						:can-edit="objective.permissions.canUpdate"
						@refresh="refresh">
						<DashboardObjectiveObjectivesNoteList :can-add-note="objective.permissions.canAddNote" :notes="objective.notes || []" @refresh="refresh" />
					</DashboardObjectiveDetailsGeneral>
				</div>

				<div v-if="currentTab === 'tasks'">
					<DashboardObjectiveDetailsTasks
						:objective="objective"
						:tasks="objective.tasks || []"
						:loading="pending"
						@refresh="refresh" />
				</div>
			</div>
		</div>

		<BaseModal v-model="showRejectionModal">
			<div class="rejection-modal">
				<div class="icon-wrapper">
					<div class="icon flex items-center content-center">
						<IconsAlert />
					</div>
				</div>
				<p class="title">Perfomance Objective</p>
				<p class="name weight-500">{{ objective?.name }}</p>
				<p class="description">Kindly include your reason for decline.</p>
				<BaseTextArea
					id="reason-decline"
					v-model.trim="rejectionReason"
					name="reason-decline"
					label="Reason for decline" />
				<div class="actions">
					<BaseButton
					variant="purple"
					:disabled="!rejectionReason"
					@click="(showRejectionModal = false), setApprovalStatus('reject')">
					Submit
				</BaseButton>
				<BaseButton
					variant="danger"
					@click="showRejectionModal = false">
					Cancel
				</BaseButton>
				</div>
			</div>
		</BaseModal>

		<BaseModal v-model="showApprovalModal">
			<div class="approval-modal">
				<div class="icon-wrapper">
					<div class="icon flex items-center content-center">
						<IconsAlert />
					</div>
				</div>
				<p class="title">Perfomance Objective</p>
				<p class="name weight-500">{{ objective?.name }}</p>
				<p class="description">
					Great news! The Performance Objective with the above details has been approved and is now available
					for use in our system.
				</p>
				<p class="weight-500">
					Please ensure that all relevant documentation and information are up-to-date and in compliance with
					our guidelines.
				</p>
				<BaseButton variant="success" @click="showApprovalModal = false">Okay</BaseButton>
			</div>
		</BaseModal>

		<BaseModal v-model="showSubmitObjectiveModal">
			<div class="submit-objective-modal">
				<div class="flex content-end items-center">
					<button class="close-btn flex items-center content-center" @click="showSubmitObjectiveModal = false">
						<IconsX />
					</button>
				</div>
				<p class="name weight-500">Submit Performance Objective</p>
				<p class="title">Are you sure you want to submit performance objective for approval</p>
				<div class="buttons flex items-center">
					<BaseButton variant="grey" @click="showSubmitObjectiveModal = false">Cancel</BaseButton>
					<BaseButton
						variant="purple"
						@click="(showSubmitObjectiveModal = false), setApprovalStatus('submit')">
						Yes, Submit
					</BaseButton>
				</div>
			</div>
		</BaseModal>

		<BaseModal v-model="showBusinessErrorModal">
			<div class="business-error-modal">
				<div class="flex content-end items-center">
					<button class="close-btn" @click="showBusinessErrorModal = false">
						<IconsX />
					</button>
				</div>
				<p class="name weight-500 flex items-center">
					<IconsAlert class="red" />
					Business Process Error
				</p>
				<p class="title">
					You cannot add an additional Target because you have reached maximum for the objective
				</p>
				<div class="buttons flex content-center">
					<BaseButton variant="purple">Okay</BaseButton>
				</div>
			</div>
		</BaseModal>

		<BaseLoadingModal v-if="isUpdating" :text="actionText" />
		<BaseLoadingModal v-if="isDeleting" text="Please wait while we delete this objective." />

		<BaseDialogModal
			v-if="showUnsavedChangesModal"
			title="Discard changes?"
			:description="`Some information have been changed and are currently unsaved. Are you sure to continue without saving?`"
			yes-text="No, stay"
			no-text="Yes, leave"
			@no="toggleUnsavedChangesModal(false), navigateTo(redirectUrl)"
			@yes="toggleUnsavedChangesModal(false), (redirectUrl = '')"></BaseDialogModal>

			<BaseDialogModal
			v-if="approveModal"
			title="You are about to approve this Performance Objective."
			:description="`Once it is approved, the owner can commence work on the Performance Objective.`"
			yes-text="Yes, approve"
			no-text="Cancel"
			@no="approveModal = false"
			@yes="setApprovalStatus('approve')"/>

			<BaseDialogModal
			v-if="reviseModal"
			title="This Performance Objective will be revised."
			:description="`Progress on tasks may be lost and you will need to send another Approval Request to start again.`"
			yes-text="Yes, revise"
			no-text="Cancel"
			@no="reviseModal = false"
			@yes="setApprovalStatus('revise')"/>

			<BaseDialogModal
			v-if="recallModal"
			title="You are about to recall this Performance Objective."
			:description="`Once it is recalled, the approval request will be halted.`"
			yes-text="Yes, recall"
			no-text="Cancel"
			@no="recallModal = false"
			@yes="setApprovalStatus('recall')"/>

			


	</div>
</template>

<style lang="scss" scoped>
.objectives-page {
	height: 100%;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	overflow: hidden;

	&__main {
		// display: none !important;
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		overflow: auto;

		&-title {
			display: flex;
			align-items: flex-start;
			justify-content: space-between;
			flex-direction: column;
			gap: 1.2rem;
			padding: 2rem 3.2rem;

			@include breakpoint(lg) {
				flex-direction: row;
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

			p {
				gap: 1.2rem;
				@include typography(1.6rem, normal, 2.4rem);

				small {
					@include typography(1.2, 1.4, 1.6rem);
				}

				&:last-of-type {
					@include typography(1.4rem, 1.4);
				}
			}
		}

		&-status {
			padding: 1.2rem 1.6rem;
			border: 1px solid $outline;
			border-radius: 1.2rem;
			display: flex;
			align-items: center;
			gap: 1.2rem;
			color: $text;
			position: relative;

			p {
				@include typography(1.4rem, 1.4, 1.6rem);
			}

			> svg {
				color: $outline;
			}
		}
	}

	&__details {
		flex: 1;
		overflow: auto;
	}
}

.rejection-modal,
.approval-modal,
.submit-objective-modal,
.business-error-modal {
	max-width: 100%;
	width: 44rem;
	background-color: #ffffff;
	padding: 3.2rem;
	border-radius: 1.6rem;
	text-align: center;
	color: $grey;

	.title {
		color: $text;
		@include typography(1.4rem, 1.4);
	}

	.name {
		color: $text;
		margin-top: 0.4rem;
		@include typography(1.6rem, 1.4, 2rem);
	}

	.actions{
		display: grid;
		grid-template-columns: 1fr 1fr;
		
	}
}

.rejection-modal,
.approval-modal {
	.description {
		margin: 1.7rem 0;
		color: $grey;
	}

	.icon-wrapper {
		padding: 2.4rem;

		.icon {
			margin: 0 auto;
			border: 1px solid;
			border-radius: 50%;
			height: calc(3.6rem + 2.4rem);
			aspect-ratio: 1;

			svg {
				height: 3.6rem;
				width: 3.6rem;
				// display: none;
			}
		}
	}

	form {
		display: grid;
		gap: 0.8rem;
	}

	button {
		margin: 1.6rem auto;
		padding-left: 4.8rem;
		padding-right: 4.8rem;
	}
}

.rejection-modal {
	.icon-wrapper {
		color: $danger;

		.icon {
			border-color: $danger;
			background-color: #ffeded;
		}
	}
}

.approval-modal {
	.icon-wrapper {
		color: $success;

		.icon {
			border-color: $success;
			background-color: #e8fcef;
		}
	}

	p:last-of-type {
		@include typography(1rem, 1.6);
	}
}

.submit-objective-modal,
.business-error-modal {
	text-align: left;

	.buttons {
		display: flex;
		gap: 1.2rem;
	}

	.close-btn {
		border-radius: 50%;
		background-color: rgba(116, 116, 128, 0.08);
		height: 2.4rem;
		aspect-ratio: 1;
	}

	.name {
		margin-top: 0.8rem;
		gap: 1rem;

		svg.red {
			color: $danger;
		}
	}

	.title {
		margin-top: 2.4rem;
	}

	.buttons {
		margin-top: 4rem;
	}
}
</style>
