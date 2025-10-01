<script setup>
import { ref, onMounted } from "vue";
import { useRecordingsStore } from "../stores/recordingsStore";

const recordingsStore = useRecordingsStore();
const audioBaseUrl = import.meta.env.VITE_API_BASE; // your dynamic API URL

// Suppose the talkgroup ID comes from the route
import { useRoute } from "vue-router";
const route = useRoute();
const talkgroupId = route.params.id;

onMounted(() => {
  recordingsStore.fetchRecordings(talkgroupId);
  recordingsStore.connectSocket();
});
</script>

<template>
  <div class="p-4 space-y-4">
    <h1 class="text-3xl font-bold text-primary">RadioSpy</h1>

    <ul class="space-y-2">
      <li v-for="rec in recordingsStore.recordings" :key="rec.id"
          class="p-2 border rounded-md shadow hover:shadow-lg transition">
        <p class="font-medium">{{ rec.filename }}</p>
        <audio controls class="w-full mt-2"
               :src="`${audioBaseUrl}/recordings/${rec.id}/audio`"></audio>
      </li>
    </ul>
  </div>

</template>
