import { ofetch } from "ofetch";
import type { c } from "ofetch/dist/shared/ofetch.441891d5";
import type { UserInCookie } from "~/types/models/User";

const MILLISECONDS_TO_MINUTES = 60000;

export function useApi<T>(url: string, options?: c<"json">) {
	const { $msal } = useNuxtApp();
	const baseURL = useRuntimeConfig().public.baseUrl;
	const userCookie = useCookie<UserInCookie | null>("user");

	const fetcher = ofetch.create({
		baseURL,
		async onRequest() {
			// Checks if token expires in the next 3 minutes or have expired
			const tokenExpirationTime = useCookie<number>("tokenExpirationTime");
			const minutesUntilTokenExpiration = (tokenExpirationTime.value - Date.now()) / MILLISECONDS_TO_MINUTES;

			if (Math.floor(minutesUntilTokenExpiration) < 3) {
				const accounts = await $msal().getAccounts();
				await $msal().refreshAccessToken(accounts[0]);
			}

			const token = useCookie("token");

			this.headers = {
				...this.headers,
				Authorization: `Bearer ${token.value}`,
			};
		},
		onResponseError(ctx) {
			if (ctx.response.status === 401) {
				if (userCookie) {
					const homeAccountId = userCookie.value?.user.homeAccountId;
					if (homeAccountId) {
						$msal().signOut(homeAccountId);
					}
				}
			} else {
				throw ctx.response._data;
			}
		},
	});
	return fetcher<T>(url, {
		...options,
	});
}
