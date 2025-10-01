<template>
  <div>
    <h2>Talkgroups</h2>
    <ul>
      <li v-for="tg in talkgroupsStore.talkgroups" :key="tg.id">
        <router-link :to="`/talkgroup/${tg.id}/recordings`">{{ tg.name }}</router-link>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { useTalkgroupsStore } from "../stores/talkgroupsStore";

const route = useRoute();
const talkgroupsStore = useTalkgroupsStore();

onMounted(() => {
  talkgroupsStore.fetchTalkgroups(route.params.id);
});
</script>
