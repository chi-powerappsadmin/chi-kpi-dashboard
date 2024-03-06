<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core";
import { helpers, numeric, required, requiredIf } from "@vuelidate/validators";
import { vuelidateErrorMessage } from "~/helpers/functions";
import type { apiError } from "~/types/apiResponse/apiResponse";
import type { CreateTaskResponse } from "~/types/apiResponse/tasks";

interface TaskForm {
	subject: string;
	description: string;
	priority: number ;
	target: number | string;
	actual?: number | string;
	startDate: string;
	endDate: string;
	objective: string;
}

interface Props {
	title?: string;
	showTitle?: boolean;
	redirectAfterCreation?: boolean;
	showObjectiveSelect?: boolean;
	showActions?: boolean;
	usage?: "create" | "update";
	permissions?: {
		canDelete: boolean;
		canUpdate: boolean;
		canUpdateAll: boolean;
	};
}

interface Emits {
	(e: "cancel"): void;
	(e: "is-loading", value: boolean): void;
	(e: "success"): void;
}

const emits = defineEmits<Emits>();
const { user } = storeToRefs(useUserStore());
const { objectives } = storeToRefs(useObjectivesStore());
const {priorities} = storeToRefs(usePrioritiesStore());
const {
	title = "Quick Create: Objective Task",
	showTitle = true,
	redirectAfterCreation = true,
	showObjectiveSelect = false,
	showActions = true,
	usage = "create",
	permissions,
} = defineProps<Props>();

const form = defineModel({
	default: {
		subject: "",
		description: "",
		priority: 0,
		target: "",
		actual: "",
		startDate: "",
		endDate: "",
		objective: "",
	},
}) as unknown as Ref<TaskForm>;


const isCreatingTask = ref(false);
const mappedObjectives = objectives.value.map((objective) => {
	return {
		value: objective.id,
		label: objective.name,
	};
});
const mappedPriorities = priorities.value.map((priority) => {
	return {
		value: priority.value,
		label: priority.name,
	};
});
const canEditTaskData = computed(() => usage === "create" || (usage === "update" && permissions?.canUpdateAll));

const rules = {
	subject: { required: helpers.withMessage("Subject is required", required) },
	description: { required: helpers.withMessage("Description is required", required) },
	priority: { required: helpers.withMessage("Priority is required", required) },
	target: {
		required: helpers.withMessage("Target is required", required),
		numeric: helpers.withMessage("Target must be a number", numeric),
	},
	startDate: {
		required,
		minValue: helpers.withMessage("Start Date cannot be in the past", (value: string) => {
			return new Date(value).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0);
		}),
		maxValue: helpers.withMessage("Start Date cannot greater than end date", (value: string) => {
			return new Date(value).setHours(0, 0, 0, 0) <= new Date(form.value.endDate).setHours(0, 0, 0, 0);
		}),
	},
	endDate: {
		required,
		minValue: helpers.withMessage("End Date cannot be in the lesser than end date", (value: string) => {
			return new Date(value).setHours(0, 0, 0, 0) >= new Date(form.value.startDate).setHours(0, 0, 0, 0);
		}),
	},
	objective: {
		requiredIf: requiredIf(function () {
			return showObjectiveSelect;
		}),
	},
};

const v$ = useVuelidate(rules, form, { $autoDirty: true, $lazy: true });

const createNewTask = async () => {
	v$.value.$touch();
	if (v$.value.$invalid) return;
	isCreatingTask.value = true;
	try {
		const response = await useApi<CreateTaskResponse>("/tasks/create", {
			method: "POST",
			body: { ...form.value, owningEmployeeID: user.value?.userData?.id },
		});
		emits("success");
		useToast("success", "Successful", "New task have been created successfully.", 3500, true);
		if (redirectAfterCreation) {
			navigateTo({ name: "tasks-id", params: { id: response.data } });
		}
	} catch (error) {
		const err = error as apiError;
		useToast("error", "Error", err.message, 3500, true);
	} finally {
		isCreatingTask.value = false;
	}
};

watch(isCreatingTask, (value) => {
	emits("is-loading", value);
});
</script>

