<script setup lang="ts">
interface Props {
	title: string;
	legendTitle?: string;
	legends: { color: string; title: string }[];
	yAxisTitle?: string;
	xAxisTitle?: string;
}

defineProps<Props>();
</script>

<template>
	<div class="single-chart">
		<div class="single-chart__header flex gap-12">
			<h4 class="weight-500 body-small">{{ title }}</h4>
			<button>
				<IconsArrowRefresh />
			</button>
		</div>
		<div>
			<div class="single-chart__legends flex">
				<h6 v-if="legendTitle" class="font-small weight-500">{{ legendTitle }}</h6>
				<div class="flex single-chart__legends__group flex gap-8">
					<span v-for="legend in legends" :key="legend.title" class="font-small weight-500 flex items-center gap-4">
						<span :class="['dot', `dot--${legend.color}`]"></span>
						{{ legend.title }}
					</span>
				</div>
			</div>
			<div class="single-chart__chart">
				<p v-if="yAxisTitle" class="single-chart__chart-text weight-500">{{ yAxisTitle }}</p>
				<slot />
				<p v-if="xAxisTitle" class="single-chart__chart-text weight-500">{{ xAxisTitle }}</p>
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

	.dot {
		@include element-size(0.6rem, 0.6rem);

		&--warning {
			background-color: #F69B13;
		}

		&--secondary {
			background-color: #4B4DED;
		}

		&--success {
			background-color: #19AC65;
		}
	}

	&__chart {
		background-color: #fff;
		padding: 1rem;

		&-text {
			font-size: 1rem;

			&:nth-of-type(2) {
				text-align: right;
			}
		}
	}
}
</style>
