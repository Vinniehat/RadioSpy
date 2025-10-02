import { defineStore } from "pinia";
import axios from "axios";

export const useSystemsStore = defineStore("systems", {
    state: () => ({
        systems: [],
    }),
    actions: {
        async fetchSystems() {
            if (this.systems.length > 0) return;
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/systems`);
            this.systems = res.data;
        },
        async getSystem(systemId) {
            let system = this.systems.find(s => s.id == systemId);
            if (system) return system;

            const res = await axios.get(`${import.meta.env.VITE_API_URL}/systems/${systemId}`);
            this.systems.push(res.data);
            return res.data;
        },
    },
});
