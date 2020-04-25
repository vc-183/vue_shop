<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页
      </el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加分类按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary"
                     @click="showAddCateDialog">添加分类
          </el-button>
        </el-col>
      </el-row>

      <!--商品分类区域 -->
      <tree-table class="treetable" :data="catelist"
                  :columns="columns" :show-index="true"
                  index-text="#" border
                  :selection-type="false"
                  :show-row-hover="false"
                  :expand-type="false">
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">

          <i class="el-icon-success"
             v-if="scope.row.cat_deleted === false"
             style="color:lightgreen;"></i>
          <i class="el-icon-error" v-else
             style="color:red;"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini"
                  v-if="scope.row.cat_level ===0">一级
          </el-tag>
          <el-tag size="mini" type="success"
                  v-else-if="scope.row.cat_level ===1">二级
          </el-tag>
          <el-tag size="mini" type="warning" v-else>三级
          </el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button size="mini" type="primary"
                     icon="el-icon-edit" @click="editCateDialog(scope.row.cat_name,
                     scope.row.cat_id)">
            编辑
          </el-button>
          <el-button size="mini" type="danger"
                     icon="el-icon-delete"
                     @click="removeCateById(scope.row.cat_id)">
            删除
          </el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="queryInfo.pagenum"
                     :page-sizes="[ 5, 10]"
                     :page-size="queryInfo.pagesize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog title="添加分类"
               :visible.sync="addCateDialogVisible"
               width="50%" @close="addCateDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addCateForm"
               :rules="addCateFormRules"
               ref="addCateFormRef" label-width="90px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name">
          </el-input>
        </el-form-item>
        <!-- options 用来指定数据源 -->
        <!-- props 用来指定配置对象 -->
        <el-form-item label="父级分类">
          <el-cascader v-model="selectedKeys"
                       :options="parentCateList"
                       :props="cascadeProps" clearable
                       @change="parentCateChange"
                       collapse-tags>
          </el-cascader>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消
        </el-button>
        <el-button type="primary" @click="addCate">确 定
        </el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类的对话框 -->
    <el-dialog title="修改分类"
               :visible.sync="editCateDialogVisible"
               width="50%">
      <!-- 内容主体区域 -->
      <el-form :model="editCateForm" ref="editCateFormRef"
               label-width="90px">
        <el-form-item label="修改名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name">
          </el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取
          消
        </el-button>
        <el-button type="primary" @click="editCate">确 定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        //获取商品分类数据 
        catelist: [],
        //查询条件
        queryInfo: {
          type: 3,
          pagenum: 1,
          pagesize: 5,
        },
        //总数据条数
        total: 0,
        //为table指定列的定义
        columns: [{
          label: '分类名称',
          prop: 'cat_name',
        }, {
          label: '是否有效',
          //表示将当前列定义为模板列
          type: 'template',
          //表示当前这一列使用的模板名称
          template: 'isok'
        }, {
          label: '排序',
          //表示将当前列定义为模板列
          type: 'template',
          //表示当前这一列使用的模板名称
          template: 'order'
        }, {
          label: '操作',
          //表示将当前列定义为模板列
          type: 'template',
          //表示当前这一列使用的模板名称
          template: 'opt'
        }],
        //控制添加分类对话框的显示与隐藏
        addCateDialogVisible: false,
        //添加分类表单数据对象
        addCateForm: {
          //将要添加分类的名称
          cat_name: '',
          //将要添加分类的父id
          cat_pid: 0,
          //将要添加分类的等级 默认的是一级分类
          cat_level: 0,
        },
        //添加分类表单的验证规则对象
        addCateFormRules: {
          cat_name: [{
            required: true,
            message: '请输入分类名称',
            trigger: 'blur'
          }]
        },
        //父级分类的列表
        parentCateList: [],
        //指定级联选择器的配置对象
        cascadeProps: {
          value: 'cat_id',
          label: 'cat_name',
          children: 'children',
          checkStrictly: true,
          expandTrigger:'hover'
        },
        //选中的父级分类的id数组
        selectedKeys: [],
        //控制编辑对话框的显示与隐藏
        editCateDialogVisible: false,
        //编辑分类表单数据对象
        editCateForm: {
          cat_name: '',
          cat_id: ''
        },
      }
    },
    created() {
      //获取所有商品分类数据列表
      this.getCateList()
    },
    methods: {
      //获取所有商品分类数据列表
      async getCateList() {
        const {
          data: res
        } = await this.$http.get('categories', {
          params: this.queryInfo
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品分类失败')
        }
        console.log(res);
        //把数据列表赋值给catelist
        this.catelist = res.data.result
        //为总数据条数赋值
        this.total = res.data.total
        console.log(this.catelist)

      },
      //监听pagesize发生改变
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        this.getCateList()
      },
      //监听pagenum发生改变
      handleCurrentChange(newpage) {
        this.queryInfo.pagenum = newpage
        this.getCateList()
      },
      //点击按钮展示添加分类的对话框
      showAddCateDialog() {
        //先获取父级分类的数据列表
        this.getParentCateList()
        //再展示对话框
        this.addCateDialogVisible = true

      },
      //获取父级分类的数据列表
      async getParentCateList() {
        const {
          data: res
        } = await this.$http.get('categories', {
          params: {
            type: 2
          }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取父级数据失败')
        }
        this.parentCateList = res.data

      },
      //监听选择的改变
      parentCateChange() {
        console.log(this.selectedKeys);
        //如果selectedKeys数组的长度大于0,证明选中父级分类
        //反之,就说明没有选中任何父级分类
        if (this.selectedKeys.length > 0) {
          //父级分类的id
          this.addCateForm.cat_pid = this.selectedKeys[this
            .selectedKeys.length - 1]
          //为当前分类的等级赋值
          this.addCateForm.cat_level = this.selectedKeys
            .length
          return
        } else {
          //父级分类的id
          this.addCateForm.cat_pid = 0
          //为当前分类的等级赋值
          this.addCateForm.cat_level = 0
        }
      },
      //点击按钮添加新的分类
      addCate() {
        //console.log(this.$refs.addCateFormRef);

        this.$refs.addCateFormRef.validate(async valid => {
          if (!valid) return

          const {
            data: res
          } = await this.$http.post('categories', this
            .addCateForm)
          if (res.meta.status !== 201) {
            this.$message.error('添加分类失败')
          }
          this.$message.success('添加分类成功')
          this.getCateList()
          this.addCateDialogVisible = false
        })

      },
      //监听对话框的关闭事件,重置表单的数据
      addCateDialogClosed() {
        //重置表单的数据
        this.$refs.addCateFormRef.resetFields()
        this.selectedKeys = []
        //清空父级分类的id
        this.addCateForm.cat_pid = 0
        //清空当前分类的等级
        this.addCateForm.cat_level = 0
      },
      //点击按钮展示编辑对话框
      editCateDialog(name, id) {
        this.editCateForm.cat_name = name
        this.editCateForm.cat_id = id
        this.editCateDialogVisible = true
      },
      //监听编辑对话框的确定事件
      async editCate() {
        const {
          data: res
        } = await this.$http.put('categories/' + this
          .editCateForm
          .cat_id, {
            cat_name: this.editCateForm.cat_name
          })
        if (res.meta.status !== 200)
          return this.$message.error('修改分类失败')

        this.$message.success('修改分类成功')
        this.getCateList()
        this.editCateDialogVisible = false
      },
      //通过id删除分类
      async removeCateById(id) {
        // 弹框询问用户是否删除数据
        const confirmResult = await this.$confirm(
          '此操作将永久删除该分类, 是否继续?',
          '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).catch(err => err)
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消删除')
        }
        const {
          data: res
        } = await this.$http.delete('categories/' + id)

        if (res.meta.status !== 200) {
          return this.$message.error('删除用户失败！')
        }
        this.$message.success('删除用户成功！')
        this.getCateList()
      },
    }
  }

</script>
<style lang="less" scoped>
  .treetable {
    margin-top: 15px;
  }

  .el-cascader {
    width: 100%;
  }

</style>
