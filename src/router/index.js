import { createRouter, createWebHistory } from "vue-router"

// Define routes
const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("../App.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
]

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
