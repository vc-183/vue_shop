import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
/* 导入全局样式 */
import './assets/css/global.css'
/* 引入字体图标 */
import './assets/fonts/iconfont.css'
//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
//导入富文本导入富文本对应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
import TreeTable from 'vue-table-with-tree-grid'
import axios from 'axios'
/* 配置请求根路径 */
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//axios请求拦截
axios.interceptors.request.use(config => {
  //为请求头对象,添加Token验证的 Authorization字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  //console.log(config);

  return config

})
//将富文本编辑器,注册为全局可用的组件
Vue.use(VueQuillEditor,)
Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.filter('dataFormat', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  //padStart(2, '0')  如果不足两位 ,则前面添0
  const m = (dt.getMonth() + 1 + ' ').padStart(2, '0')
  const d = (dt.getDay() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
Vue.component('tree-table', TreeTable)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
