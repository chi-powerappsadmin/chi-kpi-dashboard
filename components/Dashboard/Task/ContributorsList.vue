<script setup lang="ts">
import type { Contributor } from "~/types/models/Objective";

interface Props {
	loading: boolean;
	contributors?: Contributor[];
}

interface Emits {
	(event: "refresh"): void;
}

const { contributors = [] } = defineProps<Props>();
const emits = defineEmits<Emits>();
const route = useRoute();
const contributorsToRemove = defineModel<string[]>();

const { employees } = storeToRefs(useEmployeesStore());
const { user } = storeToRefs(useUserStore());

const searchTerm = ref("");
const showContributorsDrawer = ref(false);
const contributorsToAdd = ref<{ id: string; name: string }[]>([]);
const addingContributorsStatus = ref<RequestStatus>("idle");

const tableColumns = [
	{ value: "fullName", label: "Full Name", width: "27.4rem" },
	{ value: "department", label: "Department", width: "27.4rem" },
	{ value: "phoneNumber", label: "Phone Number", width: "27.4rem" },
];

const allEmployees = computed(() => {
	return employees.value.map((employee) => {
		return {
			id: employee.id,
			name: employee.fullName,
		};
	});
});

const unselectedContributors = computed(() => {
	const unselectedContributors = allEmployees.value
		.filter(
			(employee) =>
				contributorsToAdd.value.findIndex((item) => item.id === employee.id) === -1 &&
				contributors.findIndex((contributor) => contributor.id === employee.id) === -1,
		)
		.filter((contributor) => contributor.id !== user.value?.userData?.id);
	if (searchTerm.value)
		return unselectedContributors.filter((contributor) =>
			contributor.name.toLowerCase().includes(searchTerm.value.toLowerCase()),
		);
	return unselectedContributors;
});

const openContributorsDrawer = (value: boolean) => {
	if (!value && addingContributorsStatus.value === "pending") return;
	showContributorsDrawer.value = value;
};

const selectNewContributor = (id: string, name: string) => {
	contributorsToAdd.value.push({ id, name });
};
const removeContributor = (contributorId: string) => {
	contributorsToAdd.value = contributorsToAdd.value.filter((contributor) => contributor.id !== contributorId);
};
const addContributorsToTask = async () => {
	if (!contributorsToAdd.value.length) return;
	addingContributorsStatus.value = "pending";
	try {
		await useApi("/tasks/addcontributors", {
			method: "PATCH",
			query: {
				objectiveTaskID: route.params.id,
			},
			body: contributorsToAdd.value.map(({ id }) => id),
		});
		useToast("success", "Successful", "Contributors have been updated succesfully", 1500, false);
		showContributorsDrawer.value = false;
		contributorsToAdd.value = [];
		emits("refresh");
	} catch (error) {
		addingContributorsStatus.value = "error";
	} finally {
		addingContributorsStatus.value = "success";
	}
};
</script>

