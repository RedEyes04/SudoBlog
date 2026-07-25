import { createRouter, createWebHistory } from 'vue-router'

export function createAdminRouter(basePath: string) {
  const router = createRouter({
    history: createWebHistory(basePath),
    routes: [
      {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue'),
      },
      {
        path: '/',
        component: () => import('../components/AdminLayout.vue'),
        children: [
          {
            path: '',
            name: 'Dashboard',
            component: () => import('../views/Dashboard.vue'),
          },
          {
            path: 'posts',
            name: 'PostsList',
            component: () => import('../views/PostsList.vue'),
          },
          {
            path: 'editor',
            name: 'EditorNew',
            component: () => import('../views/Editor.vue'),
          },
          {
            path: 'editor/:id',
            name: 'EditorEdit',
            component: () => import('../views/Editor.vue'),
            props: true,
          },
          {
            path: 'friends',
            name: 'FriendsManage',
            component: () => import('../views/Friends.vue'),
          },
          {
            path: 'applications',
            name: 'Applications',
            component: () => import('../views/Applications.vue'),
          },
          {
            path: 'settings',
            name: 'Settings',
            component: () => import('../views/Settings.vue'),
          },
        ],
      },
    ],
  })

  // Navigation guard
  router.beforeEach((to, _from, next) => {
    const token = localStorage.getItem('admin_token')
    if (to.path === '/login') {
      if (token) {
        next('/')
      } else {
        next()
      }
    } else {
      if (!token) {
        next('/login')
      } else {
        next()
      }
    }
  })

  return router
}
