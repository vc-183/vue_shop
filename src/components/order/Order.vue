<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页
      </el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容"
                    v-model="queryInfo.query" clearable
                    @clear="getOrderList">
            <el-button slot="append" icon="el-icon-search"
                       @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 商品列表区域 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index" label="#"
                         width="40px">
        </el-table-column>
        <el-table-column label="订单编号" prop="order_number">
        </el-table-column>
        <el-table-column label="订单单价(元)" prop="order_price">
        </el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-button v-if="scope.row.pay_status==1"
                       size="mini" type="primary">已付款
            </el-button>
            <el-button v-else size="mini" type="danger">未付款
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"
                         width="70px">
        </el-table-column>

        <el-table-column label="下单时间" prop="create_time  ">
          <template slot-scope="scope">
            <!-- 格式化时间 -->
            {{scope.row.create_time |dataFormat}}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改地址按钮 -->
            <el-button type="primary" icon="el-icon-edit"
                       size="mini"
                       @click="showBox(scope.row)">
            </el-button>
            <!-- 物流进度按钮 -->
            <el-button type="success"
                       icon="el-icon-location" size="mini"
                       @click="showProgressBox">
            </el-button>
          </template>
        </el-table-column>
      </el-table>


      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="queryInfo.pagenum"
                     :page-sizes="[5, 10, 15]"
                     :page-size="queryInfo.pagesize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total" background>
      </el-pagination>
    </el-card>

    <!-- 添加地址的对话框 -->
    <el-dialog title="修改地址" :visible.sync="addressVisible"
               width="50%" @close="addressDialogClose">
      <!-- 内容主体区域 -->
      <el-form :model="addressForm"
               :rules="addressFormRules"
               ref="addressFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader v-model="addressForm.address1"
                       :options="cityData"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2">
          </el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消
        </el-button>
        <el-button type="primary"
                   @click="addressVisible = false">确 定
        </el-button>
      </span>
    </el-dialog>
    <!-- 展示物流进度的对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressVisible"
               width="50%">
      <!-- 时间线 -->
      <el-timeline>
        <el-timeline-item v-for="(activity, index) in progressInfo"
                          :key="index"
                          :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
  import cityData from './citydata.js'
  export default {
    data() {
      return {
        orderList: [],
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 10,
        },
        total: '',
        addressVisible: false,
        addressForm: {
          address1: [],
          address2: ''
        },
        addressFormRules: {
          address1: [{
            required: true,
            message: '请选择省世区/县',
            trigger: 'blur'
          }],
          address2: [{
            required: true,
            message: '请输入详细地址',
            trigger: 'blur'
          }]
        },
        cityData,
        progressVisible: false,
        //物流进度的数据
        progressInfo: [],
      }
    },
    created() {
      this.getOrderList()
    },
    methods: {
      async getOrderList() {
        const {
          data: res
        } = await this.$http.get('orders', {
          params: this.queryInfo
        })
        if (res.meta.status !== 200) {
          this.$message.error('获取订单列表失败')
        }
        this.total = res.data.total
        this.orderList = res.data.goods


      },
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        this.getOrderList()
      },
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        this.getOrderList()
      },
      //修改地址对话框
      showBox(id) {
        this.addressVisible = true
      },
      addressDialogClose() {
        this.$refs.addressFormRef.resetFields()
      },
      showProgressBox() {
        return this.$message.error('获取物流进度失败！')
      },
      
      /*  async showProgressBox() {
         const {
           data: res
         } = await this.$http.get(
           '/kuaidi/1106975712662')

         if (res.meta.status !== 200) {
           return this.$message.error('获取物流进度失败！')
         }
         this.progressInfo = res.data
         this.progressVisible = true
       }, */

    },
  }

</script>

<style lang="less" scoped>
  @import '../../plugins/timeline/timeline.css';
  @import '../../plugins/timeline-item/timeline-item.css';

  .el-cascader {
    width: 100%;
  }

</style>
