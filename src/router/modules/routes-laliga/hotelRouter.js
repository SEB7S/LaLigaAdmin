/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const hotelRouter = {
  path: '/',
  component: Layout,
  redirect: 'hotel',
  name: 'ComponentDemo',
  meta: {
    title: 'hotel',
    icon: 'star'
  },
  children: [
    {
      path: 'hotel',
      component: () => import('@/components-laLiga/hotel/categoryHotel'),
      name: 'Hotel Category',
      meta: { title: 'hotelCategory' }
    },
    {
      path: 'markdown',
      component: () => import('@/views/components-demo/split-pane'),
      name: 'Manage Hotel',
      meta: { title: 'manageHotel' }
    },
    {
      path: 'json-editor',
      component: () => import('@/views/components-demo/split-pane'),
      name: 'Manage Room',
      meta: { title: 'manageRoom' }
    }

  ]
}
export default hotelRouter
