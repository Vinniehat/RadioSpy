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
        async getOrFetchSystem(systemId) {
            let system = this.getSystemById(systemId);
            if (system) return system;

            const res = await axios.get(`${import.meta.env.VITE_API_URL}/systems/${systemId}`);
            this.systems.push(res.data);
            return res.data;
        },
    },
});
