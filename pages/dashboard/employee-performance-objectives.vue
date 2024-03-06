<script setup lang="ts">
import type { ApexOptions } from "apexcharts";
import type { TableColumn } from "~/components/Base/Table.vue";
import { defaultChartOptions } from "~/helpers/chartConfigs";
import { splitStringByUnderscore, splitStringByUppercase, stringToDate } from "~/helpers/functions";
import type { GetEmployeeBoardResponse } from "~/types/apiResponse/dashboard";
import type { GetPerformanceObjectives } from "~/types/apiResponse/objectives";



enum WeightChartColors {
	NOT_STARTED = "#808080",
	IN_PROGRESS = "#FFBF00",
	DELAYED = "#8B0000",
	OVERDUE = "#EE4B2B",
	COMPLETED = "#19AC65",
}

const { user } = storeToRefs(useUserStore());
const { periods } = storeToRefs(usePeriodStore());

const {
	data: objectives,
	// pending,
	// refresh,
} = await useAsyncData(
	`employeeData-${user.value?.userData?.id}`,
	async () => {
		const employeeID = user.value?.userData?.id;
		const employeeObjectives = await useApi<GetPerformanceObjectives>("/employees/objectives", {
			query: { employeeID },
		});
		return employeeObjectives;
	},

	{
		transform(d) {
			return d.data;
		},
	},
);

const tableData = computed(() => {
	const data = (
		objectives.value?.map(
			({
				id,
				name,
				objectiveStatus,
				owningEmployee,
				target,
				actual,
				weight,
				progress,
				measurement,
				createdOn,
			}) => {
				const type = (() => {
					const wordSplit = splitStringByUnderscore(measurement.name).split(" ");

					return `${wordSplit[0]} (${wordSplit[1]})`;
				})();
				return {
					id,
					name,
					status: splitStringByUppercase( objectiveStatus.name),
					owner: owningEmployee.name,
					target,
					actual,
					weight,
					progress,
					type,
					created_on: stringToDate(createdOn),
				};
			},
		)
	)
	return data?.filter((v) => v.status !== "Completed");
});

const objectiveByWeightOptions = ref<ApexOptions>({
	...defaultChartOptions,
	chart: {
		id: "objective-by-weight-chart",
		type: "pie",
	},
	stroke: {
		width: 0,
	},
	colors: [],
	labels: [],
	tooltip: {
		...defaultChartOptions.tooltip,
		y: {
			...defaultChartOptions.tooltip?.y,
			title: {
				formatter(name) {
					return name + ": ";
				},
			},
			formatter(_val: number, opts) {
				const index = opts.seriesIndex;
				const percent = opts.globals.seriesPercent[index];
				return `${Number(percent).toFixed(1)}%`;
			},
		},
	},
});

const objectiveByWeightLegends = ref<{ title: string; color: WeightChartColors }[]>([]);

const objectiveByWeightSeries = ref<number[]>([]);

const optionsForObjectiveProgress = ref<ApexOptions>({
	...defaultChartOptions,
	chart: { ...defaultChartOptions.chart, type: "bar", id: "objective-progress-chart", stacked: !true },
	tooltip: {
		...defaultChartOptions.tooltip,
		y: {
			...defaultChartOptions.tooltip?.y,
			title: {
				formatter(name) {
					return name + ": ";
				},
			},
		},
	},
	yaxis: [
		{
			...defaultChartOptions.yaxis,
			title: {
				text: "Sum (Target)",
				style: { color: "#686868", fontSize: "8px", fontWeight: 700, fontFamily: "Inter, sans-serif" },
			},
		},
		{
			...defaultChartOptions.yaxis,
			title: {
				text: "Sum (Actual)",
				rotate: 90,
				style: { color: "#686868", fontSize: "8px", fontWeight: 700, fontFamily: "Inter, sans-serif" },
			},
			opposite: true,
		},
	],
	xaxis: {
		...defaultChartOptions.xaxis,
		categories: [],
	},
	colors: ["#19AC65", "#4B4DED", "#F69B13"],
});

const objectivesProgressTrackerLegends = [
	{ color: "#19ac65", title: "Sum (Target)" },
	{ color: "#4b4ded", title: "Sum (Actual)" },
];

const objectivesProgressTrackerSeries = ref([
	{
		name: "Sum (Target)",
		data: [] as number[],
	},
	{
		name: "Sum (Actual)",
		data: [] as number[],
	},
]);

const tableColumns: TableColumn[] = [
	{ value: "name", label: "Name", width: "22rem" },
	{ value: "status", label: "status", width: "12rem" },
	{ value: "type", label: "Type", width: "17rem" },
	{ value: "owner", label: "Owner", width: "12rem" },
	{ value: "target", label: "Target", width: "9rem" },
	{ value: "actual", label: "Actual", width: "9rem" },
	{ value: "weight", label: "Weight", width: "9rem" },
	{ value: "progress", label: "Progress", width: "10rem" },
	{ value: "created_on", label: "Created On", width: "15rem" },
];

