<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页
      </el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card class="cat_opt">
      <!-- 头部警告区域 -->
      <el-alert title="注意:只允许为三级分类设置相关参数!" type="warning"
                show-icon :closable="false">
      </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row>
        <el-col>
          <span>选择商品分类:</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader v-model="selectedCateKeys"
                       :options="cateList"
                       @change="handleChange"
                       :props="cateProps"
                       :show-all-levels="false">
          </el-cascader>
        </el-col>
      </el-row>
      <!-- tab 页签区域 -->
      <el-tabs v-model="activeName"
               @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数的按钮 -->
          <el-button size="mini" type="primary"
                     :disabled="isBtnDisabled"
                     @click="addDialogVisible=true">添加参数
          </el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableDate" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag closable :key="i" v-for="(item ,i) in
                          scope.row.attr_vals"
                        @close="handleClose(i,scope.row)">
                  {{item}}</el-tag>
                <!-- 输入文本框 -->
                <el-input class="input-new-tag"
                          v-if="scope.row.inputVisible"
                          v-model="scope.row.inputValue"
                          ref="saveTagInput" size="small"
                          @keyup.enter.native="handleInputConfirm(scope.row)"
                          @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!-- 添加的按钮 -->
                <el-button v-else class="button-new-tag"
                           size="small"
                           @click="showInput(scope.row)">+
                  New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#">
            </el-table-column>
            <el-table-column prop="attr_name" label="参数名称">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary"
                           icon="el-icon-edit"
                           @click="showEditDialog(scope.row.attr_id)">
                  修改
                </el-button>
                <el-button size="mini" type="danger"
                           icon="el-icon-delete"
                           @click="removeParams(scope.row.attr_id)">
                  删除
                </el-button>
              </template>

            </el-table-column>

          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性的按钮 -->
          <el-button size="mini" type="primary"
                     :disabled="isBtnDisabled"
                     @click="addDialogVisible=true">添加属性
          </el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableDate" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag closable :key="i" v-for="(item ,i) in
                          scope.row.attr_vals"
                        @close="handleClose(i,scope.row)">
                  {{item}}</el-tag>
                <!-- 输入文本框 -->
                <el-input class="input-new-tag"
                          v-if="scope.row.inputVisible"
                          v-model="scope.row.inputValue"
                          ref="saveTagInput" size="small"
                          @keyup.enter.native="handleInputConfirm(scope.row)"
                          @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!-- 添加的按钮 -->
                <el-button v-else class="button-new-tag"
                           size="small"
                           @click="showInput(scope.row)">+
                  New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#">
            </el-table-column>
            <el-table-column prop="attr_name" label="属性名称">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary"
                           icon="el-icon-edit"
                           @click="showEditDialog(scope.row.attr_id)">
                  编辑
                </el-button>
                <el-button size="mini" type="danger"
                           icon="el-icon-delete"
                           @click="removeParams(scope.row.attr_id)">
                  删除
                </el-button>
              </template>

            </el-table-column>

          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog :title="'添加'+titleText"
               :visible.sync="addDialogVisible" width="50%"
               @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules"
               ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>

      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消
        </el-button>
        <el-button type="primary" @click="addParams()">确 定
        </el-button>
      </span>
    </el-dialog>
    <!-- 修改参数的对话框 -->
    <el-dialog :title="'修改'+titleText"
               :visible.sync="editDialogVisible" width="50%"
               @close="editDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="editForm" :rules="editFormRules"
               ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>

      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消
        </el-button>
        <el-button type="primary" @click="etitParams()">确 定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        //商品分类列表
        cateList: [],
        //级联选择框的配置对象
        cateProps: {
          value: 'cat_id',
          label: 'cat_name',
          children: 'children',
          expandTrigger: 'click'
        },
        //级联选择框双向绑定到的数组
        selectedCateKeys: [],
        //被激活的页签的名称
        activeName: "many",
        //动态参数的数据
        manyTableDate: [],
        //静态属性的数据
        onlyTableDate: [],
        //控制添加对话框的展示与隐藏
        addDialogVisible: false,
        //添加参数的表单数据对象
        addForm: {
          attr_name: ''
        },
        //添加表单的验证规则
        addFormRules: {
          attr_name: [{
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          }]
        },
        //控制修改对话框的显示与隐藏
        editDialogVisible: false,
        //修改的表单数据
        editForm: {},
        //修改表单的验证规则
        editFormRules: {
          attr_name: [{
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          }]
        },

      }
    },
    created() {
      this.getCateList()
    },
    methods: {
      //获取所有的商品分类列表
      async getCateList() {
        const {
          data: res
        } = await this.$http.get('categories')
        if (res.meta.status !== 200) {
          return this.$message
            .error('获取商品分类列表失败')
        }
        this.cateList = res.data
      },
      //级联选择框发生改变时触发
      handleChange() {
        this.getParamsData()
      },
      //tab 点击事件的处理函数
      handleTabClick() {
        console.log(this.activeName);
        this.getParamsData()
      },
      //获取参数列表数据
      async getParamsData() {
        //证明选择的不是三级分类
        if (this.selectedCateKeys.length !== 3) {
          this.selectedCateKeys = []
          this.manyTableDate = []
          this.onlyTableDate = []
          return
        }
        //证明选择的是三级分类
        console.log(this.selectedCateKeys);
        //根据所选分类的id,和当前分类的面板,获取对应的参数
        const {
          data: res
        } = await this.$http.get(
          `categories/${this.cateId}/attributes`, {
            params: {
              sel: this.activeName
            }
          })
        if (res.meta.status !== 200) {
          return this.$message.error('获取参数列表失败')
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item
            .attr_vals.split(' ') : []
          //控制文本框的显示与隐藏
          item.inputVisible = false
          //文本框中输入的值
          item.inputValue = ''
        });
        console.log(res.data);

        this.$message.success('获取参数列表成功')
        if (this.activeName === "many") {
          this.manyTableDate = res.data
        } else {
          this.onlyTableDate = res.data
        }

      },
      //监听对话框的关闭事件 重置添加的表单
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      //
      editDialog(id) {
        console.log(id);

      },
      //点击按钮添加参数
      addParams() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          const {
            data: res
          } = await this.$http.post(
            `categories/${this.cateId}/attributes`, {
              attr_name: this.addForm.attr_name,
              attr_sel: this.activeName
            })
          if (res.meta.status !== 201) {
            return this.$message.error('添加参数失败')
          }

          this.$message.success('添加参数成功')
          this.addDialogVisible = false
          this.getParamsData()
        })
      },
      //点击按钮展示修改对话框
      async showEditDialog(attr_id) {
        //查询当前西参数的信息
        const {
          data: res
        } = await this.$http.get(
          `categories/${this.cateId}/attributes/${attr_id}`, {
            params: {
              attr_sel: this.activeName,
            }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取参数信息失败')
        }
        this.editForm = res.data
        this.editDialogVisible = true
      },
      //重置修改的表单
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      //点击按钮修改参数信息
      etitParams() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          const {
            data: res
          } = await this.$http.put(
            `categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
              attr_name: this.editForm.attr_name,
              attr_sel: this.activeName
            })
          if (res.meta.status !== 200) {
            return this.$message.error('修改参数失败')
          }
          this.$message.success('修改参数成功')
          this.getParamsData()
          this.editDialogVisible = false
        })

      },
      //根据id删除对应参数项
      async removeParams(attr_id) {
        // 弹框询问用户是否删除数据
        const confirmResult = await this.$confirm(
          '此操作将永久删除该参数, 是否继续?',
          '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).catch(err => err)

        // 如果用户确认删除，则返回值为字符串 confirm
        // 如果用户取消了删除，则返回值为字符串 cancel
        // console.log(confirmResult)
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消删除')
        }

        const {
          data: res
        } = await this.$http.delete(
          `categories/${this.cateId}/attributes/${attr_id}`
        )

        if (res.meta.status !== 200) {
          return this.$message.error('删除属性失败！')
        }

        this.$message.success('删除属性成功！')
        this.getParamsData()
      },
      //点击按钮,展示文本输入框
      showInput(row) {
        row.inputVisible = true;
        //让文本款自动获取焦点
        //$nextTick 方法的作用 
        //就是当页面上元素被重新渲染之后,才会指定回调函数中的代码
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      },
      //文本框失去焦点,或按下Enter键都会触发
      handleInputConfirm(row) {
        if (row.inputValue.trim().length === 0) {
          row.inputValue = '';
          row.inputVisible = false;
          return
        }
        //如果没有return ,则证明输入的内容,需要做后续处理
        row.attr_vals.push(row.inputValue.trim());
        row.inputValue = '';
        row.inputVisible = false;
        this.saveAttrVals(row)

      },
      //将对attr_vals 的操作保存到数据库
      async saveAttrVals(row) {
        //需要发起请求,保存才操作
        const {
          data: res
        } = await this.$http.put(
          `categories/${this.cateId}/attributes/${row.attr_id}`, {
            attr_name: row.attr_name,
            attr_sel: row.attr_sel,
            attr_vals: row.attr_vals.join(' ')
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数项失败')
        }
        this.$message.success('修改参数项成功!')

      },
      //删除对应的参数可选项
      handleClose(i, row) {
        row.attr_vals.splice(i, 1)
        this.saveAttrVals(row)
      },
    },
    computed: {
      //如果按钮需要被禁用则返回true 否则返回false
      isBtnDisabled() {
        if (this.selectedCateKeys.length !== 3) {
          return true
        }
        return false
      },
      //当前选中的三级分类的id
      cateId() {
        if (this.selectedCateKeys.length === 3) {
          return this.selectedCateKeys[2]
        }
        return null
      },
      //动态计算标题的文本
      titleText() {
        if (this.activeName === "many") {
          return '动态参数'
        }
        return '静态属性'
      },
    },
  }

</script>

<style lang="less" scoped>
  .cat_opt {
    margin: 15px 0;
  }

  .el-tag {
    margin: 10px;
  }

  .input-new-tag {
    width: 150px;
  }

</style>
