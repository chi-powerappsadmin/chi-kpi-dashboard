<script setup lang='ts'>
import logo from '@/assets/images/logo.png';

</script>

<template>
  <img :src="logo" :class="$style.logo" />
</template>

<style lang="scss" module>
    .logo {
        height: 3.2rem;
    }
</style>