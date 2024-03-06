<script lang="ts" setup>
const nuxtApp = useNuxtApp();
const isLoading = ref(false);
nuxtApp.hook("page:start", () => {
  isLoading.value = true;
});
nuxtApp.hook("page:finish", () => {
  isLoading.value = false;
});
</script>
<template>
	<NuxtLayout>
		<BaseLoadingModal v-if="isLoading"  text="loading..." />
		<!-- <NuxtLoadingIndicator /> -->
		<Toasts />
		<NuxtPage />
	</NuxtLayout>
</template>
