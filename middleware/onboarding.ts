import type { GetEmployeeResponse } from "@/types/apiResponse/employees";
import type { UserInCookie } from "~/types/models/User";

export default defineNuxtRouteMiddleware(async () => {
	const store = useUserStore();

	if (!store.isAuthenticated) {
		return navigateTo("/");
	}

	if (process.client) {
		const user = useCookie<UserInCookie>("user");

		if (user.value) {
			const account = user.value.user;
			try {
				const response = await useApi<GetEmployeeResponse>("/employees/id:guid", {
					query: { employeeID: account?.idTokenClaims?.oid },
				});
				if (response && response.message === "Successful") return navigateTo("/dashboard/employee-performance-objectives", { replace: true });
			} catch {}
		}
	}
});
