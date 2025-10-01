import { createRouter, createWebHistory } from "vue-router";
import Systems from "../views/Systems.vue";
import Talkgroups from "../views/Talkgroups.vue";
import Recordings from "../views/Recordings.vue";

const routes = [
  { path: '/', redirect: '/systems' },
  { path: '/systems', component: Systems },
  { path: '/systems/:id/talkgroups', component: Talkgroups },
  { path: '/talkgroups/:id/recordings', component: Recordings },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
