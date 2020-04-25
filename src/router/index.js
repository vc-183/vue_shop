import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'
Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' }, /* 重定向路由 */
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },

    ]
  },
]

const router = new VueRouter({
  routes
})
/* 挂载路由导航守卫控制访问权限       
  to: 将要访问的路径
  form: 从哪个路径跳转而来
  next 是一个函数表示:放行 next()   /next('/login') 强制跳转
*/
router.beforeEach((to, form, next) => {
  if (to.path === '/login') return next();
  //获取token 
  const tokenStr = window.sessionStorage.getItem('token');
  if (!tokenStr) return next('/login'); //强制跳转到login 页
  next();
})
export default router
