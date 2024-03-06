<script setup lang="ts">
import { splitStringByUppercase } from "@/helpers/functions";
import type { Task } from "@/types/models/Task";

interface Props {
	task: Task;
}

const props = defineProps<Props>();
const {priorities} = storeToRefs(usePrioritiesStore());

const priorityOptions = priorities.value.map((priority) => ({
	label: priority.name,
	value: priority.value,
})) as { label: string; value: number }[
];




const taskPriority = ref(props.task?.priority?.name ?? "");
const showPriorityDropdown = ref(false);

const changeTaskPriority = async (priority: number) => {
	if (props.task.priority.value === priority) return (showPriorityDropdown.value = false);
	try {
		await useApi("/tasks/update/id:guid", {
			method: "PATCH",
			body: { id: props.task.id, priority },
		});
		taskPriority.value = priorityOptions.find((p) => p.value === priority)?.label ?? "";
		showPriorityDropdown.value = false;
	} catch (error) {
		useToast("error", "Error", JSON.stringify(error), 1500, true);
	}
};
</script>

<template>
	<div class="task flex items-center content-between">
		<div class="flex flex-column gap-12">
			<div class="flex items-center gap-12">
				<h1 class="weight-500 task__name">{{ task?.subject }}</h1>
				<span>•</span>
				<span class="body-regular weight-500">Saved</span>
			</div>
			<p class="body-regular weight-500">Objective Task</p>
		</div>
		<div class="task__status flex gap-12 items-center">
			<div class="task__status--left flex flex-column gap-4">
				<p class="body-regular weight-600 color-text-black">
					{{ splitStringByUppercase(task?.activityStatus?.name) ?? "------" }}
				</p>
				<p class="body-regular weight-500 color-text">Activity Status</p>
			</div>
			<span class="block divider"></span>
			<div class="task__status--right flex items-center gap-12">
				<div class="flex flex-column gap-4">
					<p class="body-regular weight-600 color-text-black">{{ taskPriority }}</p>
					<p class="body-regular weight-500 color-text">Priority</p>
				</div>
				<span v-if="task.permissions.canUpdate" class="block chevron" @click.stop="showPriorityDropdown = true">
					<IconsChevronDown />
				</span>
			</div>
			<BaseDropdown
				:show="showPriorityDropdown"
				:position="{ maxWidth: '14rem', right: '0', top: '7rem' }"
				@close="showPriorityDropdown = false">
				<div class="flex flex-column">
					<button
						v-for="priority in priorityOptions"
						:key="priority.label"
						class="dropdown__item"
						@click="changeTaskPriority(priority.value)">
						{{ priority.label }}
					</button>
				</div>
			</BaseDropdown>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.task {
	padding: 2rem;
	flex-wrap: wrap;
	gap: 2rem;

	@include breakpoint(md) {
		padding: 2rem 3.2rem;
	}

	&__name {
		@include typography(2.4rem, normal);
	}

	&__status {
		padding: 1.2rem 1.6rem;
		border-radius: 1.2rem;
		border: 0.1rem solid $outline;
		position: relative;

		.chevron {
			@include element-size(1.6rem, 1.6rem);
			cursor: pointer;
		}

		.divider {
			@include element-size(3.45rem, 0.1rem);
			background-color: $outline;
		}
	}
}
</style>
