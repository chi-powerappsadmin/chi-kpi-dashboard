<script setup lang="ts">
import type { AuthUser } from "~/types/models/User";

interface Props {
	user?: AuthUser | null;
}

const props = defineProps<Props>();
const routeName = useRoute().name as string;
const { $msal } = useNuxtApp();
const { setAuthenticationStatus } = useUserStore();
const { user: storeUser } = storeToRefs(useUserStore());


const showProfileDropdown = ref(false);
const showUserDrawer = ref(false);

const fullName = computed(() => props.user?.name || "");
const showNavigationToggler = computed(() => !["login", "signup", "onboarding"].includes(routeName));

const selectedPeriod = ref("");
const { periods } = storeToRefs(usePeriodStore());
const periodOptions = computed(() => periods.value.map((period) => ({ label: period.name, value: period.id })));

function openSidebar() {
	useEvent("sidebar:toggle", true);
}



watch(
	() => periodOptions,
	() => {
		if (periodOptions && periodOptions.value.length > 0) {
			selectedPeriod.value = periodOptions.value[0].value;
		}
	},
	{ immediate: true },
);

const openUserDrawer = (value: boolean) => {
	showUserDrawer.value = value;
	showProfileDropdown.value = false;
	showMissionStatement.value = false;
};

const showMissionStatement = ref(false);

const openPopover = (value: boolean) => {
	showProfileDropdown.value = value;
	showUserDrawer.value = false;
	showMissionStatement.value = false;
};

const openMissionStatement = (value: boolean) => {
	showMissionStatement.value = value;
	showProfileDropdown.value = false;
	showUserDrawer.value = false;
};

const logout = () => {
	if (!storeUser.value) return;
	$msal().signOut(storeUser.value.homeAccountId);
	setAuthenticationStatus(false);
};
</script>

<template>
	<header class="header">
		<nuxt-link to="/dashboard" class="header__brand">
			<BaseAppLogo />
			<span>KPI Tracker</span>
		</nuxt-link>

		<div class="user-wrapper" v-if="user">
			<button class="mission-statement" @click="openMissionStatement(true)">Mission Statement</button>

			<div>
				<div class="header__user-avatar" @click="openPopover(true)">
					<BaseAvatar wrapper-tag="button" :name="fullName" size="lg" />
				</div>
				<BaseDropdown
					:show="showProfileDropdown"
					:position="{ maxWidth: '18.6rem', right: '4rem', top: '6.5rem' }"
					@close="openPopover(false)">
					<ul class="profile-dropdown">
						<li>
							<button
								to="#"
								class="profile-dropdown__item body-small weight-500 color-dark flex items-center"
								@click.stop="openUserDrawer(true)">
								<IconsUserProfile />
								<span>View Profile</span>
							</button>
						</li>
						<li>
							<button
								class="profile-dropdown__item body-small weight-500 color-dark flex items-center"
								@click="logout">
								<IconsLogout />
								<span>Logout</span>
							</button>
						</li>
					</ul>
				</BaseDropdown>
			</div>
		</div>

		<button v-if="showNavigationToggler" class="sidebar-toggle" @click.stop="openSidebar">
			<IconsMenu />
		</button>

		<BaseSideDrawer v-model="showUserDrawer">
			<div v-if="storeUser?.userData" class="user-drawer">
				<div class="user-drawer__close flex">
					<button class="flex items-center content-center" @click="openUserDrawer(false)">
						<span class="block icon"><IconsClose /></span>
					</button>
				</div>
				<DashboardUserDetails :user="storeUser?.userData" />
			</div>
		</BaseSideDrawer>

		<BaseSideDrawer v-model="showMissionStatement">
			<div class="mission-action">
				<div class="flex items-center content-end gap-8 period-select">
					<p>Period:</p>
					<BaseSelect
						id="period-select"
						v-model="selectedPeriod"
						name="period-select"
						:options="periodOptions"
						placeholder="Choose period" />
				</div>

				<button class="flex items-center content-center" @click="openMissionStatement(false)">
					<span class="block icon"><IconsClose /></span>
				</button>
			</div>
			<MissionStatement v-if="storeUser?.userData" :employee-id="storeUser?.userData.id" is-profile :selected-period="selectedPeriod" />
		</BaseSideDrawer>
	</header>
</template>

<style lang="scss" scoped>
.header {
	position: sticky;
	top: 0;
	left: 0;
	height: 7.2rem;
	padding: 0 3.2rem;
	background: $sec-brand;
	color: $light;

	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.8rem;
	// overflow: hidden;

	&__brand {
		display: flex;
		gap: 0.8rem;

		svg {
			height: 3.2rem;
			width: 3.2rem;
			stroke: white;
		}

		span {
			font-size: 2.4rem;
			font-weight: 700;
			letter-spacing: -0.48px;
			display: none;

			@include breakpoint(md) {
				display: initial;
			}
		}
	}

	.sidebar-toggle {
		width: 3rem;
		aspect-ratio: 1;
		position: absolute;
		top: 2rem;
		left: 0rem;
		color: $light;
		transition: all 320ms;

		@include flex-center;

		svg {
			height: 2.5rem;
			width: 2.5rem;
		}

		@include breakpoint(md) {
			display: none;
		}
	}
}

.user-wrapper {
	display: inline-flex;
	gap: 1.6rem;
	align-items: center;

	.mission-statement {
		color: #fafcfe;
		font-weight: 500px;
		font-size: 16px;
		line-height: 18.77px;
		padding: 3px;
		cursor: pointer;
	}
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
}

.profile-dropdown {
	li {
		background-color: #fff;
		padding: 1.6rem;

		&:not(:last-child) {
			box-shadow: 0px -1px 0px 0px #e1e3e5 inset;
		}
	}

	&__item {
		gap: 1rem;
	}
}


.mission-action{
	display: flex;
	align-items: center;
	gap: 10px;
	justify-content: space-between;
	padding: 10px 20px;

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
</style>
