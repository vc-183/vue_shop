import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
Vue.use(VueRouter)

const routes = [
 
  { path: '/', redirect: '/login' }, /* 重定向路由 */
  { path: '/login', component: Login },
  { path: '/home', component: Home },
]

const router = new VueRouter({
  routes 
})
/* 挂载路由导航守卫控制访问权限       
  to: 将要访问的路径
  form: 从哪个路径跳转而来
  next 是一个函数表示:放行 next()   /next('/login') 强制跳转
*/ 
router.beforeEach((to,form,next)=>{
  if(to=='/login') return next();
  //获取token 
   const tokenStr=window.sessionStorage.getItem('token');
   if(!tokenStr)return next('/login'); //强制跳转到login 页
   next();
})
export default router
