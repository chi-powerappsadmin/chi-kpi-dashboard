<script setup lang='ts'>
</script>

<template>
    <svg width="48px" height="48px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg" class="loader">
        <circle class="path" fill="transparent" stroke-width="5" cx="33" cy="33" r="30" stroke="url(#gradient)" />
        <linearGradient id="gradient">
            <stop offset="20%" stop-color="#002C72" stop-opacity="1" />
            <stop offset="40%" stop-color="#002C72" stop-opacity="0.5" />
            <stop offset="80%" stop-color="#002C72" stop-opacity="0.25" />
        </linearGradient>
    </svg>
</template>

<style lang="scss" scoped>
.loader {
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% {
            rotate: 0deg;
        }

        100% {
            rotate: 360deg;
        }
    }
}
</style>