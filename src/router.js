import Vue from 'vue';
import VueRouter from 'vue-router';
import MainView from "@/views/MainView";
import AboutView from "@/views/AboutView";

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Main',
    component: MainView,
  },
  {
    path: '/about',
    name: 'About',
    component: AboutView
  },
];

const router = new VueRouter({
  mode: 'hash',
  routes,
});

export default router;
