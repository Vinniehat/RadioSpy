import { defineStore } from "pinia";
import { api } from "../api";

export const useSystemsStore = defineStore("systems", {
    state: () => ({
        systems: [],
    }),
    actions: {
        async fetchSystems() {
            try {
                const res = await api.get("/systems");
                this.systems = res.data;
            } catch (err) {
                console.error("Failed to fetch systems:", err);
            }
        },
    },
});
