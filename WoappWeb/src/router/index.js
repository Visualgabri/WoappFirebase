import { createRouter, createWebHistory } from 'vue-router'
import Workouts from '../views/Workouts.vue'
import Grafici from '../views/Grafici.vue'
import Ricerca from '../views/Ricerca.vue'
import { utente, ruolo } from '../authStore.js'

const routes = [
  { path: '/', name: 'Workouts', component: Workouts },
  { path: '/ricerca', name: 'Ricerca', component: Ricerca },
  { path: '/home', name: 'HomeWo', component: () => import('../views/Home.vue') },
  { path: '/grafici', name: 'Grafici', component: Grafici },
  { path: '/workout/:id', name: 'DettaglioWorkout', component: () => import('../views/Dettaglio.vue'), props: true },
  { path: '/sessione/:id', name: 'DettaglioSessione', component: () => import('../views/Sessione.vue'), props: true },
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue') },
  { path: '/admin', name: 'AdminDashboard', component: () => import('../views/AdminDashboard.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation Guard per proteggere le rotte
router.beforeEach((to, from, next) => {
  const utenteLoggato = utente.value;
  
  if (to.name !== 'Login' && !utenteLoggato) {
    next({ name: 'Login' });
  } else if (to.name === 'AdminDashboard' && ruolo.value !== 'coach') {
    // Solo il Coach può accedere al pannello di amministrazione
    next({ name: 'Workouts' });
  } else {
    next();
  }
});

export default router
