// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Vuex from 'vuex'
import {createStore} from './vuex/index'
import global_ from './common/global' //引用文件
//引入element-ui
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
// i18n
import i18n from './i18n/i18n'

Vue.prototype.GLOBAL = global_//挂载到Vue实例上面
Vue.use(ElementUI, {
  i18n: (key, value) => i18n.t(key, value)// i18n
})
Vue.config.productionTip = false;
// vuex
Vue.use(Vuex);
// router.beforeEach((to, from, next) => {
//   if(localStorage.getItem('userInfo')) {
//     if (to.path === '/login'){
//       next({path: '/dashboard'});
//     } else {
//       next();
//     }
//   }
//   else {
//     if (to.path === '/login') {
//       next();
//     } else {
//       next({path: '/login'});
//     }
//   }
// });
const store=createStore();
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: {App},
  template: '<App/>',
  i18n
});
