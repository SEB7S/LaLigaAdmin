/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const matchRouter = {
  path: '/match',
  component: Layout,
  redirect: 'noRedirect',
  name: 'ComponentDemo',
  meta: {
    title: 'match',
    icon: 'component'
  },
  children: [
    {
      path: 'configMatchRate',
      component: () => import('@/components-laLiga/match/ConfigMatchRate'),
      name: 'Match Rates',
      meta: { title: 'manageRates' }
    },
    {
      path: 'configMatch',
      component: () => import('@/components-laLiga/match/ConfigMatch'),
      name: 'Config Match',
      meta: { title: 'manageMatch' }
    },
    {
      path: 'configClub',
      component: () => import('@/components-laLiga/match/ConfigClub'),
      name: 'Clubs',
      meta: { title: 'clubs' }
    },
    {
      path: 'configTournament',
      component: () => import('@/components-laLiga/match/ConfigTournament'),
      name: 'Tournament',
      meta: { title: 'tournament' }
    }

  ]
}
export default matchRouter
