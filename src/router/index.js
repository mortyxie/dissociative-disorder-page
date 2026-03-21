import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/homi' },
  {
    path: '/homi',
    name: 'homi',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: '主页' },
  },
  {
    path: '/compass',
    component: () => import('@/views/compass/CompassLayout.vue'),
    meta: { title: '个人知识库' },
    redirect: '/compass/stars',
    children: [
      {
        path: 'stars',
        name: 'compass-stars',
        component: () => import('@/views/compass/CompassStarsView.vue'),
        meta: { title: '知识星盘' },
      },
      {
        path: 'timeline',
        name: 'compass-timeline',
        component: () => import('@/views/compass/CompassTimelineView.vue'),
        meta: { title: '知识时间线' },
      },
    ],
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.afterEach((to) => {
  const base = 'Dissociative Disorder'
  const leaf = [...to.matched].reverse().find((r) => r.meta?.title)
  const pageTitle = leaf?.meta?.title ?? to.meta?.title
  document.title = pageTitle ? `${pageTitle} · ${base}` : base
})
