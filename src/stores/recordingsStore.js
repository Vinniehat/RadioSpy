import { defineStore } from "pinia";
import axios from "axios";
import { io } from "socket.io-client";

export const useRecordingsStore = defineStore("recordings", {
    state: () => ({
        recordings: [],
        currentSystemID: null,
        currentTalkgroupID: null,
        page: 1,
        totalPages: 1,
        limit: 10,
    }),
    actions: {
        async fetchRecordings(systemID, talkgroupID, page = 1) {
            this.currentSystemID = systemID;
            this.currentTalkgroupID = talkgroupID;
            this.page = page;

            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/systems/${systemID}/talkgroups/${talkgroupID}/recordings`,
                { params: { page: this.page, limit: this.limit } }
            );

            this.recordings = res.data.recordings;
            this.totalPages = res.data.totalPages;
        },
        async nextPage() {
            if (this.page < this.totalPages) {
                await this.fetchRecordings(
                    this.currentSystemID,
                    this.currentTalkgroupID,
                    this.page + 1
                );
            }
        },
        async prevPage() {
            if (this.page > 1) {
                await this.fetchRecordings(
                    this.currentSystemID,
                    this.currentTalkgroupID,
                    this.page - 1
                );
            }
        },
        getAudioUrl(recordingID) {
            return `${import.meta.env.VITE_API_URL}/systems/${this.currentSystemID}/talkgroups/${this.currentTalkgroupID}/recordings/${recordingID}/audio`;
        },
    },
});
