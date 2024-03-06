import type { Employee } from "~/types/models/Employee";

export const useEmployeesStore = defineStore("employees", () => {
	const employees = ref<Employee[]>([]);

	return {
		employees,
	};
});
