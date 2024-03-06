<script setup lang='ts'>
import type { GetKpiPeriodsResponse } from '~/types/apiResponse/period';

const { periods } = storeToRefs(usePeriodStore())
const columns = [
    { value: 'name', label: 'Name', width: '20rem', },
    { value: 'startDate', label: 'Start Date', width: '20rem', },
    { value: 'endDate', label: 'End Date', width: '20rem', },
]

const selectedData = ref([])

const { refresh, data, pending } = useAsyncData('periods', () => useApi<GetKpiPeriodsResponse>('/periods', {
}), {
    transform(data) {
        return data.data.map(val => {
            return {
                ...val,
                startDate: new Date(val.startDate).toDateString(),
                endDate: new Date(val.endDate).toDateString()
            }
        })
    },
    default: () => periods,
    lazy: true
})

function exportXlsx() {
    const dataToExport = data.value.map(d => {
        return {
            name: d.name,
            startDate: d.startDate,
            endDate: d.endDate
        }
    })
    useDownloadXlsx(dataToExport, 'Active Periods')
}
</script>

<template>
    <div class="period-page">
        <div class="period-page__top">
            <div class="period-page__actions">
                <BaseButton size="sm" @click="refresh">
                    <IconsArrowRefresh />
                    <span>Refresh</span>
                </BaseButton>
                <BaseButton size="sm" @click="exportXlsx">
                    <IconsExcelColor />
                    <span>Export to Excel</span>
                    <IconsChevronDown />
                </BaseButton>
            </div>
            <div class="period-page__menu">
                <BaseButton size="sm">
                    <IconsEllipsisVertical />
                </BaseButton>
            </div>
        </div>
        <div class="period-page__main">
            <div class="period-page__main-title flex items-center">
                <p class="weight-500">Active Periods</p>
                <BaseButton size="sm">
                    <IconsChevronDown />
                </BaseButton>
            </div>
            <div>
                <BaseTable v-model="selectedData" :columns="columns" :table-data="data" :show-select="true"
                    :is-loading="pending">
                    <template #name="{ value, record }">
                        <NuxtLink :to="{ path: `/periods/${record.id}` }" class="table__link">
                            {{ value }}
                        </NuxtLink>
                    </template>
                </BaseTable>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.period-page {
    &__main {
        &-title {
            padding: 2rem 3.2rem;

            button {
                border: 0;
                height: 2.4rem;
                padding: 0;

                svg {
                    height: 2.4rem;
                    width: 2.4rem;
                }
            }

            p {
                @include typography(2rem, normal, 2.4rem);
            }
        }
    }

    .table {
        &__link {
            color: $sec-brand;

            &:hover {
                text-decoration: underline;
                text-underline-offset: 0.5rem;
            }
        }
    }
}
</style>