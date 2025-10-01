<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6 text-[var(--primary)]">
      {{ systemName }}
    </h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <div
          v-for="tg in talkgroupsStore.talkgroups"
          :key="tg.id"
          class="bg-[var(--panel)] p-4 rounded-lg shadow hover:shadow-lg hover:scale-105 transition cursor-pointer"
          @click="selectTalkgroup(tg.id)"
      >
        <p class="text-[var(--text)] font-semibold text-lg">{{ tg.name }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTalkgroupsStore } from '../stores/talkgroupsStore';
import { useRoute, useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';

const talkgroupsStore = useTalkgroupsStore();
const route = useRoute();
const router = useRouter();

const systemId = route.params.id;
const systemName = ref('');

onMounted(async () => {
  await talkgroupsStore.fetchTalkgroups(systemId);

  // Optionally get the system name from another store
  systemName.value = talkgroupsStore.systemsStore?.systems?.find(s => s.id == systemId)?.name || 'System';
});

const selectTalkgroup = (tgId) => {
  router.push(`/talkgroups/${tgId}/recordings`);
};
</script>
