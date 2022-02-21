/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const providerRouter = {
  path: '/provider',
  component: Layout,
  redirect: 'noRedirect',
  name: 'ComponentDemo',
  alwaysShow: true,
  meta: {
    title: 'provider',
    icon: 'peoples'
  },
  children: [
    {
      path: 'manageProvider',
      component: () => import('@/components-laLiga/provider/configProvider'),
      name: 'Admin provider',
      meta: { title: 'manageProvider' }
    },
    {
      path: 'manageCategory',
      component: () => import('@/components-laLiga/provider/categoryProvider'),
      name: 'Provider Category',
      meta: { title: 'hotelCategory' }
    },
  ]

}
export default providerRouter
