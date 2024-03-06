// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	runtimeConfig: {
		public: {
			baseUrl: process.env.BASE_URL,
			clientId: process.env.CLIENT_ID,
			authority: process.env.AUTHORITY,
			redirectUri: process.env.REDIRECT_URI,
			postLogoutRedirectUri: process.env.POST_LOGOUT_REDIRECT_URI,
			msalScope: process.env.MSAL_SCOPE
		},
	},
	devServer: {
		port: 3003,
	},
	css: ["@/assets/styles/font.scss", "@/assets/styles/index.scss"],
	devtools: { enabled: true },
	imports: {
		dirs: ["stores"],
	},
	modules: ["@pinia/nuxt", "@pinia-plugin-persistedstate/nuxt"],
	vite: {
		vue: {
			script: {
				defineModel: true,
				propsDestructure: true,
			},
		},
		css: {
			preprocessorOptions: {
				scss: {
					additionalData: `
						@import "@/assets/styles/abstract/_mixins.scss";
						@import "@/assets/styles/abstract/_variables.scss";
					`,
				},
			},
		},
	},
	routeRules: {
		"/": { ssr: false },
		"/onboarding": { ssr: false }
	},
});
