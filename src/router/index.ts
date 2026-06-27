import { createRouter, createWebHashHistory } from 'vue-router'
import { useTournamentStore } from '../stores/tournament'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/setup' },
    {
      path: '/setup',
      component: () => import('../views/SetupView.vue'),
    },
    {
      path: '/tournament',
      component: () => import('../views/TournamentLayout.vue'),
      children: [
        { path: '', redirect: 'active' },
        { path: 'active', component: () => import('../views/ActiveRoundView.vue') },
        { path: 'scores', component: () => import('../views/ScoreEntryView.vue') },
        { path: 'players', component: () => import('../views/PlayerManagementView.vue') },
        { path: 'rounds', component: () => import('../views/RoundsView.vue') },
        { path: 'standings', component: () => import('../views/StandingsView.vue') },
        { path: 'info', component: () => import('../views/TournamentInfoView.vue') },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const tournamentStore = useTournamentStore()
  const hasTournament = tournamentStore.tournament?.status === 'running'

  if (to.path === '/setup') {
    if (hasTournament) return '/tournament/active'
    return true
  }

  if (to.path.startsWith('/tournament') && !hasTournament) {
    return '/setup'
  }

  return true
})

export default router
