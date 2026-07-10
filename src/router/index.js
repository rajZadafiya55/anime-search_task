import { createRouter, createWebHistory } from 'vue-router'
import AnimeSearch from '../pages/AnimeSearch.vue'
import Favorites from '../pages/Favorites.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: AnimeSearch
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: Favorites
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
