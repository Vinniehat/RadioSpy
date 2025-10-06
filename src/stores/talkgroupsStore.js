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
        getLastHeardISO: (state) => (talkgroupID) => {
            const tg = state.talkgroups.find(tg => tg.id == talkgroupID);
            return tg ? tg.lastHeard : null;
        },
        getLastHeardText : (state) => (talkgroupID) => {
            // Returns a human-readable "time ago" string for the lastHeard timestamp
            const tg = state.talkgroups.find(tg => tg.id == talkgroupID);
            if (!tg || !tg.last_heard) return "Never";
            const last_heard = new Date(tg.last_heard);
            const now = new Date();
            const diffMs = now - last_heard;
            const diffMins = Math.floor(diffMs / 60000);
            if (diffMins < 1) return "Just now";
            if (diffMins < 60) return `${diffMins} minute(s) ago`;
            const diffHours = Math.floor(diffMins / 60);
            if (diffHours < 24) return `${diffHours} hour(s) ago`;
            const diffDays = Math.floor(diffHours / 24);
            return `${diffDays} day(s) ago`;
        }
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
        },
        async setLastHeard(talkgroupID, last_heard = new Date().toISOString()) {
            const tg = this.talkgroups.find(tg => tg.id === talkgroupID);
            if (tg) tg.last_heard = last_heard;
        }
    }
});
