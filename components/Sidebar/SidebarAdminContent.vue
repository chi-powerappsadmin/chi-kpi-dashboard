<script setup lang="ts"></script>

<template>
	<div class="sidebar__admin">
		<div class="sidebar__item">
			<div class="sidebar__item-title">
				<p>Dashboards</p>
			</div>
			<div class="sidebar__item-list">
				<BaseButton to="/dashboard/employee-performance-objectives" tag="nuxt-link">
					<IconsGrid />
					<span>Dashboard</span>
				</BaseButton>
			</div>
		</div>

		<div class="sidebar__item">
			<div class="sidebar__item-title">
				<p>Activities</p>
			</div>
			<div class="sidebar__item-list">
				<BaseButton tag="nuxt-link" to="/objectives">
					<IconsTarget />
					Objectives
				</BaseButton>
				<BaseButton to="/tasks" tag="nuxt-link">
					<IconsChecklist />
					<span>Tasks</span>
				</BaseButton>
			</div>
		</div>

		<div class="sidebar__item">
			<div class="sidebar__item-title">
				<p>Metrics</p>
			</div>
			<div class="sidebar__item-list">
				<BaseButton tag="nuxt-link" to="/periods">
					<IconsHourglass />
					<span>Periods</span>
				</BaseButton>
			</div>
		</div>

		<div class="sidebar__item">
			<div class="sidebar__item-title">
				<p>People</p>
			</div>
			<div class="sidebar__item-list">
				<BaseButton tag="nuxt-link" to="/users">
					<IconsUser />
					<span>User</span>
				</BaseButton>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
.sidebar__admin {
	display: grid;
	gap: 3.2rem;
}

.sidebar__item {
	display: grid;
	gap: 1.2rem;

	.sidebar__item-title {
		font-weight: 500;
	}

	&-list {
		display: grid;
		gap: 1.2rem;

		button,
		a {
			gap: 0.8rem;

			svg {
				height: 2.4rem;
				width: 2.4rem;
				stroke: currentColor;
			}
		}
	}
}
</style>
