import type { ErrorObject } from "@vuelidate/core";

export function stringToDate(date: string | Date) {
	return new Date(date).toDateString();
}

export function splitStringByUppercase(str: string) {
	const splitArray = str.split(/(?=[A-Z])/);
	return splitArray.join(" ");
}

export function splitStringByUnderscore(str: string) {
	return str.split("_").join(" ");
}

export const vuelidateErrorMessage = (errors: ErrorObject[]) => {
	return errors.length ? (errors[0].$message as string) : "";
};