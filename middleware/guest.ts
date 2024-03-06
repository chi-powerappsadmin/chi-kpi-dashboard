export default defineNuxtRouteMiddleware(() => {
	const store = useUserStore();

	if (store.isAuthenticated) {
		return navigateTo("/dashboard/employee-performance-objectives");
	}
});
