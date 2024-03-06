import {
	BrowserCacheLocation,
	EventType,
	PublicClientApplication,
	type AccountInfo,
	type AuthenticationResult,
	type Configuration,
} from "@azure/msal-browser";

let tokenExpirationTimer: NodeJS.Timeout;

export default defineNuxtPlugin(async ({ $config }) => {
	const store = useUserStore();

	const msalConfig: Configuration = {
		auth: {
			clientId: $config.public.clientId,
			authority: $config.public.authority,
			redirectUri: $config.public.redirectUri,
			postLogoutRedirectUri: $config.public.postLogoutRedirectUri,
			navigateToLoginRequestUrl: false,
		},
		cache: {
			cacheLocation: BrowserCacheLocation.LocalStorage,
			storeAuthStateInCookie: true,
		},
		system: {
			tokenRenewalOffsetSeconds: 300,
		},
	};

	const msalInstance = new PublicClientApplication(msalConfig);
	await msalInstance.initialize();

	// Handle redirect promise after login or redirect
	await msalInstance
		.handleRedirectPromise() // Handles the redirect promise and obtains the response
		.then(handleResponse)
		.catch((err) => {
			throw new Error(err);
		});

	// Add event callback for login success
	msalInstance.addEventCallback((event) => {
		if (event.eventType === EventType.LOGIN_SUCCESS) {
			setupTokenExpirationTimer();
		}
	});

	// Set up timer for refreshing access token upon expiration
	function setupTokenExpirationTimer() {
		const accounts = msalInstance.getAllAccounts();
		if (accounts.length > 0) {
			const account = accounts[0];
			if (account.idTokenClaims && account.idTokenClaims.exp) {
				const tokenExpirationTime = useCookie<number>('tokenExpirationTime', { default: () => 0 })
				tokenExpirationTime.value = account.idTokenClaims.exp * 1000;
				const currentTime = Date.now();
				const timeUntilExpiration = tokenExpirationTime.value - currentTime;

				clearTimeout(tokenExpirationTimer);

				tokenExpirationTimer = setTimeout(() => {
					refreshAccessToken(account);
				}, timeUntilExpiration);
			}
			store.setUser(account);
		}
	}

	// Refresh access token
	async function refreshAccessToken(account: AccountInfo) {
		try {
			await msalInstance.acquireTokenSilent({
				account,
				scopes: [$config.public.msalScope],
			});
			setupTokenExpirationTimer();
		} catch (err) {
			signOut(account.homeAccountId);
		}
	}

	// Handle the response after login or redirect
	async function handleResponse(resp: AuthenticationResult | null) {
		if (resp?.account) {
			setupTokenExpirationTimer();
			await acquireTokenSilent()
		}
	}

	// Acquire access token silently
	async function acquireTokenSilent() {
		const accounts = msalInstance.getAllAccounts();
		if (accounts.length > 0) {
			const account = accounts[0];
			msalInstance.setActiveAccount(account);
			try {
				const response = await msalInstance.acquireTokenSilent({
					account,
					scopes: [$config.public.msalScope],
				});
				useCookie('token').value = response.accessToken
				return response.accessToken;
			} catch (err) {
				return null;
			}
		} else {
			return null;
		}
	}

	const loginRequest = {
		scopes: [$config.public.msalScope],
	};

	// Sign in with redirect
	async function signIn() {
		try {
			await msalInstance.loginRedirect(loginRequest);
		} catch {}
	}

	// Get all MSAL accounts
	function getAccounts() {
		return msalInstance.getAllAccounts();
	}

	// Check if user is authenticated
	function isAuthenticated() {
		return getAccounts().length > 0;
	}

	// Sign out user
	function signOut(accountId: string) {
		const account = accountId ? msalInstance.getAccountByHomeId(accountId) : null;
		localStorage.clear();
		useCookie("user").value = "";
		useCookie('token').value = ""
		if (account) {
			msalInstance.logoutRedirect({
				account,
			});
		}
	}

	const msalObj = {
		signIn,
		getAccounts,
		isAuthenticated,
		signOut,
		acquireTokenSilent,
		refreshAccessToken
	};

	return {
		provide: {
			msal: () => msalObj,
		},
	};
});
