<script setup>
import { onMounted, ref } from "vue";
import { useSystemsStore } from "../stores/systemsStore";
import { useTalkgroupsStore } from "../stores/talkgroupsStore";
import { useRecordingsStore } from "../stores/recordingsStore";
import { useRoute } from "vue-router";

const systemsStore = useSystemsStore();
const talkgroupsStore = useTalkgroupsStore();
const recordingsStore = useRecordingsStore();
const route = useRoute();

// talkgroupsStore.setCurrentTalkgroupID(route.params.talkgroupID);

const currentSystem = ref(null);
const currentTalkgroup = ref(null);

// Fetch system and recordings
onMounted(async () => {
  currentSystem.value = await systemsStore.getOrFetchSystem(route.params.systemID);
  currentTalkgroup.value = await talkgroupsStore.getOrFetchTalkgroup(route.params.systemID, route.params.talkgroupID);
  await recordingsStore.fetchRecordings(route.params.systemID, route.params.talkgroupID);
});
</script>

<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6 text-[var(--primary)]">
      Recordings for {{ currentSystem?.name }} / {{ currentTalkgroup?.name }}
    </h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div
          v-for="rec in recordingsStore.recordings"
          :key="rec.id"
          class="bg-[var(--panel)] border border-[var(--accent)] p-4 rounded-lg shadow
               hover:shadow-lg hover:scale-105 transition cursor-pointer"
      >
        <p class="text-[var(--text)] font-semibold text-lg">{{ rec.filename }}</p>
        <audio
            :src="recordingsStore.getAudioUrl(rec.id)"
            controls
            class="w-full mt-2"
        ></audio>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex justify-center mt-6 space-x-4">
      <button
          class="px-4 py-2 bg-[var(--panel)] rounded hover:bg-gray-700"
          @click="recordingsStore.prevPage"
          :disabled="recordingsStore.page === 1"
      >
        Previous
      </button>

      <span class="text-[var(--text)]">
        Page {{ recordingsStore.page }} / {{ recordingsStore.totalPages }}
      </span>

      <button
          class="px-4 py-2 bg-[var(--panel)] rounded hover:bg-gray-700"
          @click="recordingsStore.nextPage"
          :disabled="recordingsStore.page === recordingsStore.totalPages"
      >
        Next
      </button>
    </div>
  </div>
</template>
