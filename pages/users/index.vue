<script setup lang="ts">
import type { GetEmployeesResponse } from "~/types/apiResponse/employees";

definePageMeta({
	layout: "dashboard",
	middleware: "auth",
});
const {
	data: users,
	pending,
	refresh,
} = await useAsyncData("employees", () => useApi<GetEmployeesResponse>("/employees"), {
	transform(data) {
		return data.data;
	},
	default: () => []
});

const tableColumns = [
	{ value: "fullName", label: "Name", width: "34.5rem" },
	{ value: "email", label: "Email", width: "34.5rem" },
	{ value: "department", label: "Department", width: "34.5rem" },
	{ value: "manager", label: " Line Manager", width: "34.5rem" },
];

const selectedUsers = ref([]);
</script>

<template>
	<div class="users-page">
		<DashboardPageHeader>
			<BaseButton size="sm" class="gap-4" @click="refresh">
				<IconsArrowRefresh />
				Refresh
			</BaseButton>
		</DashboardPageHeader>
		<div class="users-page__content">
			<div class="users-page__title flex items-center">
				<h4 class="weight-500">Users</h4>
				<BaseButton size="sm">
					<IconsChevronDown />
				</BaseButton>
			</div>

			<BaseTable v-model="selectedUsers" :show-select="true" :is-loading="pending" :columns="tableColumns" :table-data="users">
				<template #fullName="{ value, record }">
					<span class="flex items-center gap-8 user-avatar">
						<BaseAvatar size="sm" :name="value"></BaseAvatar>
						<NuxtLink :to="`/users/${record.id}`" class="weight-500 body-small">{{ value }}</NuxtLink>
					</span>
				</template>
				<template #department="{ value }">{{ value.name }}</template>
				<template #manager="{ value }">{{ value.name }}</template>
			</BaseTable>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.users-page {
	&__content {
		background-color: white;
	}

	&__title {
		padding: 2rem 3.2rem;

		h4 {
			@include typography(2rem, normal, 2.4rem);
		}

		button:not(.dropdown__item) {
			border: 0;
			height: 2.4rem;
			padding: 0;

			svg {
				height: 2.4rem;
				width: 2.4rem;
			}
		}
	}
}

.user-avatar {
	cursor: pointer;
}

.user-drawer {
	padding: 1.6rem;
	width: 100vw;
	max-width: 50.8rem;

	&__close {
		margin-bottom: 2.4rem;

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

	&__grid {
		gap: 3.6rem 0.8rem;

		@include breakpoint(md) {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	&__name {
		margin-bottom: 3.6rem;
		align-items: start;

		h3 {
			@include typography(2rem, normal, 2.4rem);
		}

		p {
			color: $success;
		}
	}

	&__details {
		margin-bottom: 3.6rem;
	}

	&__contact h4 {
		margin-bottom: 2.4rem;
	}
}
</style>
