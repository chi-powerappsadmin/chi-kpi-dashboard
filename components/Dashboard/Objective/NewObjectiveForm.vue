<script setup lang="ts">
import useVuelidate from "@vuelidate/core";
import { helpers, integer, maxValue, minLength, minValue, required, requiredIf } from "@vuelidate/validators";
import { vuelidateErrorMessage } from "~/helpers/functions";
import type { apiError } from "~/types/apiResponse/apiResponse";
import type { CreateNewObjectiveResponse } from "~/types/apiResponse/objectives";
interface Emits {
	(e: "cancel"): void;
	(e: "isLoading", v: boolean): void;
	(e: "success"): void;
}
const router = useRouter()
const { currencies } = storeToRefs(useCurrencyStore());
const { periods } = storeToRefs(usePeriodStore());
const { user } = storeToRefs(useUserStore());
const {measurementTypes} = storeToRefs(useObjectivesStore())
const {priorities} = storeToRefs(usePrioritiesStore());


const currencyOptions = currencies.value.map((cur) => {
	return {
		value: cur.id,
		label: cur.currencyName,
	};
});
const periodOptions = periods.value.map((per) => {
	return {
		value: per.id,
		label: per.name,
	};
});

const measurementOptions = measurementTypes.value.map(({name, value}) => {
	return {
		value,
		label: name
	}
})

const mappedPriorities = priorities.value.map((priority) => {
	return {
		value: priority.value,
		label: priority.name,
	};
});

const form = reactive({
	name: "",
	description: "",
	weight: null,
	measurement: null,
	target: "",
	currency: "",
	period: "",
	priority: 0,
	owningEmployeeID: user.value?.idTokenClaims?.oid || "",
});

const currencyRequired = computed(() => form.measurement === 0);

const rules = {
	name: {
		required: helpers.withMessage("Name is required", required),
		minLength: helpers.withMessage("Name must be more that 2 characters", minLength(3)),
	},
	description: {
		required: helpers.withMessage("Name is required", required),
		minLength: helpers.withMessage("Description must be more than 2 characters", minLength(3)),
	},
	weight: {
		required: helpers.withMessage("Weight is required", required),
		integer: helpers.withMessage("Must be a number", integer),
		minValue: helpers.withMessage("Value cannot be less than 0", minValue(0)),
		maxValue: helpers.withMessage("Value cannot be greater than 100", maxValue(100)),
	},
	measurement: {
		required: helpers.withMessage("Measurement is required", required),
		integer: helpers.withMessage("Must be a number", integer),
	},
	target: {
		required: helpers.withMessage("Target is required", required),
		integer: helpers.withMessage("Must be a number", integer),
		minValue: helpers.withMessage("Value must be more than 0", minValue(1)),
	},
	currency: {
		requiredIf: helpers.withMessage("Currency is required", requiredIf(currencyRequired)),
	},
	period: {
		required: helpers.withMessage("Period is required", required),
	},
	priority: {
		required: helpers.withMessage("Priority is required", required),
	},
};

const v$ = useVuelidate(rules, form);

const emit = defineEmits<Emits>();

const isLoading = ref(false);

async function createObjective() {
	v$.value.$touch();
	if (v$.value.$invalid) return;

	type Data = {
		name: string;
		description: string;
		weight: number | null;
		measurement: number | null;
		target: string;
		currency?: string;
		period: string;
		priority: number;
		owningEmployeeID: string;
	};
	const data: Data = { ...form };

	if (!currencyRequired.value) {
		delete data.currency;
	}

	try {
		isLoading.value = true;
		const {data: objectiveID} =  await useApi<CreateNewObjectiveResponse>("/objectives/create", {
			method: "POST",
			body: data,
		});	
		useToast("success", "Success!", "Objective successfully created", 3000, true);
		router.push(`/objectives/${objectiveID}`)
		emit("success");
	} catch (error) {
		const err = error as apiError;
		useToast("error", "Error!", err.message, 3000, true);
	} finally {
		isLoading.value = false;
	}
}

function cancelForm() {
	if (isLoading.value) return;
	emit("cancel");
}

watch(
	isLoading,
	(newVal) => {
		emit("isLoading", newVal);
	},
	{ immediate: true },
);
</script>

<template>
	<div class="create-objective-wrapper">
		<div class="title weight-700">Create New Objective</div>
		<form @submit.prevent="createObjective">
			<div class="inputs">
				<BaseInput
					id="name"
					v-model="v$.name.$model"
					required
					label="Name"
					name="name"
					:has-error="v$.name.$error"
					:error-message="vuelidateErrorMessage(v$.name.$errors)" />
				<BaseInput
					id="description"
					v-model="v$.description.$model"
					required
					label="Description"
					name="description"
					:has-error="v$.description.$error"
					:error-message="vuelidateErrorMessage(v$.description.$errors)" />
				<BaseInput
					id="weight"
					v-model.number="v$.weight.$model"
					required
					label="Weight"
					name="weight"
					:has-error="v$.weight.$error"
					:error-message="vuelidateErrorMessage(v$.weight.$errors)" />
				
				<BaseSelect
					id="measurement"
					v-model.number="v$.measurement.$model"
					required
					:options="measurementOptions"
					label="Measurement"
					name="measurement"
					:has-error="v$.measurement.$error"
					:error-message="vuelidateErrorMessage(v$.measurement.$errors)"
					:invalid="v$.measurement.$error" />
				<BaseInput
					id="target"
					v-model.number="v$.target.$model"
					required
					label="Target"
					name="target"
					:has-error="v$.target.$error"
					:error-message="vuelidateErrorMessage(v$.target.$errors)" />
				<BaseSelect
					v-show="currencyRequired"
					id="currency"
					v-model="v$.currency.$model"
					required
					:invalid="v$.currency.$error"
					name="currency"
					:error-message="vuelidateErrorMessage(v$.currency.$errors)"
					label="Currency"
					:options="currencyOptions" />
				<BaseSelect
					id="period"
					v-model="v$.period.$model"
					required
					:invalid="v$.period.$error"
					name="period"
					label="Period"
					:options="periodOptions"
					:error-message="vuelidateErrorMessage(v$.period.$errors)" />

					
			<BaseSelect
				id="priority"
				v-model.number="v$.priority.$model"
				name="priority"
				label="Priority"
				:options="mappedPriorities"
				:invalid="v$.priority.$invalid"
				:error-message="vuelidateErrorMessage(v$.priority.$errors)"
				placeholder="Select objective priority" />
			</div>
			<div class="buttons flex items-center">
				<BaseButton variant="grey" type="button" :disabled="isLoading" @click="cancelForm">Cancel</BaseButton>
				<BaseButton variant="purple" :loading="isLoading">Save and close</BaseButton>
			</div>
		</form>
	</div>
</template>

<style lang="scss" scope>
.create-objective-wrapper {
	width: 100vw;
	max-width: 44.5rem;
	padding: 1.6rem;

	form {
		margin-top: 2.4rem;
	}

	.title {
		@include typography(2rem, normal, 2.4rem);
	}

	.inputs {
		display: grid;
		gap: 1.2rem;
	}

	.info {
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

	.buttons {
		margin-top: 10rem;
		gap: 1.2rem;
	}
}
</style>