<template>
	<div class="create-task flex flex-column">
		<h5 v-if="showTitle" class="create-task__title">{{ title }}</h5>
		<form class="create-task__form flex flex-column">
			<BaseInput
				id="subject"
				v-model.trim="v$.subject.$model"
				label="Subject"
				name="subject"
				sizing="padding"
				padding="1.6rem"
				:required="true"
				:has-error="v$.subject.$invalid"
				:error-message="vuelidateErrorMessage(v$.subject.$errors)"
				:disabled="!canEditTaskData" />

			<BaseTextArea
				id="description"
				v-model.trim="v$.description.$model"
				label="Description"
				name="description"
				sizing="padding"
				padding="1.6rem"
				:required="true"
				:has-error="v$.description.$invalid"
				:error-message="vuelidateErrorMessage(v$.description.$errors)"
				:disabled="!canEditTaskData" />

			<BaseSelect
				v-if="usage === 'create'"
				id="priority"
				v-model="v$.priority.$model"
				name="priority"
				label="Priority"
				:options="mappedPriorities"
				:invalid="v$.priority.$invalid"
				:error-message="vuelidateErrorMessage(v$.priority.$errors)"
				placeholder="Select task priority"
				:disabled="!canEditTaskData && !permissions?.canUpdate" />

				
			<BaseInput
				id="target"
				v-model.number="v$.target.$model"
				label="Target"
				name="target"
				sizing="padding"
				padding="1.6rem"
				:required="true"
				:has-error="v$.target.$invalid"
				:error-message="vuelidateErrorMessage(v$.target.$errors)"
				:disabled="!canEditTaskData" />
			<BaseInput
				v-if="usage === 'update'"
				id="actual"
				:model-value="form.actual"
				label="Actual"
				name="actual"
				sizing="padding"
				padding="1.6rem"
				required
				:disabled="!canEditTaskData && !permissions?.canUpdate" />
			<BaseInput
				id="startDate"
				v-model="v$.startDate.$model"
				label="Start Date"
				name="start-date"
				type="date"
				sizing="padding"
				padding="1.6rem"
				:required="true"
				:has-error="v$.startDate.$invalid"
				:error-message="vuelidateErrorMessage(v$.startDate.$errors)"
				:disabled="!canEditTaskData" />
			<BaseInput
				id="endDate"
				v-model="v$.endDate.$model"
				label="End Date"
				name="end-date"
				type="date"
				sizing="padding"
				padding="1.6rem"
				:required="true"
				:has-error="v$.endDate.$invalid"
				:error-message="vuelidateErrorMessage(v$.endDate.$errors)"
				:disabled="!canEditTaskData" />
			<BaseSelect
				v-if="usage === 'create' && showObjectiveSelect"
				id="objective"
				v-model="v$.objective.$model"
				name="objective"
				label="Performance Objective"
				:options="mappedObjectives"
				:invalid="v$.objective.$invalid"
				placeholder="Select a performance objective"
				:disabled="!canEditTaskData" />
		</form>

		<slot name="objective-name-and-owner" />

		<div v-if="showActions || usage === 'create'" class="create-task__actions flex items-center">
			<BaseButton variant="grey" type="button" :disabled="isCreatingTask" @click="$emit('cancel')">
				Cancel
			</BaseButton>
			<BaseButton
				variant="purple"
				:loading="isCreatingTask"
				:disabled="v$.$invalid || isCreatingTask"
				@click="createNewTask">
				Save and close
			</BaseButton>
		</div>
	</div>
</template>

<style lang="scss" scope>
.create-task {
	gap: 2rem;

	&__title {
		@include typography(2rem, normal, 2.4rem);
	}

	&__form {
		gap: 1.2rem;
	}

	&__objective,
	&__owner {
		justify-content: space-between;
		gap: 4.6rem;

		@include breakpoint(md) {
			gap: 7.6rem;
		}

		p:first-child {
			color: #4a4a68;
			max-width: 8.9rem;
		}
	}

	&__actions {
		margin-top: 7.6rem;
		gap: 1.2rem;
	}
}
</style>
