import { defineStore } from "pinia";
import axios from "axios";

export const useTalkgroupsStore = defineStore("talkgroups", {
    state: () => ({
        talkgroups: [],
    }),
    actions: {
        async fetchTalkgroups(systemID) {
            const localTGs = this.talkgroups.filter(tg => tg.systemID == systemID);
            if (localTGs.length > 0) return localTGs;

            const res = await axios.get(`${import.meta.env.VITE_API_URL}/systems/${systemID}/talkgroups`);
            const tgs = res.data.map(tg => ({ ...tg, systemID }));
            this.talkgroups.push(...tgs);
            return tgs;
        },
        async getTalkgroup(systemID, talkgroupID) {
            let tg = this.talkgroups.find(t => t.id == talkgroupID && t.systemID == systemID);
            if (tg) return tg;

            const res = await axios.get(`${import.meta.env.VITE_API_URL}/systems/${systemID}/talkgroups/${talkgroupID}`);
            const newTG = { ...res.data, systemID };
            this.talkgroups.push(newTG);
            return newTG;
        },
    },
});
