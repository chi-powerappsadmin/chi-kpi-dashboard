<script setup lang="ts">
interface Props {
	title: string;
	showDelete?: boolean;
}

const { showDelete = true } = defineProps<Props>();
</script>

<template>
	<section class="leaderboard-table flex flex-column">
		<div class="leaderboard-table__header flex items-center">
			<p class="leaderboard-table__title body-small weight-500">{{ title }}</p>
		</div>
		<div class="leaderboard-table__table">
			<slot />
		</div>
	</section>
</template>

<style lang="scss" scoped>
.leaderboard-table {
	border-radius: 1.2rem;
	border: 0.1rem solid #e6e6e6;
	background: #fcfcfc;
	padding: 1.6rem;
	gap: 1.2rem;

	&__header {
		gap: 1.2rem;
		flex-wrap: wrap;
		justify-content: space-between;
	}

	&__title {
		color: $text;
	}

	&__actions {
		flex-wrap: wrap;
		gap: 1.2rem;
	}

	input {
		border-radius: 0.8rem;
		border: 1px solid $outline;
		background: #fff;
		padding: 0.4rem 1.7rem;
		color: #000;

		&::placeholder {
			color: #000;
		}
	}
}
</style>
