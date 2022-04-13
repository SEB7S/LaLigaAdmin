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
      path: 'manageHotel',
      component: () => import('@/components-laLiga/hotel/configHotel'),
      name: 'Manage Hotel',
      meta: { title: 'manageHotel' }
    }, {
      path: 'manageRoom',
      component: () => import('@/components-laLiga/hotel/roomType'),
      name: 'Manage RoomType',
      meta: { title: 'manageRoom' }
    },
  ]
}
export default hotelRouter
