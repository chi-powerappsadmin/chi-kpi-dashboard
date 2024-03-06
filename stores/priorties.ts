import type { Priority } from "~/types/models/Priority";

export const usePrioritiesStore = defineStore("priority", () => {
    const priorities = ref<Priority[]>([])

    const getPriorityLabel = (value: number) => {
        return priorities.value.find((opt) => opt.value === value)?.name || "";
    }




    return {
        priorities,
        getPriorityLabel
    };


   

});
