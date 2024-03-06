import type { Objective, ObjectiveMeasurement } from "~/types/models/Objective";

export const useObjectivesStore = defineStore("objective", () => {
	const objectives = ref<Objective[]>([]);
	const measurementTypes = ref<ObjectiveMeasurement[]>([]);

	return {
		objectives,
		measurementTypes,
	};
});
