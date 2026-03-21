/**
 * 全站一级导航（AppRouteNav）
 * 新增页面时只改此数组，顶栏宽度不随条目数增加。
 */
export const siteNavItems = [
  {
    id: 'homi',
    to: '/homi',
    label: '主页',
    /** 当前路由 path 匹配函数 */
    isActive: (path) => path === '/homi' || path.startsWith('/homi/'),
  },
  {
    id: 'compass',
    to: '/compass',
    label: '个人知识库',
    isActive: (path) => path.startsWith('/compass'),
  },
]
