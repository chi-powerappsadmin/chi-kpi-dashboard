<script setup lang='ts'>
import omit from "lodash/omit";
import type { TableColumn } from '~/components/Base/Table.vue';
import { splitStringByUppercase } from '~/helpers/functions';
import type { Objective } from '~/types/models/Objective';
interface Props {
    objectives: Objective[],
    isLoading: boolean,
}

interface Emits {
    (e: 'refresh', v: void): void
}

const props = defineProps<Props>();
defineEmits<Emits>()
const modelValue = defineModel<string[]>({ default: [] })
const showNewObjectiveForm = ref(false)
const searchTerm = ref('')

const columns: TableColumn[] = [
    { value: "name", label: "Name", width: "23.5rem" },
    { value: "status", label: "Status", width: "14.1rem" },
    { value: "owner", label: "Owner", width: "16.5rem" },
    { value: "target", label: "Target", width: "14.1rem" },
    { value: "actual", label: "Actual", width: "14.1rem" },
    { value: "weight", label: "Weight", width: "14.1rem" },
    { value: "progress", label: "Progress", width: "14.1rem" },
    { value: "type", label: "Type", width: "27.1rem" },
];

const displayedData = computed(() => {
    return props.objectives.map((obj) => {
        return {
            id: obj.id,
            name: obj.name,
            status:splitStringByUppercase(obj.objectiveStatus.name),
            owner: obj.owningEmployee.name,
            target: obj.target,
            actual: obj.actual,
            weight: obj.weight,
            progress: obj.progress,
            type: obj.measurement.name.split('_').join(' '),
        }
    })
})

const filteredDisplayedData = computed(() => {
    const lowerCaseSearchTerm = searchTerm.value.toLowerCase();
    return displayedData.value.filter(item => {
        const serializedValues = JSON.stringify(Object.values(item).join(' ')).toLowerCase()
        return serializedValues.includes(lowerCaseSearchTerm)
    })
})


function downloadXlsx() {
  

    const dataToExport = displayedData.value.map((d) => omit(d, ["id"]));

    const fileName = `Objective for ${props.objectives[0].period.name}`
    useDownloadXlsx(dataToExport, fileName)
}

</script>

<template>
    <div>
        <div class="period-page__actions period-page__actions-sec">
<BaseButton size="sm" @click="$emit('refresh')">
                <IconsArrowRefresh />
                <span>Refresh</span>
            </BaseButton>
            <BaseButton size="sm" :disabled="!displayedData.length" @click="downloadXlsx">
                <IconsExcelColor />
                <span>Export Performance Objectives</span>
                <IconsChevronDown />
            </BaseButton>
        </div>

        <div class="view-filter flex flex-wrap content-between">
            <p class="view weight-500 flex items-center">
                Performance Objective Associated View <BaseButton size="sm">
                    <IconsChevronDown />
                </BaseButton>
            </p>
            <BaseInput id="filter" v-model="searchTerm" name="filter" placeholder="Filter by keyword" />
        </div>

        <BaseTable v-model="modelValue" :columns="columns" :table-data="filteredDisplayedData" show-select
            :is-loading="isLoading">
            <template #name="{ value, record }">
                <NuxtLink :to="`/objectives/${record.id}`" class="table__link">
                    <span>{{ value }}</span>
                </NuxtLink>
            </template>
            <template #owner="{ value }">
                <div class="flex items-center table__owner">
                    <BaseAvatar v-if="value" size="sm" :name="value" />
                    <span>{{ value }}</span>
                </div>
            </template>
        </BaseTable>


        <BaseSideDrawer v-model="showNewObjectiveForm">
            this is for the new objective
        </BaseSideDrawer>
    </div>
</template>

<style lang="scss" scoped>
.period-page {
    &__actions {
        &-sec {
            justify-content: flex-start;
            padding: 2.4rem 1.2rem;
            flex-wrap: wrap;

            button {
                flex-grow: 1;
                justify-content: center;
            }

            @include breakpoint(md) {
                button {
                    flex-grow: 0;
                    justify-content: initial;
                }
            }
        }
    }

    .view-filter {
        padding: 1.2rem;
        gap: 2rem;
    }

    .view {
        @include breakpoint(sm) {
            font-size: 1.8rem;
        }

        @include breakpoint(md) {
            font-size: 2rem;
        }

        @include breakpoint(lg) {
            font-size: 2.4rem;
        }

        button {
            margin-left: 0.25rem;
            border: 0;
            padding: 0;
        }
    }

    :deep(#filter) {
        height: 4.6rem;
    }

    .table {
        &__link {
            color: $sec-brand;

            &:hover {
                text-decoration: underline;
                text-underline-offset: 0.5rem;
            }
        }

        &__owner {
            gap: 0.8rem;
        }
    }
}
</style>