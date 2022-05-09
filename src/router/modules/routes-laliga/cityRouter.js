/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const cityRouter = {
  path: '/city',
  component: Layout,
  redirect: 'noRedirect',
  name: 'City',
  alwaysShow: true,
  meta: {
    title: 'city',
    icon: 'international'
  },
  children: [
    {
      path: 'manageCity',
      component: () => import('@/components-laLiga/city/configCity'),
      name: 'Manage City',
      meta: { title: 'manageCity' }
    }
  ]
}
export default cityRouter
