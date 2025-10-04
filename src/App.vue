<template>
    <Header />
    <router-view />
</template>

<script setup>
import Header from './components/Header.vue';
import { useAppStore } from "@/stores/appStore.js";
import LoadingSpinner from "./components/LoadingSpinner.vue";

const appStore = useAppStore();
</script>

<style scoped>
/* Optional: smooth backdrop blur on some browsers */
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
}
</style>
