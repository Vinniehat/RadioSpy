<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6 text-[var(--primary)]">Talkgroups</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div
          v-for="tg in talkgroupsStore.talkgroups"
          :key="tg.id"
          class="bg-[var(--panel)] border border-[var(--accent)] p-4 rounded-lg shadow
               hover:shadow-lg hover:scale-105 transition cursor-pointer"
          @click="selectTalkgroup(tg.id)"
      >
        <p class="text-[var(--text)] font-semibold text-lg">{{ tg.name }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTalkgroupsStore } from '../stores/talkgroupsStore';
import { useRouter, useRoute } from 'vue-router';
import { onMounted } from 'vue';

const talkgroupsStore = useTalkgroupsStore();
const router = useRouter();
const route = useRoute();

const selectTalkgroup = (id) => {
  router.push(`/talkgroups/${id}/recordings`);
};

onMounted(() => talkgroupsStore.fetchTalkgroups(route.params.id));
</script>
