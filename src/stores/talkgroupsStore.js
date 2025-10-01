import { defineStore } from "pinia";
import { api } from "../api";

export const useTalkgroupsStore = defineStore("talkgroups", {
    state: () => ({
        talkgroups: [],
    }),
    actions: {
        async fetchTalkgroups(systemId) {
            const res = await api.get(`/systems/${systemId}/talkgroups`);
            this.talkgroups = res.data;
        },
    },
});
