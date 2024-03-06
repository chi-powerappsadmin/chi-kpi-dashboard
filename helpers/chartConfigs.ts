import type { ApexOptions } from "apexcharts";

const defaultChartOptions: ApexOptions = {
	chart: {
		toolbar: { tools: { download: false } },
			stacked: true,
			stackType: "100%",
			fontFamily: "Inter, sans-serif",
	},
	legend: { show: false },
	tooltip: {
		x: { show: false },
		y: { title: { formatter: (name) => name }, formatter: (value) => `${value} count` },
		marker: { show: false },
		style: { fontSize: "8px", fontFamily: "Inter, sans-serif" },
	},
	xaxis: {
		tickAmount: 4,
		labels: {
			style: { colors: ["#686868"], fontSize: "8px", fontWeight: 700, fontFamily: "Inter, sans-serif" },
		},
	},
	yaxis: {
		tickAmount: 4,
		labels: {
			style: { colors: ["#686868"], fontSize: "8px", fontWeight: 700, fontFamily: "Inter, sans-serif" },
		},
	},
	dataLabels: { enabled: false },
};

export { defaultChartOptions };
