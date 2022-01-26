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
      path: 'tinymce',
      component: () => import('@/views/components-demo/tinymce'),
      name: 'Setting Match',
      meta: { title: 'manageMatch' }
    },
    {
      path: 'markdown',
      component: () => import('@/views/components-demo/markdown'),
      name: 'Match Rates',
      meta: { title: 'manageRates' }
    },
    {
      path: 'json-editor',
      component: () => import('@/views/components-demo/json-editor'),
      name: 'Clubs',
      meta: { title: 'clubs' }
    }

  ]
}
export default matchRouter
