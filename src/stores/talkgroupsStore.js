import { defineStore } from "pinia";
import axios from "axios";

export const useTalkgroupsStore = defineStore("talkgroups", {
    state: () => ({
        talkgroups: [],
        currentTalkgroupID: null,
    }),
    getters: {
        // Get all talkgroups for a specific system (from state)
        getAllTalkgroups: (state) => {
            return state.talkgroups;
        },
        getTalkgroupsBySystem: (state) => (systemID) => {
            return state.talkgroups.filter(tg => tg.systemID == systemID);
        },
        // Get a specific talkgroup by system and ID (from state)
        getTalkgroup: (state) => (systemID, talkgroupID) => {
            return state.talkgroups.find(tg => tg.systemID == systemID && tg.id == talkgroupID);
        },
    },
    actions: {
        // Fetch all talkgroups for a system (only if not already in state)
        async fetchTalkgroups() {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/talkgroups`);
            this.talkgroups = res.data;
            return this.talkgroups;
        },

        async fetchTalkgroupsBySystem(systemID) {

            const res = await axios.get(`${import.meta.env.VITE_API_URL}/systems/${systemID}/talkgroups`);
            // Update state, avoiding duplicates
            const existingIDs = new Set(this.talkgroups.map(tg => `${tg.systemID}-${tg.id}`));
            const newTGs = res.data
                .filter(tg => !existingIDs.has(`${systemID}-${tg.id}`))
                .map(tg => ({ ...tg, systemID }));
            this.talkgroups.push(...newTGs);
            return this.getTalkgroupsBySystem(systemID);
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
