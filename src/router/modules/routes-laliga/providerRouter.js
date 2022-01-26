/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const providerRouter = {
  path: '/provider',
  component: Layout,
  redirect: 'noRedirect',
  name: 'ComponentDemo',
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
      path: 'provider',
      component: () => import('@/views/components-demo/split-pane'),
      name: 'Admin provider',
      meta: { title: 'Manage Provider' }
    }
  ]

}
export default providerRouter
