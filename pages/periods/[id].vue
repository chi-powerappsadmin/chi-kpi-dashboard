<script setup lang='ts'>
import type { GetObjectivesForSpecificPeriodResponse, GetSinglePeriodResponse } from '~/types/apiResponse/period';

const route = useRoute()

type Tab = 'general' | 'performance-objectives'
const tabs: { value: Tab, label: string }[] = [
    { value: "general", label: "General" } as const,
    { value: "performance-objectives", label: "Performance Objectives" } as const,
];
const activeTab = ref<Tab>('general')

const { data, refresh, pending } = await useAsyncData(`period/${route.params.id}`, async () => {
    const [period, objectives] = await Promise.all([
        useApi<GetSinglePeriodResponse>(`/periods/id:guid`, {
            params: {
                periodID: route.params.id
            }
        }), useApi<GetObjectivesForSpecificPeriodResponse>('/periods/objectives', {
            query: {
                periodID: route.params.id
            }
        })
    ])
    return {
        period, objectives
    }
}, {
    transform(d) {
        return {
            period: d.period.data,
            objectives: d.objectives.data
        }
    },
})

const selectedData = ref([])
</script>

<template>
    <div v-if="data && data.objectives && data.period" class="period-page">
        <div class="period-page__top">
            <div class="period-page__actions">
                <BaseButton v-show="activeTab === 'general'" size="sm" @click="refresh">
                    <IconsArrowRefresh />
                    <span>Refresh</span>
                </BaseButton>
            </div>
            <div class="period-page__menu">
                <BaseButton size="sm">
                    <IconsEllipsisVertical />
                </BaseButton>
            </div>
        </div>
        <div class="period-page__info flex flex-column">
            <p>{{ data.period.name }} • <small>Saved</small></p>
            <small>Period</small>
        </div>
        <BaseTabs v-model="activeTab" :tabs="tabs"></BaseTabs>

        <DashboardPeriodGeneralInfo v-show="activeTab === 'general'" :period="data.period" />
        <DashboardPeriodPerformanceObjectivesList v-show="activeTab === 'performance-objectives'" v-model="selectedData"
            :objectives="data.objectives" :is-loading="pending" @refresh="refresh" />
    </div>
</template>

<style scoped lang="scss">
.period-page {
    &__info {
        padding: 2rem 3.2rem;
        gap: 1.2rem;

        p {
            @include typography(2rem, normal, 2.4rem);
        }

        small {
            @include typography(1.2rem, normal, 1.6rem);
        }
    }

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

}
</style>