import Vue from "vue";
import VueRouter from "vue-router";
// import Home from "../views/Home.vue";
import Flocked from "../views/flocked/flocked";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "home",
    redirect: "/flocked"
  },
  {
    path: "/flocked",
    name: "flocked",
    component: Flocked
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
