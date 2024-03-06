<script setup lang="ts">
let apex: typeof ApexCharts | undefined;
if (process.browser) {
	const { default: apexItself } = await import("apexcharts");
	apex = apexItself;
}
interface Props {
	title: string;
	legendTitle?: string;
	legends: { color: string; title: string }[];
	yAxisTitle?: string;
	xAxisTitle?: string;
	yAxisOppTitle?: string;
	chartId: string;
	type: ApexChart["type"];
	loading?: boolean;
}
const props = defineProps<Props>();
defineEmits<{
	(event: "refresh"): void
}>()

function toggleSeries(series: string, seriesIndex: number) {
	if (!apex) return;
	const chart = apex.getChartByID(props.chartId);
	if (!chart) return;

	if (props.type === "pie") {
		chart.toggleDataPointSelection(seriesIndex);
	} else if (props.type === "bar") {
		chart.toggleSeries(series);
	}
}
</script>

<template>
	<div class="relative">
		<div class="single-chart">
			<div class="single-chart__header flex gap-12">
				<h4 class="weight-500 body-small">{{ title }}</h4>
				<button @click="$emit('refresh')">
					<IconsArrowRefresh />
				</button>
			</div>
			<div>
				<div class="single-chart__legends flex">
					<h6 v-if="legendTitle" class="font-small weight-500">{{ legendTitle }}</h6>
					<div class="flex items-center content-between flex-wrap gap-8" style="width: 100%">
						<div class="flex single-chart__legends__group flex gap-8">
							<button
								v-for="(legend, idx) in legends"
								:key="legend.title"
								class="font-small weight-500 flex items-center gap-4 a-legend"
								:style="{ '--clr': legend.color }"
								@click="toggleSeries(legend.title, idx)">
								<span :class="'dot'" />
								{{ legend.title }}
							</button>
						</div>

						<slot name="filters" />
					</div>
				</div>
				<div class="single-chart__chart">
					<p v-if="yAxisTitle" class="single-chart__chart-text weight-500">{{ yAxisTitle }}</p>
					<slot  v-if="!loading" />
					<p v-if="xAxisTitle" class="single-chart__chart-text weight-500">{{ xAxisTitle }}</p>
					<p v-if="yAxisOppTitle" class="single-chart__chart-text weight-500 opp-y-axis">
						{{ yAxisOppTitle }}
					</p>
				</div>
			</div>

			<div v-if="loading" class="loading">
				<Loader />
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.font-small {
	font-size: 0.8771rem;
}

.single-chart {
	border-radius: 0.8771rem;
	border: 0.073rem solid #e6e6e6;
	background: #fcfcfc;
	padding: 1.7541rem 1.1694rem;
	gap: 1.462rem;

	&__header {
		justify-content: space-between;
		align-items: center;
	}

	&__legends {
		padding: 1.462rem 0.877rem;
		gap: 1.8rem;

		&__group {
			flex-wrap: wrap;
		}
	}

	.a-legend {
		&:hover {
			color: var(--clr);
		}
		.dot {
			@include element-size(0.6rem, 0.6rem);

			background-color: var(--clr);
		}
	}

	&__chart {
		position: relative;
		background-color: #fff;
		padding: 1rem;

		&-text {
			font-size: 1rem;

			&:nth-of-type(2) {
				text-align: right;
			}

			&.opp-y-axis {
				position: absolute;
				right: 1rem;
				top: 1rem;
			}
		}
	}
}

.loading {
	display: flex;
	justify-content: center;
	align-items: center;

	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;

	background-color: rgba(0, 0, 0, 0.25);
	z-index: 6;
}
</style>
