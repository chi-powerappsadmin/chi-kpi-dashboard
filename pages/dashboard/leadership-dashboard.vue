<script setup lang="ts">
import type { ApexOptions } from "apexcharts";
import { defaultChartOptions } from "~/helpers/chartConfigs";
import type { apiError } from "~/types/apiResponse/apiResponse";
import type {
GetLeadershipDashboardChartData,
GetLeadershipDashboardTableData,
LeadershipTableItem,
} from "~/types/apiResponse/dashboard";

const { periods } = storeToRefs(usePeriodStore());

const isLoading = ref(false);
const selectedPeriod = ref("");
const chartData = ref<GetLeadershipDashboardChartData["data"]>();
const tableData = ref<LeadershipTableItem[]>([]);

const periodOptions = computed(() => periods.value.map((period) => ({ label: period.name, value: period.id })));
// const numberOfCompletedTasks = computed(() => tableData.value.reduce((acc, curr) => acc + curr.completedTasks, 0));
// const numberOfObjectives = computed(() => tableData.value.reduce((acc, curr) => acc + curr.totalObjectives, 0));

const objectivesProgressTrackerOptions = ref<ApexOptions>({
	...defaultChartOptions,
	chart: {
		...defaultChartOptions.chart,
		type: "bar",
		stacked: true,
		id: "objectives-progress-tracker",
		stackType: "normal",
	},
	xaxis: {
		...defaultChartOptions.xaxis,
		categories: [],
	},
	yaxis: [
		{
			...defaultChartOptions.yaxis,
			min: 0,
			max: 100,
			tickAmount: 4,
			labels: {
				style: { colors: ["#686868"], fontSize: "8px", fontWeight: 700 },
				formatter: (value: number) => {
					return value.toLocaleString() + ".00";
				},
			},
		},
	],

	colors: ["#808080", "#FFBF00","#8B0000","#EE4B2B","#19AC65"],
	plotOptions: {
		bar: { horizontal: false, columnWidth: "66%" },
	},
	stroke: { show: true, width: 10, colors: ["transparent"] },
});

const objectivesProgressTrackerSeries = ref([
	{ name: "Not Started", data: [] as number[] },
	{ name: "In Progress", data: [] as number[] },
		{name:"Delayed", data: [] as number[]},
		{name:"Overdue", data: [] as number[]},
	{ name: "Completed", data: [] as number[] }
]);

const tableColumns = [
	{ value: "employeeName", label: "Employee Name", width: "20.1rem" },
	{ value: "rank", label: "Rank", width: "14rem" },
	{ value: "team", label: "Team", width: "14rem" },
	{ value: "totalTasks", label: "Total Tasks", width: "12rem" },
	{ value: "notStartedTasks", label: "Not Started Tasks", width: "16rem" },
	{ value: "inProgressTasks", label: "In Progress Tasks", width: "16rem" },
	{ value: "delayedTasks", label: "Delayed Tasks", width: "15rem" },
	{ value: "overdueTasks", label: "Overdue Tasks", width: "15rem" },
	{ value: "completedTasks", label: "Completed Tasks", width: "15rem" },
	{ value: "totalObjectives", label: "Total Objectives", width: "15rem" },
	{ value: "completedObjectives", label: "Completed Objectives", width: "18.5rem" },
	{ value: "percentatgeCompleted", label: "Percentage completed", width: "18.9rem" },
];

const legends = [
	{ color: "#808080", title: "Not Started" },
	{ color: "#FFBF00", title: "In Progress" },
	{ color: "#8B0000", title: "Delayed" },
	{color: "#EE4B2B", title: "Overdue" },
	{ color: "#19ac65", title: "Completed" },
];

const fetchChartData = async () => {
	if (!periodOptions.value.length) return;
	if (!selectedPeriod.value) return;
	try {
		isLoading.value = true;
		const [chart, table] = await Promise.all([
			useApi<GetLeadershipDashboardChartData>("/dashboards/teamleaderboard", {
				query: {
					periodID: selectedPeriod.value,
				},
			}),
			useApi<GetLeadershipDashboardTableData>("/dashboards/leaderboardtable", {
				query: {
					periodID: selectedPeriod.value,
				},
			}),
		]);
		chartData.value = chart.data;
		tableData.value = table.data;
	} catch (error) {
		const err = error as apiError;
		useToast("error", "Error!", err.message, 3500, true);
	} finally {
		isLoading.value = false;
	}
};

