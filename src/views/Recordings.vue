<script setup>
import {onMounted, ref, nextTick, computed, watch} from "vue";
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
    recordingsStore.getRecordingsByTalkgroup(route.params.talkgroupID)
);

// re-apply volume when recordings list changes (pagination reload)
watch(recordings, () => {
  applyVolume();
});

onMounted(async () => {
  currentSystem.value = await systemsStore.getOrFetchSystem(route.params.systemID);
  currentTalkgroup.value = await talkgroupsStore.getOrFetchTalkgroup(
      route.params.talkgroupID
  );
  await recordingsStore.fetchRecordingsByTalkgroup(route.params.talkgroupID);
  applyVolume();
});

// Example fake transcriptions
const fakeTranscriptions = [
  // Dispatcher-style
  "Dispatch to Unit 14: We have multiple calls reporting a possible altercation outside the Greenview Mall, witnesses say three individuals involved, one possibly armed with a bat. Respond with caution.",
  "Attention all units: Severe weather moving into the north sector. Expect heavy rain, reduced visibility, and possible flooding along Route 18. Use caution when responding to calls.",
  "Unit 22, report of a vehicle collision at the intersection of Oak and 5th. Caller states airbags deployed, two vehicles blocking traffic, unknown injuries at this time. EMS notified and en route.",
  "Car 9, respond to a noise complaint at Riverside Apartments, building 4. Caller reports ongoing loud music and possible underage drinking. Backup may be required due to large crowd size.",
  "Control to Medic 3: We’ve got a medical emergency at Fairview Park, individual collapsed during a sporting event. Bystanders are performing CPR. Estimated time of arrival requested.",
  "Air Unit 5 to dispatch: Visual confirmation of a suspect on foot near the railway yard, moving southbound between freight cars. Requesting ground units to set up perimeter at Maple and 12th.",
  "Dispatch: Be advised, traffic lights are out along Main Street corridor due to power outage. Multiple calls of near-misses at intersections. Units please monitor for accidents until utilities arrive.",
  "Attention all units: BOLO for a silver SUV with front-end damage, last seen heading eastbound on I-90. Vehicle may be involved in earlier hit-and-run near Downtown district.",
  "Engine 4, reports of smoke visible at the 1200 block of Pine Avenue. Caller indicates strong smell of gas in the area. Gas company has been contacted, proceed with extreme caution.",

  // Officer-style
  "Unit 14: Copy that, en route to Greenview Mall. ETA 4 minutes.",
  "Unit 22: Arrived at Oak and 5th, two vehicles involved, requesting tow and EMS priority.",
  "Car 9: Copy noise complaint at Riverside Apartments, will advise if additional units needed.",
  "Unit 7: Situation at Elmwood store under control, suspect in custody, no further backup required.",
  "Medic 3: Acknowledged, en route to Fairview Park, approximately 6 minutes out.",
  "Air Unit 5: Suspect still in sight, moving toward the industrial park. Ground units advised.",
  "Unit 4: Copy power outage along Main Street, directing traffic at 3rd and Main until utilities arrive.",
  "Unit 12: BOLO received, monitoring eastbound I-90 traffic for silver SUV.",
  "Engine 4: Arrived on Pine Avenue, smoke confirmed, staging until gas company on scene.",

    "RECORDING NOT TRANSCRIBED..."
];


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
        <p class="text-[var(--text)] italic">
          {{
            fakeTranscriptions[Math.floor(Math.random() * fakeTranscriptions.length)]
          }}
        </p>
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

