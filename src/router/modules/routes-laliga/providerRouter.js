/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const providerRouter = {
  path: '/provider',
  component: Layout,
  redirect: 'noRedirect',
  name: 'Provider',
  alwaysShow: true,
  meta: {
    title: 'provider',
    icon: 'peoples'
  },
  children: [
    {
      path: 'cateogoryProvider',
      component: () => import('@/components-laLiga/provider/categoryProvider'),
      name: 'Provider Category',
      meta: { title: 'categoryProvider' }
    },
    {
      path: 'manageProvider',
      component: () => import('@/components-laLiga/provider/configProvider'),
      name: 'Admin provider',
      meta: { title: 'manageProvider' }
    },
    {
      path: 'manageCategoryHappyTour',
      component: () => import('@/components-laLiga/provider/categoryHappytours'),
      name: 'Provider HappyTour',
      meta: { title: 'happyTourCategory' }
    },
  ]

}
export default providerRouter
