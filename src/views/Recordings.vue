<script setup>
import {onMounted, ref, nextTick, computed} from "vue";
import {useSystemsStore} from "../stores/systemsStore";
import {useTalkgroupsStore} from "../stores/talkgroupsStore";
import {useRecordingsStore} from "../stores/recordingsStore";
import {useRoute} from "vue-router";

const systemsStore = useSystemsStore();
const talkgroupsStore = useTalkgroupsStore();
const recordingsStore = useRecordingsStore();
const route = useRoute();

const currentSystem = ref(null);
const currentTalkgroup = ref(null);

// --- Volume ---
const volume = ref(parseFloat(localStorage.getItem("defaultVolume")) || 0.5);

const applyVolume = () => {
  nextTick(() => {
    const audioElements = document.querySelectorAll("audio");
    audioElements.forEach((audio) => {
      audio.volume = volume.value;
      audio.onvolumechange = () => {
        localStorage.setItem("defaultVolume", audio.volume);
        volume.value = audio.volume;
      };
    });
  });
};

// recordings tied to current system/talkgroup
const recordings = computed(() =>
    recordingsStore.getRecordingsByTalkgroup(
        route.params.talkgroupID
    )
);

onMounted(async () => {
  currentSystem.value = await systemsStore.getOrFetchSystem(route.params.systemID);
  currentTalkgroup.value = await talkgroupsStore.getOrFetchTalkgroup(
      route.params.talkgroupID
  );
  await recordingsStore.fetchRecordingsByTalkgroup(
      route.params.talkgroupID
  );
  applyVolume();
});
</script>


<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6 text-[var(--primary)]">
      Recordings for {{ currentSystem?.name }} > {{ currentTalkgroup?.name }}
    </h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div
          v-for="rec in recordings"
          :key="rec.id"
          class="bg-[var(--panel)] border border-[var(--accent)] p-4 rounded-lg shadow
               hover:shadow-lg hover:scale-105 transition cursor-pointer"
      >
        <p class="text-[var(--text)] font-semibold text-lg">{{ rec.filename }}</p>
        <audio
            v-if="recordingsStore.getAudioUrl(rec.id)"
            :src="recordingsStore.getAudioUrl(rec.id)"
            controls
            preload="metadata"
            class="w-full mt-2"
        ></audio>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex justify-center mt-6 space-x-4">
      <button
          class="px-4 py-2 bg-[var(--panel)] rounded hover:bg-gray-700"
          @click="recordingsStore.prevPage(route.params.talkgroupID)"
          :disabled="recordingsStore.page === 1"
      >
        Previous
      </button>

      <span class="text-[var(--text)]">
        Page {{ recordingsStore.page }} / {{ recordingsStore.totalPages }}
      </span>

      <button
          class="px-4 py-2 bg-[var(--panel)] rounded hover:bg-gray-700"
          @click="recordingsStore.nextPage(route.params.talkgroupID)"
          :disabled="recordingsStore.page === recordingsStore.totalPages"
      >
        Next
      </button>
    </div>
  </div>
</template>