const updateChartData = (data: GetLeadershipDashboardChartData["data"]) => {
	// Step 1: Map data to extract relevant information
	const teamsData = data.map((team) => {
		const performance = ["NotStarted", "InProgress","Delayed", "Overdue","Completed"].map((status) => {
			const currentPerformace = team.performance.find((performance) => performance.status === status);
			return { status, count: currentPerformace?.count ?? 0 };
		});
		return { team: team.team, performance };
	});

	// Step 2: Extract teams name for xaxis categories
	const categories = teamsData.map((team) => team.team);

	// Step 3: Calculate the maximum value for y-axis
	const max = Math.max(...data.map((team) => team.totalCount)) + 5;

	// Step 4: Organize data into series for chart
	const seriesObject = teamsData.reduce(
		(acc, curr) => {
			curr.performance.forEach((per) => {
				const { status, count } = per;
				if (status === "NotStarted") acc["Not Started"].push(count);
				if (status === "InProgress") acc["In Progress"].push(count);
				if (status === "Delayed") acc.Delayed.push(count);
				if (status === "Overdue") acc.Overdue.push(count);
				if (status === "Completed") acc.Completed.push(count);

			});

			return acc;
		},
		{ "Not Started": [] as number[], "In Progress": [] as number[],  Delayed: [] as number[],Overdue: [] as number[] ,Completed: [] as number[] },
	);

	// Step 5: Update chart series data
	objectivesProgressTrackerSeries.value = Object.entries(seriesObject).map(([key, value]) => {
		return { name: key, data: value };
	});

	// Step 6: Update chart options
	objectivesProgressTrackerOptions.value = {
		...objectivesProgressTrackerOptions.value,
		yaxis: { ...objectivesProgressTrackerOptions.value.yaxis, max },
		xaxis: { ...objectivesProgressTrackerOptions.value.xaxis, categories },
	};
};

watch(
	periods,
	(newVal) => {
		if (newVal.length) selectedPeriod.value = periods.value[0].id;
	},
	{ immediate: true },
);

watch(
	selectedPeriod,
	(newVal) => {
		if (newVal) fetchChartData();
	},
	{ immediate: true },
);

watch(
	chartData,
	(newVal) => {
		if (newVal) updateChartData(newVal);
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
		<div class="leadership-dashboard flex flex-column">
			<div class="leadership-dashboard__chart">
				<DashboardChart
					:loading="isLoading"
					type="bar"
					chart-id="objectives-progress-tracker"
					title="Objectives Progress Tracker By Team"
					:legends="legends"
					y-axis-title="Target"
					x-axis-title="Teams"
					@refresh="fetchChartData">
					<ClientOnly>
						<apexchart
							id="progress-tracker-by-team"
							type="bar"
							height="200px"
							:options="objectivesProgressTrackerOptions"
							:series="objectivesProgressTrackerSeries" />
					</ClientOnly>
				</DashboardChart>
			</div>
			<div class="leadership-dashboard__table">
				<DashboardLeaderboardTable title="Leaderboard" :show-delete="false">
					<BaseTable
						:is-loading="isLoading"
						:columns="tableColumns"
						:table-data="tableData"
						:show-pagination-slot="true"
						variant="light">
						<template #owner="{ value }">
							<span class="flex items-center gap-8">
								<BaseAvatar size="sm" :name="value" />
								<span class="weight-500">{{ value }}</span>
							</span>
						</template>
						<template #percentatgeCompleted="{ value }">{{ value }}%</template>
						<!-- <template #pagination>
							<div class="flex items-center gap-12 flex-wrap">
								<DashboardLeaderboardBadge
									badge="tasks"
									:title="`${numberOfCompletedTasks} Tasks`"
									body="Task Completed" />
								<DashboardLeaderboardBadge
									badge="objectives"
									:title="`${numberOfObjectives} Objectives`"
									:body="`${numberOfCompletedTasks} Tasks Completed`" />
							</div>
						</template> -->
					</BaseTable>
				</DashboardLeaderboardTable>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.leadership-dashboard {
	padding: 2rem;
	gap: 4rem;

	@include breakpoint(md) {
		padding: 2rem 3.2rem;
	}
}

.period-select {
	padding: 2rem;

	@include breakpoint(md) {
		padding: 2rem 3.2rem;
	}
}
</style>
