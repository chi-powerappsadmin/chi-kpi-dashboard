import type { Currency } from "~/types/models/Currency";

export const useCurrencyStore = defineStore("currency", () => {
	const currencies = ref<Currency[]>([]);

	const getCurrencyLabel = (value: string) => {
		return currencies.value.find((opt) => opt.id === value)?.currencyName || "";
	}

	return {
		currencies,
		getCurrencyLabel
	};
});
