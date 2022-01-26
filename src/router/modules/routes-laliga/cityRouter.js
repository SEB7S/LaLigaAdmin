/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const cityRouter = {
  path: '/city',
  component: Layout,
  redirect: 'noRedirect',
  name: 'ComponentDemo',
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
    },
    {
      path: 'city',
      component: () => import('@/views/components-demo/tinymce'),
      name: 'Manage City',
      meta: { title: 'Manage City' }
    }
  ]
}
export default cityRouter