<template>
	<section style="overflow: auto">
		<div class="flex flex-column task-contributors">
			<div class="flex items-center content-between">
				<p class="body-regular weight-500">Contributors</p>
				<div class="flex items-center gap-8">
					<button
						class="flex items-center body-regular weight-500 gap-8"
						@click="openContributorsDrawer(true)">
						<IconsUsersProfilesPlus />
						<span class="add-text">Add Existing Users</span>
					</button>
					<!-- <BaseButton size="sm">
						<IconsEllipsisVertical />
					</BaseButton> -->
				</div>
			</div>

			<BaseTable
				v-model="contributorsToRemove"
				:is-loading="loading"
				:show-select="true"
				:columns="tableColumns"
				:table-data="contributors">
				
			</BaseTable>
		</div>

		<BaseSideDrawer v-model="showContributorsDrawer" :can-close="addingContributorsStatus !== 'pending'">
			<div class="contributors-drawer">
				<div class="contributors-drawer__close flex">
					<button class="flex items-center content-center" @click="openContributorsDrawer(false)">
						<span class="block icon"><IconsClose /></span>
					</button>
				</div>
				<div class="contributors-drawer__content flex flex-column">
					<div class="contributors-drawer__header flex flex-column gap-8">
						<h4 class="weight-500">Lookup Records</h4>
						<p class="body-regular weight-500">Select Records</p>
					</div>
					<div class="contributors-drawer__form flex flex-column">
						<div class="selected-contributors flex items-center content-between gap-8 bg-accent">
							<div class="selected-contributors__list flex items-center gap-12">
								<DashboardTaskContributorItem
									v-for="contributor in contributorsToAdd"
									:key="contributor.id"
									:contributor="contributor"
									@remove="removeContributor" />
							</div>
							<span class="selected-contributors__arrow flex items-center content-center">
								<IconsArrowRight />
							</span>
						</div>
						<BaseInput
							id="search"
							v-model="searchTerm"
							name="search"
							type="search"
							:is-search="true"
							search-position="right"
							placeholder="Add more records"
							font="poppins"
							weight="500"
							sizing="padding"
							padding="1.8rem" />
					</div>
					<div class="contributors-drawer__records flex flex-column gap-8">
						<div class="flex content-between items-center">
							<p class="body-regular color-text weight-500">All Records</p>
						</div>
						<div class="contributors-drawer__employees">
							<div
								v-for="employee in unselectedContributors"
								:key="employee.id"
								class="flex items-center gap-8 employee-item"
								@click="selectNewContributor(employee.id, employee.name)">
								<BaseAvatar size="sm" :name="employee.name" />
								<span class="color-sec weight-500 body-small">{{ employee.name }}</span>
							</div>
						</div>
					</div>
				</div>
				<div class="contributors-drawer__actions grid gap-12">
					<BaseButton variant="grey" full center @click="openContributorsDrawer(false)">Cancel</BaseButton>
					<BaseButton
						variant="purple"
						full
						center
						:disabled="addingContributorsStatus === 'pending' || !contributorsToAdd.length"
						:loading="addingContributorsStatus === 'pending'"
						@click="addContributorsToTask">
						Add
					</BaseButton>
				</div>
			</div>
		</BaseSideDrawer>
	</section>
</template>

<style lang="scss" scoped>
.add-text {
	display: none;

	@include breakpoint(md) {
		display: block;
	}
}

.task-contributors {
	border-radius: 1.2rem;
	border: 0.1rem solid $outline-stroke;
	background: $light-grey;
	gap: 2rem;
	padding: 2.4rem 1.6rem;
}

.contributors-drawer {
	width: 90vw;
	padding: 1.6rem;

	@include breakpoint(md) {
		width: 44.5rem;
	}

	&__close {
		margin-bottom: 1.2rem;

		button {
			@include element-size(2.4rem, 2.34rem);
			background-color: #74748014;
			border-radius: 50%;
			margin-left: auto;
			line-height: 0;

			.icon {
				@include element-size(1rem, 0.96rem);
			}
		}
	}

	&__header h4 {
		@include typography(2.4rem, normal);
	}

	&__content {
		gap: 2.4rem;
	}

	&__form {
		gap: 1.6rem;
	}

	&__actions {
		margin-top: 10rem;
		grid-template-columns: 10.5rem 13.1rem;
	}

	&__employees {
		height: 22rem;
		overflow: auto;
	}
}

.selected-contributors {
	padding: 1rem 0.8rem;
	padding-right: 1.8rem;
	border-radius: 0.8rem;
	border: 0.1rem solid $outline;
	min-height: 6rem;

	&__list {
		flex-wrap: wrap;
	}

	&__arrow {
		padding: 0.4rem;
		@include element-size(2.4rem, 2.4rem);
		border-radius: 50%;
		border: 0.1rem solid $sec-brand;
	}
}

.employee-item {
	padding: 2rem 0;
	border-bottom: 1px solid $outline;
	cursor: pointer;
}
</style>
