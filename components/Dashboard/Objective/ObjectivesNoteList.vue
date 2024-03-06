<script setup lang="ts">
import type { Note } from "~/types/models/Objective";

interface Emits {
	(e: "refresh"): void;
}
interface Props {
	notes: Note[];
	canAddNote: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<Emits>();

const showNewNoteForm = ref(false);
const loading = ref(true);

function handleSuccess() {
	showNewNoteForm.value = false;
	emit("refresh");
}

const searchTerm = ref("");

const filteredNotes = computed(() => {
	if (searchTerm.value.trim() === "") return props.notes;
	return props.notes.filter((note) => {
		const valuesStringified = JSON.stringify(Object.values(note));
		return valuesStringified.toLowerCase().includes(searchTerm.value.toLowerCase());
	});
});
</script>

<template>
	<div class="timeline">
		<div class="flex content-between items-center">
			<p class="weight-500">Feedbacks/Comments</p>
			<div class="actions">
				<button v-if="props.canAddNote" @click="showNewNoteForm = true">
					<IconsAddSquare />
				</button>
				<!-- <button>
					<IconsFilter />
				</button> -->
			</div>
		</div>
		<div>
			<BaseInput
				id="m"
				v-model="searchTerm"
				is-search
				search-position="left"
				name="m"
				placeholder="Search"
				font="poppins" />
		</div>

		<template v-if="filteredNotes.length">
			<DashboardObjectiveNote v-for="note in filteredNotes" :key="note.id" :note="note" />
		</template>

		<template v-else>
			<p class="text-center">No note!</p>
		</template>

		<BaseSideDrawer v-model="showNewNoteForm" :can-close="!loading">
			<DashboardObjectiveNewNoteForm
				@success="handleSuccess"
				@is-loading="(data) => (loading = data)"
				@cancel="showNewNoteForm = false" />
		</BaseSideDrawer>
	</div>
</template>

<style lang="scss" scoped>
.timeline {
	position: sticky;
	top: 0;
	padding: 2.4rem 1.6rem;
	background-color: $light-grey;
	border: 0.1rem solid $outline-stroke;
	border-radius: 1.2rem;

	display: flex;
	flex-direction: column;
	gap: 2rem;

	.actions {
		display: flex;
		align-items: center;
		gap: 2rem;

		svg {
			height: 2.4rem;
			width: 2.4rem;
		}
	}
}
</style>
