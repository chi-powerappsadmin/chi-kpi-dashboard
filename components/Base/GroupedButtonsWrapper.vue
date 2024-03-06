<script setup lang="ts"></script>

<template>
	<div class="group-buttons">
		<slot />
	</div>
</template>

<style lang="scss" scoped>
.group-buttons {
	width: 100%;
    display: flex;
	background-color: $sec-brand;
	padding: 0.3rem;
	border-radius: 0.4rem;
	:deep(button) {
        flex: 1;
		position: relative;
		height: 3.4rem;
		padding: 0.7rem 1.2rem;
		font-size: 1.2rem;
		font-weight: 700;
		font-family: Montserrat;
		color: transparentize(#fff, 0.5);
		display: inline-flex;
		justify-content: center;
		align-items: center;
        border-radius: 0.4rem;
		&:not(:first-of-type) {
			&::before {
				content: "";
				width: 0.1rem;
				height: 2.4rem;
				background-color: transparentize(#fff, 0.85);
				position: absolute;
				left: 0;
			}
		}

		&:hover,
		&:active,
		&.active {
			border-right-color: transparent;
			background-color: transparentize(#fff, 0.85);
			color: #fff;
            &::before {
              background-color: transparent;
            }
            +button {
                &::before {
                   background-color: transparent;
                }
            }
		}
	}
}
</style>
