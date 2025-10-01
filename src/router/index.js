import { createRouter, createWebHistory } from "vue-router";
import Systems from "../views/Systems.vue";
import Talkgroups from "../views/Talkgroups.vue";
import Recordings from "../views/Recordings.vue";

const routes = [
  { path: "/", name: "Systems", component: Systems },
  { path: "/system/:id/talkgroups", name: "Talkgroups", component: Talkgroups },
  { path: "/talkgroup/:id/recordings", name: "Recordings", component: Recordings },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
