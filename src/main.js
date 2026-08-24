import Vue from 'vue';
import App from '@/App.vue';
import router from '@/router/index.js';
import store from '@/store/index.js';

Vue.config.productionTip = false;

import less from 'less';
Vue.use(less);

import 'normalize.css';

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

// fx67llVueUI 组件库：包含 fx67ll-digital-clock / fx67ll-binary-clock / fx67ll-footer 等组件
// 注意：依赖 npm 上的 fx67ll-vue-ui 0.7.0 及以上版本，本地开发前请先确认已发布或自行替换为本地依赖
import fx67llVueUI from 'fx67ll-vue-ui';
Vue.use(fx67llVueUI);

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
