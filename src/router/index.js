import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

// 修复路由重复报错
// 获取原型对象上的push函数
const originalPush = Router.prototype.push
// 修改原型对象中的push方法
Router.prototype.push = function push(location) {
	return originalPush.call(this, location).catch(err => err)
}

import store from '@/store/index.js'

export const fx67llRoutes = [{
		path: '/',
		name: '404',
		component: () => import('@v/index-404.vue') // 404
	},
	{
		path: '/index',
		name: 'index',
		component: () => import('@v/index.vue') // 首页
	},
	{
		path: '/back',
		name: 'back',
		component: () => import('@v/index-back.vue') // 备份，主要用于看老代码
	},
	{
		path: '*', // 不存在的地址则重定向页面地址
		redirect: '/'
	}
]

const router = new Router({
	mode: 'history', // history模式，去掉url中的#
	scrollBehavior: () => ({
		y: 0
	}),
	routes: fx67llRoutes
})

// 全局路由守卫
router.beforeEach((to, from, next) => {
	next() // 必须使用 next ,执行效果依赖 next 方法的调用参数
})

export default router
