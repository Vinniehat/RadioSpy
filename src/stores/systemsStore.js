import { defineStore } from 'pinia';
import axios from 'axios';

export const useSystemsStore = defineStore('systems', {
    state: () => ({
        systems: [],
        currentSystemID: null,
    }),
    getters: {
        currentSystem(state) {
            return state.systems.find(s => s.id === state.currentSystemID) || null;
        },
        getSystemById: (state) => {
            return (id) => state.systems.find(s => s.id === id) || null;
        },
    },
    actions: {
        async fetchSystems() {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/systems`);
            this.systems = res.data;
        },
        async fetchSystemById(systemId) {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/systems/${systemId}`);
            // upsert instead of push blindly
            const idx = this.systems.findIndex(s => s.id === res.data.id);
            if (idx >= 0) this.systems[idx] = res.data;
            else this.systems.push(res.data);
            return res.data;
        },
        async getOrFetchSystem(systemId) {
            let system = this.getSystemById(systemId);
            if (system) return system;

            return await this.fetchSystemById(systemId);
        },
    },
});
