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
    actions: {
        async fetchRecordings(systemID = systemsStore.currentSystemID, talkgroupID = talkgroupsStore.currentTalkgroupID, page = 1) {
            if (!systemID || !talkgroupID) return;

            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/systems/${systemID}/talkgroups/${talkgroupID}/recordings`,
                { params: { page, limit: this.limit } }
            );

            this.recordings = res.data.recordings;
            this.totalPages = res.data.totalPages;
            this.page = page;
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

            return `${import.meta.env.VITE_API_URL}/systems/${systemsStore.currentSystemID}/talkgroups/${talkgroupsStore.currentTalkgroupID}/recordings/${recordingID}/audio`;
        },
    },
});
