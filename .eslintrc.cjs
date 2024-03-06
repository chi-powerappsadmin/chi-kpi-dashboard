module.exports = {
	root: true,
	env: {
		browser: true,
		node: true,
	},
	parser: "vue-eslint-parser",
	parserOptions: {
		parser: "@typescript-eslint/parser",
	},
	extends: ["@nuxtjs/eslint-config-typescript", "prettier", "plugin:vue/vue3-essential", "eslint:recommended", "plugin:vue/vue3-recommended", "plugin:vue/vue3-essential", "plugin:vue/vue3-strongly-recommended", "plugin:@typescript-eslint/recommended"],
	plugins: [],
	rules: {
		"vue/multi-word-component-names": "off",
		"vue/require-default-prop": "off",
		"vue/html-indent": "off",
		"vue/singleline-html-element-content-newline": "off",
		"vue/html-self-closing": "off",
		"no-undef": "off",
		"vue/max-attributes-per-line": "off",
		"vue/first-attribute-linebreak": "off",
		"vue/html-closing-bracket-newline": "off",
	},
};
