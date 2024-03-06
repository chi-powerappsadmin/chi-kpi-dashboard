<script setup lang="ts">
import __ from "lodash";

export interface TableColumn {
	value: string;
	label: string;
	width: string;
}

export interface TableProps {
	columns: TableColumn[];
	tableData: any;
	showSelect?: boolean;
	isLoading?: boolean;
	showPagination?: boolean;
	showPaginationSlot?: boolean;
	variant?: string;
}

const {
	showSelect = false,
	tableData = [],
	isLoading = false,
	showPagination = false,
	showPaginationSlot = false,
	variant = "default",
} = defineProps<TableProps>();

const haveSelectedAll = ref(false);
const selectedTableRows = defineModel<string[]>({ default: [] });
const currentSortValue = ref("");



const currentSortOrder = ref('none') as Ref<'none' | 'ascending' | 'descending'>;



const sortedTableData = computed(() => {
// 	// if (currentSortValue.value)
// 	// 	return [...tableData].sort((a, b) => {
// 	// 		if (a[currentSortValue.value] < b[currentSortValue.value]) return -1;
// 	// 		if (a[currentSortValue.value] > b[currentSortValue.value]) return 1;
// 	// 		return 0;
// 	// 	});
// 	// return tableData;

	if(currentSortOrder.value === 'none') {
		return [...tableData];
	}

	return  __.orderBy(tableData, [item => typeof item[currentSortValue.value] === 'string' ? item[currentSortValue.value].toLowerCase() : item[currentSortValue.value]], [currentSortOrder.value === 'ascending' ? 'asc' : 'desc']);
});


const selectOrUnselectAllTableRows = (event: Event) => {
	const target = event.target as HTMLInputElement;
	if (target.checked) selectedTableRows.value = tableData.map(({ id }: { id: string }) => id);
	else selectedTableRows.value = [];
};

const checkIfAllRowsAreSelected = () => {
	if (tableData.length === selectedTableRows.value.length) haveSelectedAll.value = true;
	else haveSelectedAll.value = false;
};

const sortTableByColumn = (column: string) => {
	// if (currentSortValue.value === column) currentSortValue.value = "";
	// else currentSortValue.value = column;

	if(currentSortValue.value === column) {
		if(currentSortOrder.value === 'none') {
			currentSortOrder.value = 'ascending';
		} else if(currentSortOrder.value === 'ascending') {
			currentSortOrder.value = 'descending';
		} else {
			currentSortOrder.value = 'none';
			currentSortValue.value = "";
		}
	} else {
		currentSortValue.value = column;
		currentSortOrder.value = 'ascending';
	}
};
</script>

<template>
	<div class="table__wrapper">
		<div v-if="isLoading" class="table__loading">
			<slot name="loading">
				<Loader />
			</slot>
		</div>
		<div class="table__body">
			<table>
				<thead>
					<tr>
						<th v-if="showSelect" class="table__checkbox table__column">
							<BaseCheckbox
								id="selectAll"
								v-model="haveSelectedAll"
								name="selectAll"
								@change="selectOrUnselectAllTableRows" />
						</th>
						<th
							v-for="column in columns"
							:key="column.value"
							class="table__column"
							:style="{ width: `${column.width}` }"
							@click="sortTableByColumn(column.value)">
							<span class="table__column-header">
								{{ column.label }}
								<span
									class="table__column-icon"
									:class="{ 'table__column-icon--active': currentSortValue === column.value }">
									<IconsChevronDown />
								</span>
							</span>
						</th>
					</tr>
				</thead>
				<tbody>
					<template v-if="!sortedTableData.length">
						<tr>
							<td class="table__cell table__empty" :colspan="columns.length">No data available</td>
						</tr>
					</template>
					<template v-else>
						<tr
							v-for="(row, index) in sortedTableData"
							:key="row.id"
							class="table__row"
							:class="[`table__row--${variant}`]">
							<td v-if="showSelect" class="table__checkbox table__cell">
								<BaseCheckbox
									:id="`row-${index}-${row.id}`"
									v-model="selectedTableRows"
									:name="`row-${index}-${row.id}`"
									:value="row.id"
									@change="checkIfAllRowsAreSelected" />
							</td>
							<td v-for="column in columns" :key="column.value" class="table__cell">
								<slot :key="column.value" :name="column.value" :value="row[column.value]" :record="row">
									{{ row[column.value] }}
								</slot>
							</td>
						</tr>
					</template>
				</tbody>
			</table>
		</div>
		<div v-if="showPagination || showPaginationSlot" class="table__pagination flex items-center flex-wrap">
			<div v-if="showPaginationSlot">
				<slot name="pagination" />
			</div>
			<div v-if="showPagination" class="table__pagination--right flex items-center flex-wrap">
				<div class="table__pagination-count flex items-center">
					<span class="table__pagination-count-text">Rows per page</span>
					<div class="table__pagination-count-row flex items-center">
						<span>10</span>
						<IconsArrowDown />
					</div>
				</div>
				<div class="table__pagination-current">
					<span>1</span>
					-
					<span>5</span>
					OF
					<span>5</span>
				</div>
				<div class="table__pagination-navigation flex items-center">
					<button><IconsChevronLeft /></button>
					<button><IconsChevronRight /></button>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
