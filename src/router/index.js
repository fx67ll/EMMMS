import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

// 修复路由重复报错
// 获取原型对象上的push函数
const originalPush = Router.prototype.push;
// 修改原型对象中的push方法
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err);
};

import store from '@/store/index.js';

export const fx67llRoutes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@v/Home.vue'), // 工具站导航首页
  },
  {
    path: '/time',
    name: 'time',
    component: () => import('@v/Time.vue'), // 在线时钟页面
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@v/404.vue'), // 404页面
  },
  {
    path: '*', // 不存在的地址则重定向到404页面，保留路由拦截能力
    redirect: '/404',
  },
];

const router = new Router({
  mode: 'history', // history模式，去掉url中的#
  scrollBehavior: () => ({
    y: 0,
  }),
  routes: fx67llRoutes,
});

// 全局路由守卫
router.beforeEach((to, from, next) => {
  next(); // 必须使用 next ,执行效果依赖 next 方法的调用参数
});

export default router;
