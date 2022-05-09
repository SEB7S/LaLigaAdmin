/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const stadiumRouter = {
  path: '/stadium',
  component: Layout,
  redirect: '/stadium/manageStadium',
  name: 'Stadium',
  alwaysShow: true,
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
      path: 'categoryStadium',
      component: () => import('@/components-laLiga/stadium/categoryStadium'),
      name: 'Category Stadium',
      meta: { title: 'categoryStadium' }
    }
  ]
}
export default stadiumRouter