function updateObjectiveByWeightData(data: GetEmployeeBoardResponse["data"]) {
	const weightData = data[0].performance.map((per) => {
		return {
			status: per.status,
			value: per.weightScore,
		};
	});

	objectiveByWeightSeries.value = weightData.map((v) => v.value);

	objectiveByWeightLegends.value = weightData.map((v) => {
		const color = (() => {
			switch (v.status) {
				case "NotStarted":
					return WeightChartColors.NOT_STARTED;
				case "InProgress":
					return WeightChartColors.IN_PROGRESS;
				case "Delayed":
					return WeightChartColors.DELAYED;
				case "Overdue":
					return WeightChartColors.OVERDUE;
				case "Completed":
					return WeightChartColors.COMPLETED;
			}
		})();
		return {
			title: splitStringByUppercase(v.status),
			color,
		};
	});

	objectiveByWeightOptions.value = {
		...objectiveByWeightOptions.value,
		labels: weightData.map((v) => splitStringByUppercase(v.status)),
		colors: objectiveByWeightLegends.value.map((v) => v.color),
	};
}

function updateObjectiveTrackerChart(data: GetEmployeeBoardResponse["data"]) {
	const maxValue = data[0].totalTargetScore;
	objectivesProgressTrackerSeries.value = [
		{ name: "Sum (Target)", data: [data[0].totalTargetScore] },
		{ name: "Sum (Actual)", data: [data[0].totalActualScore] },
	];
	optionsForObjectiveProgress.value = {
		...optionsForObjectiveProgress.value,
		xaxis: { ...optionsForObjectiveProgress.value.xaxis, categories: [data[0].employeeName] },
		yaxis: (optionsForObjectiveProgress.value.yaxis as ApexYAxis[]).map((v) => ({
			...v,
			max: maxValue,
		})),
	};
}

const isLoading = ref(false);

const chartData = ref<GetEmployeeBoardResponse["data"]>();

const periodOptions = computed(() =>
	periods.value.map((p) => {
		return {
			label: p.name,
			value: p.id,
		};
	}),
);

const selectedPeriod = ref("");

async function fetchChartData() {
	if (!selectedPeriod.value) return;

	try {
		isLoading.value = true;
		const response = await useApi<GetEmployeeBoardResponse>("/dashboards/employeeboard", {
			query: {
				employeeID: user.value?.idTokenClaims?.oid,
				periodID: selectedPeriod.value,
			},
		});
		chartData.value = response.data;
	} catch (error) {
	} finally {
		isLoading.value = false;
	}
}

watch(
	periods,
	(newVal) => {
		if (newVal.length) {
			selectedPeriod.value = periods.value[0].id;
		}
	},
	{
		immediate: true,
	},
);

watch(
	selectedPeriod,
	(newVal) => {
		if (newVal) {
			fetchChartData();
		}
	},
	{ immediate: true },
);

watch(
	chartData,
	(newVal) => {
		if (newVal) {
			updateObjectiveByWeightData(newVal);
			updateObjectiveTrackerChart(newVal);
		}
	},
	{ immediate: true },
);
</script>

<template>
	<div>
		<div class="flex items-center content-end gap-8 period-select">
			<p>Period:</p>

			<BaseSelect
				id="period-select"
				v-model="selectedPeriod"
				name="period-select"
				:options="periodOptions"
				placeholder="Choose period" />
		</div>
		<div class="team-manager-dashboard flex">
			<DashboardChart
				:loading="isLoading"
				style="grid-area: a"
				title="My Performance Objectives by Status"
				:legends="objectiveByWeightLegends"
				:type="objectiveByWeightOptions.chart?.type"
				:chart-id="objectiveByWeightOptions.chart?.id || 'its-there'"
				@refresh="fetchChartData">
				<ClientOnly>
					<apexchart :height="200" :options="objectiveByWeightOptions" :series="objectiveByWeightSeries" />
				</ClientOnly>
			</DashboardChart>
			<DashboardChart
				:loading="isLoading"
				style="grid-area: b"
				title="My Performance Objectives"
				:legends="objectivesProgressTrackerLegends"
				:type="optionsForObjectiveProgress.chart?.type"
				:chart-id="optionsForObjectiveProgress.chart?.id || 'its there'"
				@refresh="fetchChartData">
				<ClientOnly>
					<apexchart
						type="bar"
						height="200px"
						:options="optionsForObjectiveProgress"
						:series="objectivesProgressTrackerSeries" />
				</ClientOnly>
			</DashboardChart>

			<div class="team-manager-table-data" style="grid-area: c">
				<div class="flex content-between items-center gap-4 actions">
					<p class="weight-500">My Open Performance Objectives</p>
				</div>
				<BaseTable :columns="tableColumns" :table-data="tableData">
					<template #name="{ record, value }">
						<NuxtLink class="table__link" :to="`/objectives/${record.id}`">
							{{ value }}
						</NuxtLink>
					</template>
				</BaseTable>
			</div>
		</div>
	</div>
</template>
<style lang="scss" scoped>
.team-manager-dashboard {
	padding: 2rem;
	display: grid;
	gap: 1.2rem;
	grid-template-columns: 1fr;
	grid-template-areas:
		"a"
		"b"
		"c";
	@include breakpoint(xl) {
		grid-template-columns: 1fr 1fr;
		grid-template-areas:
			"a b"
			"c c";
	}
	@include breakpoint(md) {
		padding: 2rem 3.2rem;
	}
}

.team-manager-table-data {
	overflow: auto;
	padding: 1.6rem;
	background-color: $light-grey;
	border-radius: 1.2rem;
	border: 0.1rem solid $outline-stroke;

	.actions {
		margin-bottom: 2rem;
		p {
			font-size: 1.4rem;
		}
	}
}

.period-select {
	padding: 2rem;

	@include breakpoint(md) {
		padding: 2rem 3.2rem;
	}
}
</style>
