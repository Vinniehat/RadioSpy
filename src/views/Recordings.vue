<script setup>
import {onMounted, ref, nextTick, computed, watch} from "vue";
import {useSystemsStore} from "../stores/systemsStore";
import {useTalkgroupsStore} from "../stores/talkgroupsStore";
import {useRecordingsStore} from "../stores/recordingsStore";
import {useRoute} from "vue-router";
import { useSocket } from "../composables/useSocket";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import {useAppStore} from "@/stores/appStore.js";

const systemsStore = useSystemsStore();
const talkgroupsStore = useTalkgroupsStore();
const recordingsStore = useRecordingsStore();
const appStore = useAppStore();
const route = useRoute();
const currentSystem = ref(null);
const currentTalkgroup = ref(null);
const { socket, isConnected } = useSocket();

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

// --- Recordings ---
const recordings = computed(() =>
    recordingsStore.getRecordingsByTalkgroup(route.params.talkgroupID)
);

// re-apply volume when recordings list changes (pagination reload)
watch(recordings, () => {
  applyVolume();
});




// --- Transcriptions (no separate ref needed) ---
socket.on("transcription:complete", (data) => {
  // Find the recording in the store and update its transcription
  const rec = recordingsStore.recordings.find(r => r.id === data.recordingID);
  if (rec) rec.transcription = data.transcription;
});

// --- Request transcription manually ---
const requestTranscription = (rec) => {
  if (!rec.transcription) {
    rec.transcription = "Transcription in progress...";
    socket.emit("transcription:request", {
      recordingID: rec.id,
      folderPath: rec.folder_path,
      filename: rec.filename
    });
  }
};


onMounted(async () => {
  currentSystem.value = await systemsStore.getOrFetchSystem(route.params.systemID);
  currentTalkgroup.value = await talkgroupsStore.getOrFetchTalkgroup(
      route.params.talkgroupID
  );
  await recordingsStore.fetchRecordingsByTalkgroup(route.params.talkgroupID);
  appStore.setLoading(false);
  applyVolume();
});

</script>

<template>
  <div>
    <LoadingSpinner v-if="useAppStore().loading"/>
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

          <div class="mt-2 flex flex-col h-40 justify-between p-2 bg-[var(--panel)] rounded">
            <div class="text-[var(--text)] whitespace-pre-wrap break-words overflow-auto">
              {{ rec.transcription || "No transcription yet..." }}
            </div>
            <button
                class="px-2 py-1 bg-[var(--accent)] text-black rounded hover:bg-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="rec.transcription"
                @click="requestTranscription(rec)"
            >
              Transcribe
            </button>
          </div>

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
  </div>

</template>
