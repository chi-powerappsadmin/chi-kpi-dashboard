<script setup lang="ts">
const tableColumns = (["name", "status", "owner", "target", "actual", "priority", "startDate", "endDate"] as const).map((col) => {
	const width = (() => {
		if (col === "name") {
			return "23.5rem";
		} else if (col === "owner") {
			return "16.4rem";
		} else if (col === "endDate") {
			return "20rem";
		} else {
			return "12rem";
		}
	})();
	return {
		value: col,
		label: col,
		width,
	};
});
const tableData: any[] = [];
function exportToXlsx() {}
</script>

<template>
	<div class="wrapper">
		<div class="page-actions">
			<BaseButton size="sm" :disabled="false">
				<IconsAddSquare />
				<span>New Task</span>
			</BaseButton>
			<BaseButton size="sm" :disabled="false" :loading="false" @click="false">
				<IconsArrowRefresh />
				<span>Refresh</span>
			</BaseButton>
			<BaseButton size="sm" @click="exportToXlsx">
				<IconsExcelColor />
				<span>Export</span>
			</BaseButton>
		</div>
		<div class="page__title flex items-center">
			<h4 class="weight-500">Tasks Associated View</h4>
			<BaseButton size="sm">
				<IconsChevronDown />
			</BaseButton>
		</div>
		<div>
			<BaseTable :is-loading="!true" :columns="tableColumns" :table-data="tableData"></BaseTable>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.wrapper {
	padding: 2rem 0rem;
	.page-actions {
		display: flex;
		gap: 0.8rem;
		align-items: center;
		flex-wrap: wrap;
		padding: 0.8rem 1.2rem;
	}

	.page__title {
		margin: 1.2rem 0;
		padding: 1.2rem;

		h4 {
			@include typography(2rem, normal, 2.4rem);
		}

		button:not(.dropdown__item) {
			border: 0;
			height: 2.4rem;
			padding: 0;

			svg {
				height: 2.4rem;
				width: 2.4rem;
			}
		}
	}
}
</style>
