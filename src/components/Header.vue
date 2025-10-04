<template>
  <header class="p-4 border-b border-[var(--muted)] flex items-center justify-between">
    <h1
        class="text-2xl font-bold text-[var(--primary)] cursor-pointer hover:text-[var(--accent)] transition"
        @click="goHome"
    >
      RadioSpy
    </h1>

    <button
        @click="toggleDark"
        class="px-3 py-1 bg-[var(--primary)] text-[var(--bg)] rounded transition
         hover:bg-[var(--accent)] dark:hover:bg-[var(--primary-light)]"
    >
      Toggle Dark
    </button>

    <button
        v-if="!appStore.livePlaybackEnabled"
        class="px-3 py-1 bg-[var(--primary)] text-[var(--bg)] rounded transition
         hover:bg-[var(--accent)] dark:hover:bg-[var(--primary-light)]"
        @click="enableLivePlayback"
    >
      Start Live Playback
    </button>

    <span v-else>
      🔊 Live playback active
    </span>

  </header>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import { useAppStore } from '@/stores/appStore.js';

const router = useRouter();
const dark = ref(false);
const appStore = useAppStore();

// wrap store action in a method for template
const enableLivePlayback = () => {
  appStore.enableLivePlayback();
};

onMounted(() => {
  dark.value = document.documentElement.classList.contains('dark');
});

const goHome = () => {
  router.push('/systems');
};

const toggleDark = () => {
  dark.value = !dark.value;
  document.documentElement.classList.toggle('dark', dark.value);
};
</script>
