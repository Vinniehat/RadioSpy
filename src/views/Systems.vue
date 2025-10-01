<template>
  <div>
    <h2>Systems</h2>
    <ul>
      <li v-for="s in systemsStore.systems" :key="s.id">
        <router-link :to="`/system/${s.id}/talkgroups`">{{ s.name }}</router-link>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useSystemsStore } from "../stores/systemsStore";

const systemsStore = useSystemsStore();

onMounted(() => {
  systemsStore.fetchSystems();
});
</script>
