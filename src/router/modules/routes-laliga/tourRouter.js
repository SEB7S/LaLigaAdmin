/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const tourRouter = {
  path: '/',
  component: Layout,
  redirect: '/manageTour',
  name: 'tour',
  meta: {
    title: 'tour',
    icon: 'education'
  },
  children: [
    {
      path: 'manageTour',
      component: () => import('@/components-laLiga/tour/configTour'),
      name: 'manageTour',
      meta: { title: 'manageTour' }
    },
    {
      path: 'tinymce',
      component: () => import('@/views/components-demo/tinymce'),
      name: 'Manage Tour',
      meta: { title: 'Manage Tour' }
    }
  ]
}
export default tourRouter
