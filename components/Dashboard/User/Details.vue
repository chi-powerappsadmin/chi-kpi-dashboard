<script setup lang="ts">
import type { Employee } from "@/types/models/Employee";

interface Props {
	user: Employee;
}

defineProps<Props>();
</script>

<template>
	<div>
		<div class="user-info__details">
			<div class="user-info__name flex content-between">
				<div class="flex gap-8">
					<BaseAvatar size="xl" :name="user.fullName" />
					<div class="flex flex-column gap-4">
						<h3 class="color-dark weight-500">{{ user.fullName }}</h3>
						<p class="body-rregular weight-500">Sign-in Allowed</p>
					</div>
				</div>
			</div>
			<div class="grid user-info__grid">
				<DashboardUserDetailsItem
					:is-heading="true"
					title="Username"
					:body="user.email"
					inner-gap="0"
					main-gap="8" />
				<DashboardUserDetailsItem
					:is-heading="true"
					title="Department "
					:body="user.department.name"
					inner-gap="0"
					main-gap="8" />
				<DashboardUserDetailsItem
					:is-heading="true"
					title="Line Manager "
					:body="user.manager.name || '-'"
					inner-gap="0"
					main-gap="8" />
				<DashboardUserDetailsItem
					:is-heading="true"
					title="Role"
					:body="user.isAdmin ? 'Administrator role' : 'Member role'"
					inner-gap="0"
					main-gap="8" />
			</div>
		</div>
		<div class="user-info__contact">
			<h4 class="body-regular weight-500 color-dark">Contact Information</h4>
			<div class="grid user-info__grid">
				<DashboardUserDetailsItem title="First Name" :body="user.firstName" />
				<DashboardUserDetailsItem title="Last Name" :body="user.lastName" />
				<DashboardUserDetailsItem title="Display Name" :body="user.fullName" />
				<DashboardUserDetailsItem title="Phone Number" :body="user.mobilePhone || '-'" />
			</div>
		</div>

		<div class="user-info__links">
			<div class="user-info__grid">
				<NuxtLink :to="`/users/${user.id}/objectives`">My Objectives  <IconsLink /> </NuxtLink>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.user-info {
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

	&__links {
		margin-top: 2.4rem;
		font-weight: 500;
		font-size: 1.4rem;
		a {
			color: $sec-brand;
			display: flex;
			align-items: center;
			gap: 0.5rem;

			svg {
				height: 1.6rem;
				width: 1.6rem;
			}
			
			&:hover {
				text-decoration: underline;
			}
		}
	}
}
</style>
