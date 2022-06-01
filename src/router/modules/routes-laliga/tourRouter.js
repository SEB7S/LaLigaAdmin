/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const tourRouter = {
  path: '/',
  component: Layout,
  redirect: '/manageTour',
  name: 'tour',
  alwaysShow: true,
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
      path: 'programTour',
      component: () => import('@/components-laLiga/tour/programTour'),
      name: 'programTour',
      meta: { title: 'dateTours' }
    }
  ]
}
export default tourRouter
