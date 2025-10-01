<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6 text-[var(--primary)]">Systems</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div
          v-for="system in systemsStore.systems"
          :key="system.id"
          class="bg-[var(--panel)] p-4 rounded-lg shadow hover:shadow-lg hover:scale-105 transition cursor-pointer"
          @click="selectSystem(system.id)"
      >
        <p class="text-[var(--text)] font-semibold text-lg">{{ system.name }}</p>
        <p class="text-[var(--muted)] text-sm mt-1">
          {{ system.talkgroupCount ?? '—' }} talkgroups
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSystemsStore } from '../stores/systemsStore';
import { useRouter } from 'vue-router';

const systemsStore = useSystemsStore();
const router = useRouter();

systemsStore.fetchSystems();

const selectSystem = (id) => {
  router.push(`/systems/${id}/talkgroups`);
};
</script>
