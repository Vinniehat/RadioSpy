import { defineStore } from "pinia";
import axios from "axios";
import { useSystemsStore } from "./systemsStore";
import { useTalkgroupsStore } from "./talkgroupsStore";

export const useRecordingsStore = defineStore("recordings", {
    state: () => ({
        recordings: [],
        page: 1,
        totalPages: 1,
        limit: 10,
    }),
    getters: {
        getAllRecordings: (state) => {
            return state.recordings;
        },
        getRecordingByID: (state) => (recordingID) => {
            return state.recordings.find(r => r.id == recordingID);
        },
        getRecordingsByTalkgroup: (state) => (systemID, talkgroupID) => {
            return state.recordings.filter(r => r.systemID == systemID && r.talkgroupID == talkgroupID);
        }
    },
    actions: {
        async fetchRecordings() {
            // INOP
            // Will cause too many requests if not limited by system/talkgroup
            return [];
        },
        async fetchRecordingsByTalkgroup(systemID = systemsStore.currentSystemID, talkgroupID = talkgroupsStore.currentTalkgroupID, page = 1) {
            if (!systemID || !talkgroupID) return;

            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/systems/${systemID}/talkgroups/${talkgroupID}/recordings`,
                { params: { page, limit: this.limit } }
            );

            // Update state, override existing recordings for this talkgroup
            this.recordings = this.recordings.filter(r => !(r.systemID == systemID && r.talkgroupID == talkgroupID));
            const fetchedRecordings = res.data.recordings.map(r => ({ ...r, systemID, talkgroupID }));
            this.recordings.push(...fetchedRecordings);
            this.totalPages = res.data.totalPages;
            this.page = page;
            return this.getRecordingsByTalkgroup(systemID, talkgroupID);
        },
        async getOrFetchRecordingsByTalkgroup(systemID, talkgroupID) {
            let recordings = this.getRecordingsByTalkgroup(systemID, talkgroupID);
            if (recordings.length) return recordings;

            // If not found in state, fetch from server
            await this.fetchRecordingsByTalkgroup(systemID, talkgroupID);
            return this.getRecordingsByTalkgroup(systemID, talkgroupID);
        },
        async getOrFetchRecording(systemID, talkgroupID, recordingID) {
            let recording = this.getRecordingByID(recordingID);
            if (recording) return recording;

            // If not found in state, fetch recordings for the talkgroup and look again
            await this.fetchRecordingsByTalkgroup(systemID, talkgroupID);
            return this.getRecordingByID(recordingID);
        },
        async nextPage() {
            if (this.page < this.totalPages) {
                await this.fetchRecordings(this.page + 1);
            }
        },
        async prevPage() {
            if (this.page > 1) {
                await this.fetchRecordings(this.page - 1);
            }
        },
        getAudioUrl(recordingID) {
            const systemsStore = useSystemsStore();
            const talkgroupsStore = useTalkgroupsStore();

            // Check for null -> This prevents constructing invalid URLs
            if (!systemsStore.currentSystemID || !talkgroupsStore.currentTalkgroupID || !recordingID) return null;

            return `${import.meta.env.VITE_API_URL}/systems/${systemsStore.currentSystemID}/talkgroups/${talkgroupsStore.currentTalkgroupID}/recordings/${recordingID}/audio`;
        },
    },
});
