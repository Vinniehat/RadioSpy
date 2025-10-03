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
        // Get a specific talkgroup ID (from state)
        getTalkgroup: (state) => (talkgroupID) => {
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

        async fetchTalkgroup(talkgroupID) {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/talkgroups/${talkgroupID}`);
            const idx = this.talkgroups.findIndex(tg => tg.id === res.data.id);
            if (idx >= 0) this.talkgroups[idx] = res.data;
            else this.talkgroups.push(res.data);
            return res.data;
        },

        async fetchTalkgroupsBySystem(systemID) {

            const res = await axios.get(`${import.meta.env.VITE_API_URL}/systems/${systemID}/talkgroups`);
            // Remove existing talkgroups for this system
            this.talkgroups = this.talkgroups.filter(tg => tg.system_id != systemID);
            // Add fetched talkgroups
            const fetchedTGs = res.data.map(tg => ({ ...tg, systemID }));
            this.talkgroups.push(...fetchedTGs);


            return this.getTalkgroupsBySystem(systemID);
        },
        async getOrFetchTalkgroupsBySystem(systemID) {
            let tgs = this.getTalkgroupsBySystem(systemID);
            if (tgs.length) return tgs;
            return await this.fetchTalkgroupsBySystem(systemID);
        },

        // Get a talkgroup from state or fetch from server if missing
        async getOrFetchTalkgroup(talkgroupID) {
            let tg = this.talkgroups.find(tg => tg.id === talkgroupID);
            if (tg) return tg;
            return await this.fetchTalkgroup(talkgroupID);
        }
    }
});
