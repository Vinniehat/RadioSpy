import { defineStore } from "pinia";
import { api } from "../api";
import { io } from "socket.io-client";

export const useRecordingsStore = defineStore("recordings", {
    state: () => ({
        recordings: [],
        currentTalkgroupId: null,
        page: 1,
        totalPages: 1,
        limit: 10,
    }),
    actions: {
        async fetchRecordings(tgId, page = 1) {
            this.currentTalkgroupId = tgId;
            this.page = page;

            const res = await api.get(`/talkgroups/${tgId}/recordings`, {
                params: { page: this.page, limit: this.limit },
            });

            this.recordings = res.data.recordings;
            this.totalPages = res.data.totalPages;
        },
        async nextPage() {
            if (this.page < this.totalPages) {
                await this.fetchRecordings(this.currentTalkgroupId, this.page + 1);
            }
        },
        async prevPage() {
            if (this.page > 1) {
                await this.fetchRecordings(this.currentTalkgroupId, this.page - 1);
            }
        },
    },
});
