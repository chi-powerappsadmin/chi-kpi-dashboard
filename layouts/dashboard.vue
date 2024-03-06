<script setup lang="ts">
import { usePrioritiesStore } from "~/stores/priorties";
import type { GetAllCurrenciesResponse } from "~/types/apiResponse/currency";
import type { GetEmployeesResponse } from "~/types/apiResponse/employees";
import type { GetObjectiveMeasurementTypesResponse, GetPerformanceObjectives } from "~/types/apiResponse/objectives";
import type { GetKpiPeriodsResponse } from "~/types/apiResponse/period";
import type { GetAllPriorities } from "~/types/apiResponse/priorities";

const { user } = storeToRefs(useUserStore());

const { isAuthenticated } = useUserStore();
onMounted(async () => {
	if (isAuthenticated) {
		const { $patch: patchCurrencyStore } = useCurrencyStore();
		const { $patch: patchPeriodStore } = usePeriodStore();
		const { $patch: patchObjectivesStore } = useObjectivesStore();
		const { $patch: patchEmployeesStore } = useEmployeesStore();
		const {$patch: patchPrioritiesStore } = usePrioritiesStore();
		const [currencies, periods, objectives, employees, objectiveMeasurementTypes, prorities] = await Promise.all([
			useApi<GetAllCurrenciesResponse>("/currencies"),
			useApi<GetKpiPeriodsResponse>("periods"),
			useApi<GetPerformanceObjectives>("/objectives"),
			useApi<GetEmployeesResponse>("/employees"),
			useApi<GetObjectiveMeasurementTypesResponse>("/objectives/measurementtypes"),
			useApi<GetAllPriorities>("/tasks/priorities")
		]);
		patchCurrencyStore({ currencies: currencies.data });
		patchPeriodStore({ periods: periods.data });
		patchObjectivesStore({ objectives: objectives.data, measurementTypes: objectiveMeasurementTypes.data });
		patchEmployeesStore({ employees: employees.data });
		patchPrioritiesStore({ priorities: prorities.data });
	}
});
</script>

<template>
	<div id="__layout">
		<TopBar :user="user" />
		<main>
			<Sidebar />
			<section class="main-content">
				<div>
					<slot />
				</div>
			</section>
		</main>
	</div>
</template>

<style lang="scss" scoped>
#__layout {
	height: 100dvh;
	// max-height: 100vh;
	// overflow: hidden;
	display: grid;
	grid-row: 7.2rem 1fr;
}

main {
	flex-grow: 1;
	display: grid;
	grid-template-columns: 1fr;
	background-color: white;

	@include breakpoint(md) {
		grid-template-columns: auto 1fr;
	}

	.main-content {
		height: calc(100dvh - 7.2rem);
		max-height: calc(100dvh - 7.2rem);
		overflow: auto;

		> div {
			height: 100%;
		}
	}

	.sidebar {
		width: 30.4rem;
		max-width: calc(100vw - 4rem);
		height: 100dvh;
		max-height: 100dvh;
		position: absolute;
		top: 0;

		@include breakpoint(md) {
			position: relative;
			height: calc(100dvh - 7.2rem);
			max-height: calc(100dvh - 7.2rem);
		}
	}
}
</style>
