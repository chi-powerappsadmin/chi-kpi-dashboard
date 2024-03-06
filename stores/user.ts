import type { AuthUser } from "~/types/models/User";

export const useUserStore = defineStore(
	"user",
	() => {
		const user = ref<AuthUser | null>();
		const isAuthenticated = ref(false);
		const department = computed(() => {
			return user.value?.userData?.department;
		});

		const membershipType = computed(() => {
			return user.value?.userData?.userType;
		});

		const oid = computed(() => user.value?.idTokenClaims?.oid)

		const setUser = (userObject: AuthUser) => {
			user.value = { ...userObject };
			setAuthenticationStatus(true);
		};

		const setAuthenticationStatus = (status: boolean) => {
			isAuthenticated.value = status;
			if (!status) user.value = null;
		};

		return { user, isAuthenticated, department, membershipType, oid, setUser, setAuthenticationStatus };
	},
	{ persist: true },
);
