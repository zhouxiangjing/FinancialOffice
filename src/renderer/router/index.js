import Vue from 'vue'
import Router from 'vue-router'

import Layout from '../views/layout/Layout'

Vue.use(Router)

export const constantRouterMap = [
  { path: '/', redirect: '/dashboard/index', hidden: true },
  {
    path: '/dashboard',
    component: Layout,
    children: [
      {
        path: 'index',
        name: '仪表盘',
        component: () => import('@/views/dashboard/index'),
        meta: { title: '仪表盘', icon: 'table' }
      }
    ]
  },
  {
    path: '/consumption',
    component: Layout,
    redirect: '/consumption/quick',
    meta: { title: '消费收银', icon: 'example' },
    children: [
      {
        path: 'quick',
        name: '快速消费',
        component: () => import('@/views/quick/index'),
        meta: { title: '快速消费', icon: 'table' }
      },
      {
        path: 'member',
        name: '会员消费',
        component: () => import('@/views/member/index'),
        meta: { title: '会员消费', icon: 'tree' }
      }
    ]
  },
  {
    path: '/statement',
    component: Layout,
    redirect: '/statement/sales_order',
    meta: { title: '报表管理', icon: 'example' },
    children: [
      {
        path: 'sales_order',
        name: '销售订单',
        component: () => import('@/views/sales/index'),
        meta: { title: '销售订单', icon: 'table' }
      },
      {
        path: 'member_management',
        name: '会员管理',
        component: () => import('@/views/member/index'),
        meta: { title: '会员管理', icon: 'tree' }
      }
    ]
  },
  {
    path: '/form',
    component: Layout,
    children: [
      {
        path: 'index',
        name: '系统设置',
        component: () => import('@/views/settings/index'),
        meta: { title: '系统设置', icon: 'form' }
      }
    ]
  }
]

export default new Router({
  // mode: 'history', //后端支持可开
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})
