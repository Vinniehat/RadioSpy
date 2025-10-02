import { defineStore } from "pinia";
import axios from "axios";

export const useTalkgroupsStore = defineStore("talkgroups", {
    state: () => ({
        talkgroups: [],
        currentTalkgroupID: null,
    }),
    getters: {
        // Get all talkgroups for a specific system (from state)
        getTalkgroups: (state) => (systemID) => {
            return state.talkgroups.filter(tg => tg.systemID == systemID);
        },
        // Get a specific talkgroup by system and ID (from state)
        getTalkgroup: (state) => (systemID, talkgroupID) => {
            return state.talkgroups.find(tg => tg.systemID == systemID && tg.id == talkgroupID);
        },
    },
    actions: {
        // Fetch all talkgroups for a system (only if not already in state)
        async fetchTalkgroups(systemID) {
            const localTGs = this.getTalkgroups(systemID);
            if (localTGs.length > 0) return localTGs;

            const res = await axios.get(`${import.meta.env.VITE_API_URL}/systems/${systemID}/talkgroups`);
            const tgs = res.data.map(tg => ({ ...tg, systemID }));
            this.talkgroups.push(...tgs);
            return tgs;
        },

        // Get a talkgroup from state or fetch from server if missing
        async getOrFetchTalkgroup(systemID, talkgroupID) {
            let tg = this.getTalkgroup(systemID, talkgroupID);
            if (tg) return tg;

            const res = await axios.get(`${import.meta.env.VITE_API_URL}/systems/${systemID}/talkgroups/${talkgroupID}`);
            const newTG = { ...res.data, systemID };
            this.talkgroups.push(newTG);
            return newTG;
        }
    }
});
