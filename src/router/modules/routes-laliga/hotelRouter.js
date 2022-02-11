/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const hotelRouter = {
  path: '/hotel',
  component: Layout,
  redirect: 'hotel',
  name: 'ComponentDemo',
  meta: {
    title: 'hotel',
    icon: 'star'
  },
  children: [
    {
      path: 'manageCategory',
      component: () => import('@/components-laLiga/hotel/categoryHotel'),
      name: 'Hotel Category',
      meta: { title: 'hotelCategory' }
    },
    {
      path: 'manageHotel',
      component: () => import('@/components-laLiga/hotel/configHotel'),
      name: 'Manage Hotel',
      meta: { title: 'manageHotel' }
    },
    {
      path: 'manageRoom',
      component: () => import('@/views/components-demo/split-pane'),
      name: 'Manage Room',
      meta: { title: 'manageRoom' }
    }

  ]
}
export default hotelRouter
