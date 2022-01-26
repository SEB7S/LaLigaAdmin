/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const stadiumRouter = {
  path: '/stadium',
  component: Layout,
  redirect: 'noRedirect',
  name: 'ComponentDemo',
  meta: {
    title: 'stadium',
    icon: 'example'
  },
  children: [
    {
      path: 'manageStadium',
      component: () => import('@/components-laLiga/stadium/configStadium'),
      name: 'Manage Stadium',
      meta: { title: 'manageStadium' }
    },
    {
      path: 'markdown',
      component: () => import('@/views/components-demo/markdown'),
      name: 'Manage Stadium',
      meta: { title: 'Manage Stadium' }
    }
  ]
}
export default stadiumRouter
