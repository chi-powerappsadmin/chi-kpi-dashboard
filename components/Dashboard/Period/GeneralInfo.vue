<script setup lang="ts">
import { stringToDate } from '~/helpers/functions';
import type { Period } from '~/types/models/Period';
interface Props {
    period: Period
}
defineProps<Props>()
</script>

<template>
    <div class="period-dates grid">
        <BaseInput id="period-name" :model-value="period.name" name="period-name" label="Name" disabled />
        <BaseInput id="start-date" :model-value="stringToDate(period.startDate)" name="start-date" label="Start Date"
            disabled />
        <BaseInput id="start-date" :model-value="stringToDate(period.endDate)" name="end-date" label="End Date" disabled />
    </div>
</template>

<style lang="scss" scoped>
.period-dates {
    margin-top: 3rem;
    padding: 2rem 3.2rem;
    gap: 1.2rem;
    grid-template-columns: repeat(1, 1fr);

    @include breakpoint(md) {
        grid-template-columns: repeat(2, 1fr);

        >div:first-of-type {
            grid-column: span 2;
        }
    }

    @include breakpoint(lg) {
        grid-template-columns: repeat(3, 1fr);

        >div:first-of-type {
            grid-column: initial;
        }
    }
}
</style>