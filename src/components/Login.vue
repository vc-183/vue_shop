<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avater_box">
        <img src="../assets/logo.png" alt />
      </div>
      <!-- 登录表单区域 -->
      <el-form label-width="0" class="login_form"
               ref="loginFormRef" :model="loginForm"
               :rules="loginFormRules">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input prefix-icon="iconfont user icon-user "
                    v-model="loginForm.username"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input prefix-icon=" iconfont icon-3702mima"
                    v-model="loginForm.password"
                    type="password"></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录
          </el-button>
          <el-button type="info" @click="resetLoginForm">重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        // 表单的数据绑定对象
        loginForm: {
          username: 'admin',
          password: '123456'
        },
        // 验证规则
        loginFormRules: {
          // 验证用户名是否合法
          username: [{
              required: true,
              message: '请输入用户名',
              trigger: 'blur'
            },
            {
              min: 3,
              max: 10,
              message: '长度在 3 到 10 个字符',
              trigger: 'blur'
            }
          ],
          // 验证密码是否合法
          password: [{
              required: true,
              message: '请输入密码',
              trigger: 'blur'
            },
            {
              min: 6,
              max: 16,
              message: '密码长度为6-16',
              trigger: 'blur'
            }
          ]
        }
      }
    },
    methods: {
      // 重置表单
      resetLoginForm() {
        //获取表单实例对象
        this.$refs.loginFormRef.resetFields()
      },
      // 表单预校验
      login() {
        this.$refs.loginFormRef.validate(async valid => {
          if (!valid) return
          const {
            data: res
          } = await this.$http.post('login', this
            .loginForm)
          // 提示是否登录成功
          if (res.meta.status !== 200) {
            return this.$message.error('登录失败')
          } else {
            this.$message.success('登录成功')
            // 保存token到浏览器的sessionStorage中
            window.sessionStorage.setItem('token', res
              .data.token)
            // 页面跳转
            this.$router.push('/home')
          }
        })
      }
    }
  }

</script>

<style lang='less' scoped>
  .login_container {
    background-color: #2b4b6b;
    height: 100%;
  }

  .login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    .avater_box {
      width: 130px;
      height: 130px;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 10px #ddd;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #fff;

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }
  }

  .login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }

  .btns {
    display: flex;
    justify-content: flex-end;
  }

</style>
