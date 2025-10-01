<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6 text-[var(--primary)]">Recordings</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div
          v-for="rec in recordingsStore.recordings"
          :key="rec.id"
          class="bg-[var(--panel)] border border-[var(--accent)] p-4 rounded-lg shadow
               hover:shadow-lg hover:scale-105 transition cursor-pointer"
      >
        <p class="text-[var(--text)] font-semibold text-lg">{{ rec.filename }}</p>
        <audio
            :src="`/recordings/${rec.id}/audio`"
            controls
            class="w-full mt-2"
        ></audio>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRecordingsStore } from '../stores/recordingsStore';
import { useRoute } from 'vue-router';
import { onMounted } from 'vue';

const recordingsStore = useRecordingsStore();
const route = useRoute();

onMounted(() => recordingsStore.fetchRecordings(route.params.id));
</script>
