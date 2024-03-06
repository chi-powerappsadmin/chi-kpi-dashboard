import type { GetEmployeeResponse } from "@/types/apiResponse/employees";
import type { Employee } from "~/types/models/Employee";
import type { AuthUser, UserInCookie } from "~/types/models/User";

export default defineNuxtRouteMiddleware(async () => {
	const store = useUserStore();

	if (!store.isAuthenticated) {
		return navigateTo("/");
	}

	const user = useCookie<UserInCookie>("user");
	const userDataInStore = store.user?.userData;
	const userIsAlreadyOnboarded = userDataInStore && Object.keys(userDataInStore).length > 0;

	if (user.value && !userIsAlreadyOnboarded) {
		const account = user.value.user;
		let employee: null | Employee;
		try {
			const response = await useApi<GetEmployeeResponse>("/employees/id:guid", {
				query: { employeeID: account?.idTokenClaims?.oid },
			});
			if (response.status === "000" && response.message === "Successful") {
				employee = response.data;
				const userObject: AuthUser = {
					...account,
					userData: employee,
				};
				store.setUser(userObject);
			}
		} catch (err) {
			return navigateTo("/onboarding", { replace: true });
		}
	}
});
