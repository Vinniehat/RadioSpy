// stores/appStore.js
import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
    state: () => ({
        loading: true,
    }),
    actions: {
        setLoading(value) {
            this.loading = value;
        },
        toggleLoading() {
            this.loading = !this.loading;
        }
    }
});
