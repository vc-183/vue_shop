<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页
      </el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色 </el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="(item1,i1) in scope.row.children"
                    :class="['vcenter','bdbottom', i1===0? 'bdtop ' :'' ]"
                    :key="item1.id">
              <!--渲染一级权限  -->
              <el-col :span="5">
                <el-tag closable
                        @close="removeRightById(scope.row,item1.id)">
                  {{item1.authName}}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--渲染二级和三级权限  -->
              <el-col :span="19">
                <!-- 通过for循环嵌套渲染二级权限 -->
                <el-row v-for="(item2,i2) in item1.children"
                        :key="item2.id"
                        :class="[ 'vcenter',i2===0? '' :'bdtop' ]">
                  <el-col :span="6">
                    <el-tag type="success" closable
                            @close="removeRightById(scope.row,item2.id)">
                      {{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning"
                            v-for="item3 in item2.children"
                            :key="item3.id" closable
                            @close="removeRightById(scope.row,item3.id)">
                      {{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName">
        </el-table-column>
        <el-table-column label="角色描述" prop="roleDesc">
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 编辑按钮 -->
            <el-button type="primary" icon="el-icon-edit"
                       size="mini"
                       @click="showEditDialog(scope.row.id)">
              编辑
            </el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete"
                       size="mini"
                       @click="removeRolesById(scope.row.id)">
              删除
            </el-button>
            <!-- 分配权限按钮 -->
            <el-button type="warning" icon="el-icon-setting"
                       size="mini"
                       @click="showSetRightDialog(scope.row)">
              分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>


    <!-- 修改角色的对话框 -->
    <el-dialog title="修改角色"
               :visible.sync="editDialogVisible" width="50%"
               @close="editDialogClosed">
      <el-form :model="editForm" ref="editFormRef"
               label-width="70px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName">
          </el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消
        </el-button>
        <el-button type="primary" @click="editRolesInfo">确 定
        </el-button>
      </span>
    </el-dialog>
    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限"
               :visible.sync="showSetRightDialogVisible"
               width="50%" @close="setRightDialogClosed">
      <!-- 树形控件 -->
      <el-tree :data="rightsList" show-checkbox
               :default-expand-all="true" node-key="id"
               :default-checked-keys="defkeys" ref="treeRef"
               :props="treeProps">
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button
                   @click="showSetRightDialogVisible = false">
          取 消
        </el-button>
        <el-button type="primary" @click="allotRights">确 定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        //所有角色列表数据
        rolesList: [],
        // 控制修改角色对话框的显示与隐藏
        editDialogVisible: false,
        // 查询到的角色信息对象
        editForm: {},
        //控制分配权限对话框的显示与隐藏
        showSetRightDialogVisible: false,
        //所有权限的数据
        rightsList: {},
        //树形控件的属性对象
        treeProps: {
          label: 'authName',
          children: 'children'
        },
        //默认勾选的节点的Id数值组
        defkeys: [],
        //当前即将分配权限的角色id
        roleId: '',
      }
    },
    created() {
      //获取所有列表数据
      this.getRolesList()
    },
    methods: {
      //获取所有角色的数据
      async getRolesList() {
        const {
          data: res
        } = await this.$http.get('roles')
        if (res.meta.status !== 200) {
          this.$message.error('获取角色列表失败')
        }
        this.rolesList = res.data
      },
      // 监听修改编辑对话框的关闭事件
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      // 展示编辑角色的对话框
      async showEditDialog(id) {
        console.log(id)
        const {
          data: res
        } = await this.$http.get('roles/' + id)
        console.log(res);

        if (res.meta.status !== 200) {
          return this.$message.error('查询用户信息失败！')
        }
        this.editForm = res.data
        this.editDialogVisible = true
      },
      //获取修改角色的信息
      editRolesInfo() {
        console.log(this);
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          const {
            data: res
          } = await this.$http.put('roles/' + this
            .editForm.roleId, {
              id: this
                .editForm.roleId,
              roleName: this
                .editForm.roleName,
              roleDesc: this
                .editForm.roleDesc
            })
          if (res.meta.status !== 200) {
            return this.$message.error('更新角色信息失败！')
          }
          // 关闭对话框
          this.editDialogVisible = false
          // 刷新数据列表
          this.getRolesList()
          // 提示修改成功
          this.$message.success('更新角色信息成功！')
        })
      },
      //通过ID删除角色
      async removeRolesById(id) {
        // 弹框询问用户是否删除数据
        const confirmResult = await this.$confirm(
          '此操作将永久删除该权限, 是否继续?',
          '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).catch(err => err)
        // 如果用户确认删除，则返回值为字符串 confirm
        // 如果用户取消了删除，则返回值为字符串 cancel
        // console.log(confirmResult)
        if (confirmResult !== "confirm") {
          return this.$message.info('已取消删除')
        }
        const {
          data: res
        } = await this.$http.delete('roles/' + id)
        if (res.meta.status !== 200) {
          this.$message.error('删除角色失败')
        }
        this.getRolesList()
      },
      //通过ID删除对id应权限
      async removeRightById(role, rightId) {
        // 弹框询问用户是否删除数据
        console.log("----");

        console.log(role.id, rightId);

        const confirmResult = await this.$confirm(
          '该操作将删除该权限, 是否继续?',
          '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).catch(err => err)
        // 如果用户确认删除，则返回值为字符串 confirm
        // 如果用户取消了删除，则返回值为字符串 cancel
        if (confirmResult !== "confirm") {
          return this.$message.info('已取消删除')
        }
        const {
          data: res
        } = await this.$http.delete(
          `roles/${role.id}/rights/${rightId}`)
        if (res.meta.status !== 200) {
          this.$message.error('删除权限失败')
        }
        //防止页面刷新
        role.children = res.data
      },
      //展示分配权限的对话框
      async showSetRightDialog(role) {
        this.roleId = role.id
        //获取所有权限列表
        const {
          data: res
        } = await this.$http.get('rights/tree')
        if (res.meta.status !== 200) {
          return this.$message.error('获取权限数据失败')
        }
        //把获取到的权限数据保存到data中
        this.rightsList = res.data
        //递归获取三级节点的Id
        this.getLeafKeys(role, this.defkeys)
        this.showSetRightDialogVisible = true
      },
      //通过递归的形式,获取角色瞎所有三级权限的id,并保存到defKeys数组中
      getLeafKeys(node, arr) {
        //如果当前node节点不包含children属性,则是三级节点
        if (!node.children) {
          return arr.push(node.id)
        }
        node.children.forEach(item => {
          this.getLeafKeys(item, arr)
        })
      },
      //监听分配权限对话框的关闭事件
      setRightDialogClosed() {
        this.defkeys = []
      },
      //点击为角色分配权限
      async allotRights() {
        const keys = [...this.$refs.treeRef
          .getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys()
        ]
        const idStr = keys.join(',')
        const {
          data: res
        } = await this.$http.post(
          `roles/${this.roleId}/rights`, {
            rids: idStr
          })
        if (res.meta.status !== 200) {
          return this.$message.error('分配权限失败')
        }
        this.$message.success('分配权限成功')
        this.getRolesList()
        this.showSetRightDialogVisible = false
      },

    },
  }

</script>

<style lang="less" scope>
  .bdtop {
    border-top: 1px solid #eee;
  }

  .bdbottom {
    border-bottom: 1px solid #eee;
  }

  .el-tag {
    margin: 7px;
  }

  .vcenter {
    display: flex;
    align-items: center;
  }

</style>
