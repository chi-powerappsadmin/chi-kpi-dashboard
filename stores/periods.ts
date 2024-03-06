import type { Period } from "~/types/models/Period";

export const usePeriodStore = defineStore("period", () => {
    const periods = ref<Period[]>([])

    const getPeriodLabel = (id: string) => {
        return periods.value.find(period => period.id === id)?.name || "";
    }

    return {
        periods,
        getPeriodLabel
    };
});
