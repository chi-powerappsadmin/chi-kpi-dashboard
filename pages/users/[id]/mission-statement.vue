<script setup lang="ts">
import type { Employee } from "~/types/models/Employee";

interface Props {
	employee: Employee;
}
defineProps<Props>();
</script>

<template>
	<div class="wrapper">
		<MissionStatement
			class="user-details"
			:employee-id="employee.id"
			/>
	</div>
</template>

<style lang="scss" scoped>
.wrapper {
	padding: 2rem 3.2rem;

	.user-details {
		background-color: $light-grey;
		padding: 1.6rem;
		border: 0.1rem solid $outline-stroke;
		border-radius: 1.2rem;
		max-width: 44.5rem;
	}
}
</style>
