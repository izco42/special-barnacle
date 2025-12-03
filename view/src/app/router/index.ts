import { createRouter, createWebHistory } from 'vue-router'
import ActiveCutView from '../../feature/cuts/views/ActiveCutView.vue'
import HistoryView from '../../feature/cuts/views/HistoryView.vue'

const routes = [
  { path: '/', name: 'active-cut', component: ActiveCutView },
  { path: '/historial', name: 'history', component: HistoryView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
