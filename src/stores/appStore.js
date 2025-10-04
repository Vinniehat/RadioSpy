// stores/appStore.js
import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
    state: () => ({
        loading: true,
        livePlaybackEnabled: false,
    }),
    actions: {
        setLoading(value) {
            this.loading = value;
        },
        toggleLoading() {
            this.loading = !this.loading;
        },
        enableLivePlayback() {
            this.livePlaybackEnabled = true;
            localStorage.setItem("livePlaybackEnabled", "true");
        },
        disableLivePlayback() {
            this.livePlaybackEnabled = false;
            localStorage.setItem("livePlaybackEnabled", "false");
        },
        restoreLivePlayback() {
            const stored = localStorage.getItem("livePlaybackEnabled");
            if (stored === "true") this.livePlaybackEnabled = true;
        }
    }
});
