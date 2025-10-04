<script setup>
import {onMounted, ref, nextTick, computed, watch} from "vue";
import {useSystemsStore} from "../stores/systemsStore";
import {useTalkgroupsStore} from "../stores/talkgroupsStore";
import {useRecordingsStore} from "../stores/recordingsStore";
import {useRoute} from "vue-router";
import {useSocket} from "../composables/useSocket";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import {useAppStore} from "@/stores/appStore.js";

const systemsStore = useSystemsStore();
const talkgroupsStore = useTalkgroupsStore();
const recordingsStore = useRecordingsStore();
const appStore = useAppStore();
const route = useRoute();
const currentSystem = ref(null);
const currentTalkgroup = ref(null);
const {socket, isConnected} = useSocket();

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

// --- Queue ---
const recordingQueue = ref([]);
let isPlaying = ref(false);

// --- Computed recordings for this talkgroup ---
const recordings = computed(() =>
    recordingsStore.getRecordingsByTalkgroup(route.params.talkgroupID)
);

// re-apply volume when recordings list changes
watch(recordings, () => applyVolume());

// --- Play queue ---
async function playNextInQueue() {
  if (recordingQueue.value.length === 0) {
    isPlaying.value = false;
    return;
  }

  isPlaying.value = true;
  const next = recordingQueue.value.shift();

  // Wait until Vue renders the <audio> element
  await nextTick();

  if (!next.audioRef) {
    console.warn("Audio element not ready for recording:", next.id);
    // retry in 200ms
    setTimeout(playNextInQueue, 200);
    return;
  }

  try {
    await next.audioRef.play();
  } catch (err) {
    console.log("Auto-play failed:", err);
  }

  next.audioRef.onended = () => playNextInQueue();
}

// --- Socket listeners ---
socket.on("recording:new", async (data) => {
  // Ignore recordings not for this system/talkgroup
  if (+data.system_id !== +route.params.systemID || +data.talkgroup_id !== +route.params.talkgroupID) return;

  // Fetch and add to store
  const rec = await recordingsStore.getOrFetchRecording(data.id, data.talkgroup_id);

  // Only queue for playback if site-wide live playback is enabled
  if (appStore.livePlaybackEnabled && !recordingQueue.value.some(r => r.id === rec.id)) {
    recordingQueue.value.push(rec);

    // Start playback if nothing is playing
    if (!isPlaying.value) playNextInQueue();
  }

  applyVolume();
});


// --- Transcriptions ---
socket.on("transcription:complete", (data) => {
  const rec = recordingsStore.recordings.find(r => r.id === data.recordingID);
  if (rec) rec.transcription = data.transcription;
});

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

// --- On mounted ---
onMounted(async () => {
  currentSystem.value = await systemsStore.getOrFetchSystem(route.params.systemID);
  currentTalkgroup.value = await talkgroupsStore.getOrFetchTalkgroup(route.params.talkgroupID);
  await recordingsStore.fetchRecordingsByTalkgroup(route.params.talkgroupID);

  // Auto-start playback if live playback is enabled
  if (appStore.livePlaybackEnabled && recordingQueue.value.length > 0 && !isPlaying.value) {
    playNextInQueue();
  }

  appStore.setLoading(false);
  applyVolume();
});


</script>


<template>
  <div>
    <LoadingSpinner v-if="useAppStore().loading"/>
    <div class="p-6">
      <h1 class="text-3xl font-bold mb-6 text-[var(--primary)] flex items-center space-x-2">
        <span>Recordings for {{ currentSystem?.name }} > {{ currentTalkgroup?.name }}</span>
        <span class="w-5 h-5 rounded-full bg-red-500 animate-pulse-full-opacity flex-shrink-0"></span>
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
              :ref="el => rec.audioRef = el"
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

<style scoped>

@keyframes pulse-full-opacity {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.animate-pulse-full-opacity {
  animation: pulse-full-opacity 3s infinite;
}
</style>