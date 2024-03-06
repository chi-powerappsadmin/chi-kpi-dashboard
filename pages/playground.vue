<script setup lang="ts">
import type { GetKpiPeriodsResponse } from "~/types/apiResponse/period";
import type { Period } from "~/types/models/Period";

const { user } = storeToRefs(useUserStore())

definePageMeta({
	layout: "dashboard",
	middleware: "auth",
});

const { $msal } = useNuxtApp();
const { setAuthenticationStatus } = useUserStore();

const data = ref<Period[]>([]);
const fetchData = async () => {
	const req = await useApi<GetKpiPeriodsResponse>("/periods");
	data.value = req.data;
};

const openModal = ref(false);
const openDrawer = ref(false);
const activeTab = ref("details");
const selected = ref([]);
const tabs = [
	{ value: "details", label: "Details" },
	{ value: "performance-objectives", label: "Performance Objectives" },
	{ value: "objective-task", label: "Objective Task" },
];

const columns = [
	{ value: "name", label: "Name", width: "23.5rem" },
	{ value: "status", label: "Status", width: "14.1rem" },
	{ value: "owner", label: "Owner", width: "16.5rem" },
	{ value: "target", label: "Target", width: "14.1rem" },
	{ value: "actual", label: "Actual", width: "14.1rem" },
	{ value: "weight", label: "Weight", width: "14.1rem" },
	{ value: "progress", label: "Progress", width: "14.1rem" },
	{ value: "type", label: "Type", width: "27.1rem" },
];

const tableData = [
	{ id: "1", name: "2023 - Second Half Year Target", status: "Not started", owner: "Femi Ajayi", target: "1.00", actual: "6.00", weight: "99.00", progress: "99.00", type: "Revenue (Amount)" },
	{ id: "2", name: "Staffing Review", status: "Not started", owner: "Bessie Cooper", target: "20.00", actual: "6.00", weight: "100.00", progress: "99.00", type: "Percentage Aggregate (Amount)" },
	{ id: "3", name: "Tasks Delivered/Achieved", status: "Not started", owner: "Leslie Alexander", target: "20.00", actual: "2.00", weight: "20.00", progress: "2.00", type: "Number Count (Amount)" },
	{ id: "4", name: "Zero HR Query", status: "Not started", owner: "Wade Warren", target: "20.00", actual: "2.00", weight: "", progress: "1.00", type: "Percentage (Amount)" },
];

const logout = () => {
	if (!user.value) return
	$msal().signOut(user.value.homeAccountId)
	setAuthenticationStatus(false);
};

const activeDropdown = ref("active-tasks");
const showDropdown = ref(false);
const dropdownList = [
	{ value: "active-tasks", label: "All Performance Objectives" },
	{ value: "inactive-tasks", label: "All Completed Performance Objectives" },
];

function makeAToast() {
	useToast('success', 'A success story', 'A success description', 5000, true)
}
</script>

<template>
	<div>
		<button style="border: 3px solid grey" @click="makeAToast">Create Toast</button>
		{{ data }}
		<button style="border: 3px solid grey" @click="fetchData">FETCH KPI PERIODS</button>
		<button @click="logout">Logout</button>
		<BaseAvatar name="Sub Zero" image-url="" />
		<BaseAvatar name="Johnny Cage" image-url="" />
		<BaseAvatar name="Liu Kang" image-url="" />
		<BaseAvatar name="Kung Lao" image-url="" />
		<BaseAvatar name="Sonya Blade" image-url="http://unsplash.it/200/200?random&gravity=center" />

		<BaseCheckbox id="checkbox" v-model="openModal" name="checkbox" label="Open Modal" />
		<BaseCheckbox id="checkbox-2" v-model="openDrawer" name="checkbox-2" label="Open Drawer" />
		<BaseTabs v-model="activeTab" :tabs="tabs" />

		<div class="test">
			<h1 class="flex items-center" @click="showDropdown = true">
				Toggle Dropdown
				<span class="block">
					<IconsChevronDown />
				</span>
			</h1>
			<BaseDropdown :show="showDropdown" :list="dropdownList"
				:position="{ top: '3.5rem', left: '0', maxWidth: '36rem' }" @close="showDropdown = false">
				<div v-for="item in dropdownList" :key="item.label" class="dropdown__item content-between font-montserrat"
					@click="activeDropdown = item.value">
					<span>{{ item.label }}</span>
					<IconsOutlineCheck v-if="item.value === activeDropdown" />
				</div>
				<button class="dropdown__item dropdown__item--action gap-8">
					<IconsAddSquare />
					Manage and share View
				</button>
			</BaseDropdown>
		</div>

		<div class="flex flex-column tables">
			<BaseTable v-model="selected" :show-select="true" :columns="columns" :table-data="tableData">
				<template #name="{ value }">
					<div class="sample-slot">{{ value }}</div>
				</template>
				<template #owner="{ value }">
					<div class="flex items-center avatar">
						<BaseAvatar size="sm" :name="value" />
						<span class="avatar__text">{{ value }}</span>
					</div>
				</template>
			</BaseTable>

			<BaseTable :columns="columns" :table-data="[]"></BaseTable>
		</div>

		<BaseModal v-model="openModal" :can-close="true">
			<div style="background-color: #fff; max-width: 32rem">
				Lorem ipsum dolor sit amet consectetur adipisicing elit.
				Numquam tenetur ullam, veniam aut, velit earum nulla dolorum quas cumque saepe ipsa itaque corrupti
				necessitatibus pariatur molestias debitis cum cupiditate doloremque
			</div>
		</BaseModal>

		<BaseSideDrawer v-model="openDrawer">
			<div style="max-width: 32rem">
				Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam tenetur ullam,
				veniam aut, velit earum nulla dolorum quas cumque saepe ipsa itaque corrupti necessitatibus pariatur
				molestias debitis cum cupiditate doloremque
			</div>
		</BaseSideDrawer>
	</div>
</template>

<style lang="scss" scoped>
.tables {
	margin-top: 4rem;
	gap: 4rem;
}

.avatar {
	gap: 0.8rem;

	&__text {
		font-family: "Work Sans";
		font-weight: 500;
	}
}

.sample-slot {
	@include typography(1.3rem, normal);
	cursor: pointer;
	color: $sec-brand;
	font-family: "Montserrat", sans-serif;
	font-weight: 600;
}

.test {
	position: relative;

	h1 {
		gap: 0.8rem;
		cursor: pointer;

		span {
			height: 2.4rem;
			width: 2.4rem;
		}
	}
}
</style>
