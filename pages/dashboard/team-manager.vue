<script setup lang="ts">
import type { ApexOptions } from "apexcharts";

import { defaultChartOptions } from "~/helpers/chartConfigs";
import type { GetTeamManagerDashboardData } from "~/types/apiResponse/dashboard";

const { department } = storeToRefs(useUserStore());
const { periods } = storeToRefs(usePeriodStore());
const objectivesPerformanceOptions = ref<ApexOptions>({
	...defaultChartOptions,
	chart: { ...defaultChartOptions.chart, type: "bar", stacked: !true, id: "objective-performance-chart" },
	xaxis: {
		...defaultChartOptions.xaxis,
		categories: [
			"Darlene Robertson",
			"Jenny Wilson",
			"Annette Black",
			"Annette Black",
			"Floyd Miles",
			"Ralph Edwards",
		],
	},
	yaxis: [
		{
			...defaultChartOptions.yaxis,
			reversed: false,
			max: 120_000,
			labels: {
				style: { colors: ["#686868"], fontSize: "8px", fontWeight: 700 },
				formatter: (value: number) => {
					return value.toLocaleString() + ".00";
				},
			},
		},
		{
			...defaultChartOptions.yaxis,
			reversed: false,
			max: 120_000,
			opposite: true,
			labels: {
				style: { colors: ["#686868"], fontSize: "8px", fontWeight: 700 },
				formatter: (value: number) => {
					return value.toLocaleString() + ".00";
				},
			},
		},
	],

	colors: ["#19AC65", "#4B4DED"],
	plotOptions: {
		bar: {
			horizontal: false,
			columnWidth: "66%",
		},
	},
	stroke: {
		show: true,
		width: 10,
		colors: ["transparent"],
	},
});

// const objectivesTrackerOptions = ref<ApexOptions>({
// 	...defaultChartOptions,
// 	chart: { ...defaultChartOptions.chart, id: "objective-tracker-chart", type: "bar", stacked: true,stackType: "normal" },
// 	xaxis: {
// 		...defaultChartOptions.xaxis,
// 		categories: [],
// 	},
// 	yaxis: {
// 		...defaultChartOptions.yaxis,
// 		reversed: false,
// 	},
// 	colors: ["#808080", "#FFBF00","#8B0000","#EE4B2B", "##19ac65"],
// });


const objectivesTrackerOptions = ref<ApexOptions>({
	...defaultChartOptions,
	chart: {
		...defaultChartOptions.chart,
		type: "bar",
		stacked: true,
		id: "objective-tracker-chart",
		stackType: "normal",
	},
	xaxis: {
		...defaultChartOptions.xaxis,
		categories: [],
	},
	yaxis: 
		{
			...defaultChartOptions.yaxis,
		reversed: false,
		},
	

	colors: ["#808080", "#FFBF00","#8B0000","#EE4B2B","#19AC65"],

});


const objectivesPerformanceSeries = ref([
	{
		name: "Sum (Target)",
		data: [],
	},
	{
		name: "Sum (Actual)",
		data: [],
	},
]);

const objectivesTrackerSeries = ref<
	{
		name: string;
		data: number[];
	}[]
>([
	{
		name: "Not Started",
		data: [] as number[],
	},
	{
		name: "In Progress",
		data: [] as number[],
	},
	{
		name: "Delayed",
		data: [] as number[],
	},
	{
		name: "Overdue",
		data: [] as number[],
	},
	{
		name: "Completed",
		data: [] as number[],
	},
]);

const objectivesPerformanceLegends = [
	{ color: "#19AC65", title: "Sum (Target)" },
	{ color: "#4B4DED", title: "Sum (Actual)" },
];

const objectivesTrackerLegends = [
	{ color: "#808080", title: "Not Started", key:"NotStarted" },
	{ color: "#FFBF00", title: "In Progress", key:"InProgress" },
	{ color: "#8B0000", title: "Delayed", key:"Delayed"},
	{ color: "#EE4B2B", title: "Overdue", key:"Overdue"},
	{ color: "#19ac65", title: "Completed", key:"Completed" },
];

const periodOptions = computed(() =>
	periods.value.map((p) => {
		return {
			label: p.name,
			value: p.id,
		};
	}),
);

const selectedPeriod = ref("");

const isLoading = ref(false);
const chartData = ref<GetTeamManagerDashboardData["data"]>();

