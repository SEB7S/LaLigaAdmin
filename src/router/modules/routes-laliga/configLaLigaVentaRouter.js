/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const configRouter = {
    path: '/config-laLigaVentas',
    component: Layout,
    children: [
        {
            path: 'index',
            component: () => import('@/components-laLiga/config-laLiga-ventas/config-laLiga-ventas'),
            name: 'Config',
            meta: { title: 'config', icon: 'form', noCache: true }
        }
    ]
}
export default configRouter
