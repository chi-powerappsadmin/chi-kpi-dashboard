<script setup lang="ts">
import RadialProgress from "radial-progress-vue3";
import { useVuelidate } from "@vuelidate/core";
import { helpers, integer, maxValue, minLength, minValue, required, requiredIf } from "@vuelidate/validators";
import type { Note, Objective } from "~/types/models/Objective";
import { vuelidateErrorMessage } from "~/helpers/functions";
interface Props {
	notes: Note[];
	canEdit: boolean;
	objective: Objective;
}

interface Emits {
	(e: "refresh"): void;
}
const props = defineProps<Props>();
defineEmits<Emits>();

const modelValue = defineModel<{
	name: string;
	description: string;
	weight: number;
	measurement: number;
	target: number;
	actual: string | number;
	period: string | null;
	progress: number | string;
	priority: number;
	owner: string;
	currency: string;
}>({
	required: true,
});

const { periods } = storeToRefs(usePeriodStore());
const { priorities } = storeToRefs(usePrioritiesStore());
const { currencies } = storeToRefs(useCurrencyStore());

const { measurementTypes } = storeToRefs(useObjectivesStore());

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

const measurementOptions = measurementTypes.value.map(({ name, value }) => {
	return {
		value,
		label: name,
	};
});

const mappedPriorities = priorities.value.map((priority) => {
	return {
		value: priority.value,
		label: priority.name,
	};
});

function canBeChanged(key: keyof typeof modelValue.value) {
	if (
		(key === "name" ||
			key === "description" ||
			key === "weight" ||
			key === "measurement" ||
			key === "target" ||
			key === "priority" ||
			key === "currency" ||
			key === "period") &&
		props.canEdit
	) {
		return true;
	}
}

const currencyRequired = computed(() => modelValue.value.measurement === 0);

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

const v$ = useVuelidate(rules, modelValue, { $autoDirty: true, $lazy: true });

// watch modelValue.measurement and set currency to null if measurement is not 0
watch(modelValue.value, (newVal) => {
	if (newVal.measurement !== 0) {
		modelValue.value.currency = "";
	} else if (newVal.measurement === 0) {
		modelValue.value.currency = props.objective.currency || currencies.value[0]?.id;
	}
});
</script>

<template>
	<div class="objective-details__general">
		<div class="info">
			<BaseInput
				id="subject"
				v-model.trim="v$.name.$model"
				label="Name"
				name="name"
				sizing="padding"
				padding="1.6rem"
				:required="true"
				:has-error="v$.name.$invalid"
				:error-message="vuelidateErrorMessage(v$.name.$errors)"
				:disabled="!canBeChanged('name')" />

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
				:disabled="!canBeChanged('description')" />

			<BaseInput
				id="weight"
				v-model.number="v$.weight.$model"
				label="Weight"
				name="weight"
				sizing="padding"
				padding="1.6rem"
				:required="true"
				:has-error="v$.weight.$invalid"
				:error-message="vuelidateErrorMessage(v$.weight.$errors)"
				:disabled="!canBeChanged('weight')" />

			<BaseSelect
				id="measurement"
				v-model.number="v$.measurement.$model"
				required
				:options="measurementOptions"
				label="Measurement"
				name="measurement"
				:has-error="v$.measurement.$error"
				:error-message="vuelidateErrorMessage(v$.measurement.$errors)"
				:disabled="!canBeChanged('measurement')"
				:invalid="v$.measurement.$error" />

			<BaseSelect
				v-if="modelValue.measurement === 0"
				id="currency"
				v-model="v$.currency.$model"
				required
				:invalid="v$.currency.$error"
				name="currency"
				:error-message="vuelidateErrorMessage(v$.currency.$errors)"
				label="Currency"
				:disabled="!canBeChanged('currency')"
				:options="currencyOptions" />

			<BaseSelect
				id="priority"
				v-model.number="v$.priority.$model"
				name="priority"
				label="Priority"
				:options="mappedPriorities"
				:invalid="v$.priority.$invalid"
				:disabled="!canBeChanged('priority')"
				:error-message="vuelidateErrorMessage(v$.priority.$errors)"
				placeholder="Select objective priority" />

			<BaseSelect
				id="period"
				v-model="v$.period.$model"
				required
				:invalid="v$.period.$error"
				name="period"
				label="Period"
				:options="periodOptions"
				:disabled="!canBeChanged('period')"
				:error-message="vuelidateErrorMessage(v$.period.$errors)" />

			<BaseInput
				id="target"
				v-model.number="v$.target.$model"
				required
				label="Target"
				name="target"
				:has-error="v$.target.$error"
				:disabled="!canBeChanged('target')"
				:error-message="vuelidateErrorMessage(v$.target.$errors)" />

			<BaseInput id="actual" v-model="modelValue.actual" required label="actual" name="actual" disabled />

			<div class="info-item items-center">
				<p>
					<span>Progress</span>
				</p>

				<p class="flex items-center">
					<RadialProgress
						:percent="modelValue.progress"
						:width="72"
						viewBox="0 0 72 72"
						:stroke-width="8"
						stroke-color="#4b4ded"
						inner-stroke-color="#E8E8E8"
						:show-text="false"
						fill-color="transparent"
						rounded-stroke
						:clock-wise="false" />

					<span>{{ modelValue.progress }} %</span>
				</p>
			</div>
			<div class="info-item" :style="{ cursor: 'not-allowed' }">
				<p>
					<span>Owner</span>
				</p>

				<p>{{ modelValue.owner }}</p>
			</div>
		</div>
		<div>
			<slot />
		</div>
	</div>
</template>

<style lang="scss" scoped>
.objective-details__general {
	display: grid;
	gap: 1.2rem;
	align-items: start;
	grid-template-columns: 1fr;

	@include breakpoint(lg) {
		grid-template-columns: auto 1fr;
	}

	.info {
		@include breakpoint(lg) {
			max-width: 36rem;
		}

		@include breakpoint(xl) {
			max-width: 44rem;
		}

		background-color: $light-grey;
		padding: 1.6rem;
		display: grid;
		gap: 2rem;
		border: 0.1rem solid $outline-stroke;
		border-radius: 1.2rem;
		@include typography(1.4rem, 140%);

		&-item {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 0.8rem;

			color: $text;

			p:first-of-type {
				text-transform: capitalize;
				display: flex;
				gap: 0.8rem;
				height: auto;

				svg {
					width: 1.8rem;
					height: 1.8rem;
				}
			}
		}
	}
}
</style>