async function fetchChartData() {
	if (!periodOptions.value.length) return;
	if (!selectedPeriod.value.trim()) return;
	
	try {
		isLoading.value = true;
		const response = await useApi<GetTeamManagerDashboardData>("/dashboards/teamboard", {
			query: {
				departmentID: department.value?.id,
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
			updateObjectivePerformanceChart(newVal);
			updateObjectiveTrackerChart(newVal);
		}
	},
	{ immediate: true },
);

function updateObjectiveTrackerChart(data: GetTeamManagerDashboardData["data"]) {
	// Step 1: Map data to extract relevant information
	// const employeesData = data.map((da) => {
	// 	const { employeeName, performance } = da;	
	// 	return {
	// 		employeeName,
	// 		performance: performance.map(({ count, status }) => ({ count, status })),
	// 	};
	// });

    //      // check if all status are present
	// 	const allStatus = ["NotStarted","InProgress","Delayed","Completed"] as Array<"NotStarted"|"InProgress"|"Delayed"|"Completed">;
	// 	employeesData.forEach((ddd,index)=>{
	// 		allStatus.forEach((status)=>{
	// 			if(!ddd.performance.find(per => per.status === status)){
	// 				// if(process.env.NODE_ENV === "development"){
	// 				// console.log(status,"not found",ddd.employeeName,status);
	// 				// }
	// 				// if not found, add it
	// 				employeesData[index].performance.push({
	// 					status ,
	// 					count:0
	// 				})
	// 			}
	// 		})
	// 	})

			const employeesData = data.map((team) => {
		const performance = ["NotStarted", "InProgress","Delayed", "Overdue", "Completed"].map((status) => {
			const currentPerformace = team.performance.find((performance) => performance.status === status);
			return { status, count: currentPerformace?.count ?? 0 };
		});
		return { employeeName: team.employeeName, performance };
	});



	// Step 2: Extract employee names for x-axis categories
	const categories = employeesData?.map((employee) => employee.employeeName);

	// Step 3: Calculate the maximum value for y-axis
	const max = Math.max(...data.map((employee) => employee.totalCount));

	// Step 4: Organize data into series for chart
	const seriesObject = employeesData.reduce(
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
		{ "Not Started": [] as number[], "In Progress": [] as number[], Delayed: [] as number[], Overdue: [] as number[] , Completed: [] as number[] },
	);

	// Step 5: Update chart series data
	objectivesTrackerSeries.value = Object.entries(seriesObject).map(([key, value]) => {
		return {
			name: key,
			data: value,
		};
	});

	// Step 6: Update chart options
	objectivesTrackerOptions.value = {
		...objectivesTrackerOptions.value,
		yaxis: { ...objectivesTrackerOptions.value.yaxis, max },
		xaxis: { ...objectivesTrackerOptions.value.xaxis, categories },
	};
}

function updateObjectivePerformanceChart(data: GetTeamManagerDashboardData["data"]) {
	// Step 1: Map data to extract relevant information
	const employeesData = data.map((da) => {
		const { employeeName, totalActualScore, totalTargetScore } = da;
		return {
			employeeName,
			totalActualScore,
			totalTargetScore,
		};
	});

	// Step 2: Extract employee names for x-axis categories
	const allEmployeeNames = employeesData?.map((employee) => employee.employeeName);

	// Step 3: Calculate the maximum values for y-axis
	const maxActual = Math.max(...employeesData.map((em) => em.totalActualScore));
	const maxTarget = Math.max(...employeesData.map((em) => em.totalTargetScore));

	const pickGreater = maxTarget > maxActual ? maxTarget : maxActual;

	// Step 4: Organize data into series for chart
	const seriesObject = employeesData.reduce(
		(acc, curr) => {
			acc["Sum (Actual)"].push(curr.totalActualScore);
			acc["Sum (Target)"].push(curr.totalTargetScore);

			return acc;
		},
		{ "Sum (Target)": [] as number[], "Sum (Actual)": [] as number[] },
	);

	// Step 5: Update chart series data
	objectivesPerformanceSeries.value = Object.entries(seriesObject).map(([key, value]) => {
		return {
			name: key,
			data: value,
		};
	});

	// Step 6: Update chart options
	objectivesPerformanceOptions.value = {
		...objectivesPerformanceOptions.value,
		xaxis: { ...objectivesPerformanceOptions.value.xaxis, categories: allEmployeeNames },
		yaxis: (objectivesPerformanceOptions.value.yaxis as ApexYAxis[]).map((axis, index) => {
			if (index === 0) {
				return {
					...axis,
					max: pickGreater,
				};
			}

			return {
				...axis,
				max: pickGreater,
			};
		}),
	};
}
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

		<div class="team-manager-dashboard flex flex-column">
			<DashboardChart
				:loading="isLoading"
				title="Objectives Progress Tracker"
				:legends="objectivesTrackerLegends"
				y-axis-title="Target"
				x-axis-title="Owners"
				:chart-id="objectivesTrackerOptions?.chart?.id || 'its there'"
				:type="objectivesTrackerOptions.chart?.type"
				@refresh="fetchChartData">
				<ClientOnly>
					<apexchart height="200px" :options="objectivesTrackerOptions" :series="objectivesTrackerSeries" />
				</ClientOnly>
			</DashboardChart>
			<DashboardChart
				:loading="isLoading"
				title="All Performance Objectives"
				:legends="objectivesPerformanceLegends"
				y-axis-title="Sum(Target)"
				x-axis-title="Teams"
				y-axis-opp-title="Sum(Actual)"
				:type="objectivesPerformanceOptions.chart?.type"
				:chart-id="objectivesPerformanceOptions.chart?.id || 'here'"
				@refresh="fetchChartData">
				<ClientOnly>
					<apexchart
						height="200px"
						:options="objectivesPerformanceOptions"
						:series="objectivesPerformanceSeries" />
				</ClientOnly>
			</DashboardChart>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.team-manager-dashboard {
	padding: 2rem;
	display: grid;
	gap: 1.2rem;
	grid-template-columns: 1fr;

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
