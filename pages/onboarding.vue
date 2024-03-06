<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core";
import { email, required } from "@vuelidate/validators";
import type { GetDepartmentsResponse } from "~/types/apiResponse/departments";
import type { CreateEmployeeResponse, GetEmployeesResponse } from "~/types/apiResponse/employees";

definePageMeta({
	layout: "auth",
	middleware: "onboarding",
});

const { $msal } = useNuxtApp();
const { setAuthenticationStatus } = useUserStore();

const { data, error } = await useAsyncData(
	"onboarding",
	async () => {
		const [departments, managers] = await Promise.all([
			useApi<GetDepartmentsResponse>("/departments"),
			useApi<GetEmployeesResponse>("/employees"),
		]);
		return { departments, managers };
	},
	{
		transform(data) {
			const departments = data.departments.data.map(({ id, name }) => ({ value: id, label: name }));
			const managers = data.managers.data.map(({ id, fullName }) => ({ value: id, label: fullName }));
			return { departments, managers };
		},
	},
);

if (error.value) {
	throw createError({ statusCode: 500, statusMessage: "An error occurred" });
}

const form = reactive({ id: "", email: "", firstName: "", lastName: "", manager: "", department: "" });
const formRules = {
	email: { required, email },
	firstName: { required },
	lastName: { required },
	manager: { required },
	department: { required },
};
const v$ = useVuelidate(formRules, form, { $autoDirty: true, $lazy: true });
const requestStatus = ref<RequestStatus>("idle");

const createEmployee = async () => {
	v$.value.$touch();
	if (v$.value.$invalid) return;

	requestStatus.value = "pending";
	try {
		const response = await useApi<CreateEmployeeResponse>("/employees/create", {
			method: "POST",
			body: JSON.stringify(form),
		});

		if (response && response.message === "Successful") {
			return navigateTo("/dashboard/employee-performance-objectives", { replace: true });
		}
	} catch (error) {
		requestStatus.value = "error";
	}
};

onMounted(async () => {
	const accounts = await $msal().getAccounts();
	if (accounts && accounts.length > 0) {
		const { username, name = "", idTokenClaims } = accounts[0];
		const [firstName, lastName] = name.split(" ");
		Object.assign(form, { id: idTokenClaims?.oid, email: username, firstName, lastName });
	} else {
		setAuthenticationStatus(false);
		navigateTo("/", { replace: true });
	}
});
</script>

<template>
	<div v-if="data && data.departments && data.managers" class="onboarding flex flex-column">
		<AuthHeader title="Sign Up" message="Provide Your First name and last name" />
		<form class="onboarding__form flex flex-column" @submit.prevent="createEmployee">
			<BaseInput
				id="email"
				:model-value="form.email"
				name="email"
				label="Email"
				font="montserrat"
				placeholder="Enter your email address"
				disabled />
			<BaseInput
				id="firstName"
				:model-value="form.firstName"
				name="firstName"
				label="First name"
				font="montserrat"
				placeholder="Enter your first name"
				disabled />
			<BaseInput
				id="lastName"
				:model-value="form.lastName"
				name="lastName"
				label="Last name"
				font="montserrat"
				placeholder="Enter your last name"
				disabled />
			<BaseSelect
				id="manager"
				v-model="form.manager"
				name="manager"
				label="Line Manager"
				font="montserrat"
				placeholder="Enter your line manager"
				:options="data.managers"
				:invalid="v$.manager.$error" />
			<BaseSelect
				id="department"
				v-model="form.department"
				name="department"
				label="Department"
				font="montserrat"
				placeholder="Select your department"
				:options="data.departments"
				:invalid="v$.department.$error" />
			<BaseButton
				type="submit"
				variant="purple"
				:loading="requestStatus === 'pending'"
				:disabled="v$.$invalid || requestStatus === 'pending'"
				full
				center>
				Sign Up
			</BaseButton>
		</form>
	</div>
</template>

<style lang="scss" scoped>
.onboarding {
	gap: 3.2rem;

	&__form {
		gap: 3.2rem;
	}
}
</style>
