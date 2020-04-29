<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页
      </el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加商品提示区域 -->
      <el-alert title="添加商品信息" type="info" center show-icon
                :closable="false">
      </el-alert>
      <!-- 进度条 -->
      <el-steps :space="200" :active="activeIndex -0"
                align-center finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab栏区域 -->
      <el-form ref="addFormRef" :model="addForm"
               label-width="100px" :rules="addFormRules"
               label-position="top">
        <el-tabs v-model="activeIndex"
                 :before-leave="beforeTabLeave"
                 @tab-click="TabClicked"
                 :tab-position="'left'">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name">
              </el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price"
                        type="number">
              </el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"
                        type="number">
              </el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number"
                        type="number">
              </el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addForm.goods_cat"
                           :options="cateList"
                           :props="cateProps"
                           @change="handleChange">
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name"
                          v-for="item in  manyTableDate"
                          :key="item.attr_id">
              <!-- 复选框组 -->

              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" border
                             v-for="(cb ,i) in item.attr_vals"
                             :key="i"></el-checkbox>
              </el-checkbox-group>

            </el-form-item>

          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name"
                          v-for="item in  onlyTableDate"
                          :key="item.attr_id">
              <el-input v-model="item.attr_vals">
              </el-input>
            </el-form-item>

          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!--  action 图片上传到的后台API地址 -->
            <el-upload class="upload-demo"
                       :action='uploadUrl'
                       :on-preview="handlePreview"
                       :on-remove="handleRemove"
                       :headers="headerObj"
                       list-type="picture"
                       :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传
              </el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce">
            </quill-editor>
            <!-- 添加商品的按钮 -->
            <el-button class="btnAdd" type="primary"
                       @click="Add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible"
               width="50%">
      <img :src="previewPath" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
  import _ from 'lodash'
  export default {
    data() {
      return {
        activeIndex: '0',
        //添加商品的表单对象
        addForm: {
          goods_name: '',
          //商品所属的分类数组
          goods_cat: [],
          goods_price: 1,
          goods_number: 1,
          goods_weight: 1,
          //商品的详情描述
          goods_introduce: '',
          //图片的数组
          pics: [],
          attrs: []
        },
        //添加商品表单的验证规则
        addFormRules: {
          goods_name: [{
            required: true,
            message: '请输入商品名称',
            trigger: 'blur'
          }],
          goods_price: [{
            required: true,
            message: '请输入商品单价',
            trigger: 'blur'
          }],
          goods_number: [{
            required: true,
            message: '请输入商品数量',
            trigger: 'blur'
          }],
          goods_weight: [{
            required: true,
            message: '请输入商品重量',
            trigger: 'blur'
          }],
          goods_cat: [{
            required: true,
            message: '请选择商品分类',
            trigger: 'blur',

          }]
        },
        //商品分类的列表
        cateList: [],
        //
        cateProps: {
          label: 'cat_name',
          value: 'cat_id',
          children: 'children',
          expandTrigger: 'hover'
        },
        //动态参数列表数组
        manyTableDate: [],
        //静态参数列表数组
        onlyTableDate: [],
        /* 图片上传地址 */
        uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
        //图片上传组件的headers请求头对象
        headerObj: {
          Authorization: window.sessionStorage.getItem(
            'token')
        },
        //预览图片的路径
        previewPath: '',
        previewVisible: false,

      }
    },
    created() {
      //获取所有商品分类数据
      this.getCateList()
    },
    methods: {
      async getCateList() {
        const {
          data: res
        } = await this.$http.get('categories')
        if (res.meta.status !== 200) {
          this.$message.error('获取商品分类失败')
        }
        this.cateList = res.data
      },
      //级联选中器选中项发生改变 会触发改函数
      handleChange() {
        if (this.addForm.goods_cat.length !== 3) {
          this.addForm.goods_cat = []
        }
      },
      beforeTabLeave(activeName, odactiveName) {
        if (odactiveName === '0' && this.addForm.goods_cat
          .length !== 3) {
          this.$message.error('请先选择商品分类')
          return false
        }

      },
      async TabClicked() {
        //证明访问的是动态参数面板
        if (this.activeIndex === '1') {
          const {
            data: res
          } = await this.$http.get(
            `categories/${this.cateId}/attributes`, {
              params: {
                sel: 'many'
              }
            })
          if (res.meta.status !== 200) {
            this.$message.error('获取动态参数列表失败')
          }
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals.length ===
              0 ? [] :
              item.attr_vals.split(' ')
          });
          this.manyTableDate = res.data
          console.log(res.data);
        }

        if (this.activeIndex === '2') {
          const {
            data: res
          } = await this.$http.get(
            `categories/${this.cateId}/attributes`, {
              params: {
                sel: 'only'
              }
            })
          if (res.meta.status !== 200) {
            this.$message.error('获取静态参数列表失败')
          }
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals.length ===
              0 ? [] :
              item.attr_vals.split(' ')
          });
          this.onlyTableDate = res.data
          console.log(res.data);
        }
      },
      //处理图片预览效果
      handlePreview(file) {
        this.previewPath = file.response.data.url
        this.previewVisible = true
      },
      //处理移除图片的操作
      handleRemove(file) {
        //1.获取将要删除的图片的临时路径
        const filePath = file.response.data.tmp_path
        //2.从pics  数组中,找到这个图片的对应的索引值
        const i = this.addForm.pics.findIndex(x => x.pic ===
          filePath)
        //3.调用数组的splice 方法,爸图片信息对象,从pics数组中移除
        this.addForm.pics.splice(i, 1)
        console.log(this.addForm)
      },
      //监听图片上传成功的事件
      handleSuccess(response) {
        //1.拼接得到一个图片信息对象
        const pinInfo = {
          pic: response.data.tmp_path
        }
        //2.将图片信息对象 ,push 到pics
        this.addForm.pics.push(pinInfo)
        console.log(this.addForm);

      },
      //添加商品
      Add() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) {
            this.$message.error('请填写必要的表单项!')
          }
          //执行添加的业务逻辑
          //深拷贝
          const form = _.cloneDeep(this.addForm)
          form.goods_cat = form.goods_cat.join(',')

          //处理动态参数
          this.manyTableDate.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals.join(
                ' ')
            }
            this.addForm.attrs.push(newInfo)
          });
          //处理静态属性
          this.onlyTableDate.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals
            }
            this.addForm.attrs.push(newInfo)
          });
          form.attrs = this.addForm.attrs
          console.log(form);
          //    发起请求添加商品
          //商品的名称,必须是唯一的
          const {
            data: res
          } = await this.$http.post('goods', form)

          console.log(res);

          if (res.meta.status !== 201) {

            return this.$message.error('添加商品失败')
          }
          this.$message.success('添加商品成功!')
          this.$router.push('/goods')
        })
      },

    },
    computed: {
      cateId() {
        if (this.addForm.goods_cat.length === 3) {
          return this.addForm.goods_cat[2]
        }
        return null
      },
    },
  }

</script>

<style lang="less" scoped>
  .el-checkbox {
    margin: 0 10px 0 0 !important;
  }

  .previewImg {
    width: 90%;
  }

  .btnAdd {
    margin-top: 15px;
  }

</style>
