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
  <div>
    <h2>Recordings</h2>
    <ul>
      <li v-for="rec in recordingsStore.recordings" :key="rec.id">
        <p>{{ rec.filename }}</p>
        <!-- Use the dynamic URL -->
        <audio controls :src="`${audioBaseUrl}/recordings/${rec.id}/audio`"></audio>
      </li>
    </ul>
  </div>
</template>
