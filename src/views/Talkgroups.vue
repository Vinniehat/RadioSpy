<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6 text-[var(--primary)]">Talkgroups</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-6">
      <div
          v-for="tg in talkgroupsStore.talkgroups"
          :key="tg.id"
          :data-tg-id="tg.id"
          class="bg-[var(--panel)] border border-[var(--accent)] p-4 rounded-lg shadow
               hover:shadow-lg hover:scale-105 transition cursor-pointer"
          @click="selectTalkgroup(tg.id)"
      >
        <p class="text-[var(--text)] font-semibold text-lg">{{ tg.name }}</p>
        <div class="flex justify-between text-[var(--muted)] text-sm mt-1">
          <span>Last Heard: {{ talkgroupsStore.getLastHeardText(tg.id) }}</span>
          <span>ID: {{ tg.id }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTalkgroupsStore } from '../stores/talkgroupsStore';
import { useRouter, useRoute } from 'vue-router';
import { onMounted } from 'vue';
import { useSocket } from "@/composables/useSocket.js";

const talkgroupsStore = useTalkgroupsStore();
const router = useRouter();
const route = useRoute();

const selectTalkgroup = (id) => {
  router.push(`/systems/${route.params.systemID}/talkgroups/${id}/recordings`);
};

onMounted(() => talkgroupsStore.fetchTalkgroupsBySystem(route.params.systemID));

useSocket().socket.on("recording:new", (data) => {
  let talkgroup = talkgroupsStore.talkgroups.find(tg => tg.id === data.talkgroup_id);
  talkgroupsStore.setLastHeard(data.talkgroup_id, data.created_at);
  if (talkgroup) {
    const tgElement = document.querySelector(`[data-tg-id="${data.talkgroup_id}"]`);
    if (tgElement) {
      // restart animation if already applied
      tgElement.classList.remove("flash-expand");
      void tgElement.offsetWidth; // force reflow

      tgElement.classList.add("flash-expand");
      tgElement.style.backgroundColor = talkgroup.color ?? 'rgba(17, 183, 255, 0.5)';

      tgElement.addEventListener(
          "animationend",
          () => {
            tgElement.classList.remove("flash-expand");
            tgElement.style.backgroundColor = 'transparent';
          },
          { once: true }
      );
    }
  }
});
</script>

<style scoped>
@keyframes flashExpand {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.flash-expand {
  animation: flashExpand 2s ease-out;
}
</style>
