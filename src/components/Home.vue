<template>
  <div>
    <el-button type="info" @click="logOut">退出</el-button>
  </div>
</template>

<script>
export default {
  data() {
    return {}
  },
  methods: {
    /* 退出功能 */
    logOut() {
      /* 清除浏览器中得到sessionStorage */
      window.sessionStorage.clear()
      /* 强制跳转 */
      this.$router.push("/login")
    }
  }
}
</script>
<style lang="less" scoped>
</style>