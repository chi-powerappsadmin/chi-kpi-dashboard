<script setup lang="ts"></script>

<template>
	<div id="__layout" class="auth">
		<TopBar />
		<div class="auth__wrapper flex items-center content-center">
			<div class="auth__content">
				<slot />
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
#__layout {
    height: 100dvh;
	background-color: white;
}

.auth {
	&__wrapper {
		min-height: calc(100dvh - 7.2rem);
		padding: 5rem 2rem;
	}

	&__content {
		width: 100%;
		border-radius: 24px;
		border: 1px solid $outline-stroke;
		background: $white;
		padding: 3.2rem 2rem;
		max-width: 51.5rem;
		margin: auto;

		@include breakpoint(md) {
			box-shadow: -1px 4px 67px 0px rgba(0, 0, 0, 0.25);
			padding: 3.2rem;
		}
	}
}
</style>
