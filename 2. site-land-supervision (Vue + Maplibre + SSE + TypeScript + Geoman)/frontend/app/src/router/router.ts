import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { Consts } from '@/consts/index.consts'

export const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'index',
    meta: { layout: 'main', requiresAuth: true },
    component: () => import('@/views/index.vue')
  },
  // sada
  {
    path: '/sign-in/',
    name: 'SignIn',
    meta: { layout: 'login' },
    component: () => import('@/views/SignIn.vue')
  },
  {
    path: '/sign-up/',
    name: 'SignUp',
    meta: { layout: 'login' },
    component: () => import('@/views/SignUp.vue')
  },
  {
    path: Consts.ROUTES.AUTH_RESET_PASSWORD,
    name: 'ForgotPassword',
    meta: { layout: 'login' },
    component: () => import('@/views/PasswordReset.vue')
  },
  {
    path: '/documents/',
    name: 'documents',
    meta: { layout: 'main' },
    component: () => import('@/views/documents.vue')
  },
  {
    path: '/desktops/',
    name: 'desktops',
    meta: { layout: 'main' },
    component: () => import('@/views/desktops.vue')
  },
  {
    path: '/tools/',
    name: 'tools',
    meta: { layout: 'main' },
    component: () => import('@/views/tools.vue')
  },
  {
    path: Consts.ROUTES.ADMIN,
    name: Consts.RouterNames.ADMIN,
    meta: { layout: 'main' },
    component: () => import('@/views/AdminView.vue'),
    children: [
      {
        path: Consts.ROUTES.ADMIN,
        name: Consts.RouterNames.ADMIN_MAIN,
        component: () => import('@/components/admin/AdminMain.vue')
      },
      {
        path: Consts.ROUTES.ADMIN_USER,
        name: Consts.RouterNames.ADMIN_USERS,
        component: () => import('@/components/admin/AdminUsers.vue')
      },
      {
        path: Consts.ROUTES.ADMIN_TERRITORIES,
        name: Consts.RouterNames.ADMIN_TERRITORIES,
        component: () => import('@/components/admin/AdminTerritories.vue')
      },
      {
        path: Consts.ROUTES.ADMIN_UPLOAD_LAYER,
        name: Consts.RouterNames.ADMIN_UPLOAD_LAYER,
        component: () => import('@/components/admin/AdminUploadLayer.vue')
      },
      {
        path: Consts.ROUTES.ADMIN_LAYERS,
        name: Consts.RouterNames.ADMIN_LAYERS,
        component: () => import('@/components/admin/AdminLayers.vue')
      },
      {
        path: `${Consts.ROUTES.ADMIN_LAYERS}:id_layer`,
        name: Consts.RouterNames.ADMIN_LAYER_EDIT,
        component: () => import('@/components/admin/AdminLayerEdit.vue')
      },
      {
        path: Consts.ROUTES.ADMIN_GROUP_FOR_LAYERS,
        name: Consts.RouterNames.ADMIN_LAYER_EDIT,
        component: () => import('@/components/admin/AdminEditGroupForLayers.vue')
      },
      {
        path: `${Consts.ROUTES.ADMIN_USER_EDIT}:id/`,
        name: 'EditUser',
        component: () => import('@/components/admin/EditUser.vue')
      },
      {
        path: Consts.ROUTES.ADMIN_MANAGE_ACCESS,
        name: 'ManageAccess',
        component: () => import('@/components/admin/AdminManageAccess.vue')
      },
      {
        path: `${Consts.ROUTES.ADMIN_DICTS}:name_page`,
        name: 'ManageDictPage',
        meta: { layout: 'main' },
        component: () => import('@/components/admin/ManageDictPage.vue')
      }
    ]
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})

// router.beforeEach(async (to, from, next) => {
//   if (to.path.startsWith('/admin/') && to.path !== '/admin/') {
//     const res = await checkAdminAccess()
//     if (res) {
//       next()
//     } else {
//       next(from.fullPath)
//     }
//   }
//
//   const token = localStorage.getItem('token')
//
//   if (!token && to.path !== '/sign-in' && to.path !== '/sign-up' && to.path !== Consts.ROUTES.AUTH_RESET_PASSWORD) {
//     await clearAllDataUser()
//     next('/sign-in')
//   } else {
//     next()
//   }
// })


export default router
