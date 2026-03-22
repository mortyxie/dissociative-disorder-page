import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  /** 根路径进入 homi，命名重定向在带 BASE_URL 部署时与 path 重定向一致且更稳妥 */
  { path: '/', redirect: { name: 'homi' } },
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
    /** 直接访问 /compass 或子路径为空时进入星盘 */
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
