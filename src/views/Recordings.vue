<script setup>
import { useRecordingsStore } from '../stores/recordingsStore';
import { useRoute } from 'vue-router';
import { onMounted } from 'vue';

const recordingsStore = useRecordingsStore();
const route = useRoute();

// Grab systemID and talkgroupID from route params
const systemID = route.params.systemID;
const talkgroupID = route.params.talkgroupID;

// Fetch recordings on mount
onMounted(() => {
  recordingsStore.fetchRecordings(systemID, talkgroupID);
});

// Pagination handlers
const nextPage = () => recordingsStore.nextPage();
const prevPage = () => recordingsStore.prevPage();
</script>

<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6 text-[var(--primary)]">
      Recordings for TG {{ talkgroupID }}
    </h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div
          v-for="rec in recordingsStore.recordings"
          :key="rec.id"
          class="bg-[var(--panel)] border border-[var(--accent)] p-4 rounded-lg shadow hover:shadow-lg hover:scale-105 transition cursor-pointer"
      >
        <p class="text-[var(--text)] font-semibold text-lg">{{ rec.filename }}</p>
        <audio :src="recordingsStore.getAudioUrl(rec.id)" controls class="w-full mt-2"></audio>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex justify-center mt-6 space-x-4">
      <button
          class="px-4 py-2 bg-[var(--panel)] rounded hover:bg-gray-700"
          @click="prevPage"
          :disabled="recordingsStore.page === 1"
      >
        Previous
      </button>

      <span class="text-[var(--text)]">
        Page {{ recordingsStore.page }} / {{ recordingsStore.totalPages }}
      </span>

      <button
          class="px-4 py-2 bg-[var(--panel)] rounded hover:bg-gray-700"
          @click="nextPage"
          :disabled="recordingsStore.page === recordingsStore.totalPages"
      >
        Next
      </button>
    </div>
  </div>
</template>
