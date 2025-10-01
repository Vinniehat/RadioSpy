import { defineStore } from "pinia";
import { api } from "../api";
import { io } from "socket.io-client";

export const useRecordingsStore = defineStore("recordings", {
    state: () => ({
        recordings: [],
        socket: null,
        currentTalkgroupId: null,
    }),
    actions: {
        async fetchRecordings(tgId) {
            this.currentTalkgroupId = tgId;
            const res = await api.get(`/talkgroups/${tgId}/recordings`);
            this.recordings = res.data;
        },
        connectSocket() {
            if (!this.socket) {
                this.socket = io(import.meta.env.VITE_SOCKET_URL);
                this.socket.on("new-recording", (data) => {
                    if (data.talkgroupId && this.currentTalkgroupId === data.talkgroupId) {
                        this.recordings.unshift(data);
                    }
                });
            }
        },
    },
});
