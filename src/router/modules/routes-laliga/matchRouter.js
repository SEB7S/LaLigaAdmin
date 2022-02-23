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
      path: 'configMatch',
      component: () => import('@/components-laLiga/match/ConfigMatch'),
      name: 'Config Match',
      meta: { title: 'manageMatch' }
    },
    {
      path: 'configMatchRate',
      component: () => import('@/components-laLiga/match/ConfigMatchRate'),
      name: 'Match Rates',
      meta: { title: 'manageRates' }
    },
    {
      path: 'configClub',
      component: () => import('@/components-laLiga/match/ConfigClub'),
      name: 'Clubs',
      meta: { title: 'clubs' }
    }

  ]
}
export default matchRouter
