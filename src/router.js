import Vue from 'vue';
import VueRouter from 'vue-router';
import MainView from "@/views/MainView";

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Main',
    component: MainView,
  }
];

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes,
});

export default router;
