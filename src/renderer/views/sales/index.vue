<template>
  <div class="zlz-container">
    <div class="zlz-header">
      <el-form ref="form" :inline="true" label-position="left" :model="form" @submit.native.prevent>
        <el-form-item label="订单时间：">
          <el-date-picker v-model="form.time" type="datetimerange" :picker-options="pickerOptions" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmitQuery">查询</el-button>
          <input ref="directoryInput" type="file" hidden @change="onFileChange" webkitdirectory>
          <el-button type="primary" @click="onSubmitExport">导出</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="zlz-content" ref="zlzContent">
      <el-table :data="ordersData" :max-height="computedContentHeight" border stripe>
        <el-table-column prop="order_no" label="订单编号" width="180px"></el-table-column>
        <el-table-column prop="member_id" label="会员卡号" width="100px"></el-table-column>
        <el-table-column prop="member_type" label="会员信息" width="100px"></el-table-column>
        <el-table-column prop="money" label="消费金额" width="100px"></el-table-column>
        <el-table-column prop="category" label="消费类型" width="100px"></el-table-column>
        <el-table-column prop="status" label="状态" width="80px" :formatter="formatterStatus"></el-table-column>
        <el-table-column prop="created" label="时间" width="160px" :formatter="formatterTimestamp"></el-table-column>
        <el-table-column prop="remark" label="备注"></el-table-column>
        <el-table-column label="操作" width="150px">
          <template slot-scope="scope">
            <el-button size="mini" @click="editOrder(scope.$index, scope.row)">编辑</el-button>
            <el-button v-show="scope.row.status !== 2" size="mini" type="danger" @click="repealOrder(scope.$index, scope.row)">撤单</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="zlz-footer">
      <div class="footer-money">
        &nbsp;&nbsp;单据金额总计：<span>￥{{ordersTotalMoney}}</span>&nbsp;&nbsp;&nbsp;&nbsp;单据应收总计：￥<span>{{ordersActualMoney}}</span>
      </div>
      <div class="footer-page">
        <el-pagination @current-change="handleCurrentChange" current-page.sync="ordersCurrentPage" :page-size="ordersPageSize" layout="total, prev, pager, next" :total="ordersCount"></el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import SqliteUtils from '@/utils/sqlite'
import { formatTimestamp, getDayStartDate, getWeekStartDate, getMonthStartDate, getQuarterStartDate } from '@/utils/index'
import XLSX from 'xlsx'

export default {
  name: 'index',
  data () {
    return {
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一天',
            onClick (picker) {
              picker.$emit('pick', [getDayStartDate(), new Date()])
            }
          },
          {
            text: '最近一周',
            onClick (picker) {
              picker.$emit('pick', [getWeekStartDate(), new Date()])
            }
          },
          {
            text: '最近一个月',
            onClick (picker) {
              picker.$emit('pick', [getMonthStartDate(), new Date()])
            }
          },
          {
            text: '最近三个月',
            onClick (picker) {
              picker.$emit('pick', [getQuarterStartDate, new Date()])
            }
          }
        ]
      },
      form: {
        time: null
      },
      exportLoading: false,
      contentHeight: 0,
      ordersCount: 0,
      ordersPageSize: 10,
      ordersCurrentPage: 1,
      ordersDataLoading: false,
      ordersData: [],
      ordersTotalMoney: 0,
      ordersActualMoney: 0
    }
  },
  computed: {
    computedContentHeight () {
      return this.contentHeight
    }
  },
  created () {
    this.updateOrdersData(true)
  },
  mounted () {
    this.listenResize()
    window.addEventListener('resize', this.listenResize)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.listenResize)
  },
  methods: {
    // 提交条件查询
    onSubmitQuery () {
      this.updateOrdersData(true)
    },
    // 文件路径
    onFileChange (event) {
      if (!this.exportLoading) {
        this.exportLoading = true
        const { files } = event.target
        if (files === null || files.length === 0) {
          console.log('get file path error')
          return null
        }
        let fileName = formatTimestamp((new Date()).getTime(), 'yyyyMMddhhmmss') + '单据报表.xlsx'
        let filePath = files[0].path + '/' + fileName
        this.exportOrdersFile(filePath)
        // 解决选择重复目录 onFileChange 不响应的问题以及避免重复点击问题
        this.$refs.directoryInput.value = ''
        this.exportLoading = false
        this.$message({message: `导出数据到EXCEL成功`, type: 'success'})
      }
    },
    // 提交条件查询
    onSubmitExport () {
      this.$refs.directoryInput.click()
    },
    async exportOrdersFile (file) {
      // 处理时间段
      let sqlTimeWhere = ''
      if (this.form.time != null && this.form.time.length === 2) {
        let startTime = this.form.time[0].valueOf()
        let endTime = this.form.time[1].valueOf()
        sqlTimeWhere = ` created >= ${startTime} and created <= ${endTime}`
      }
      let ordersCount = await this.getOrdersCount(sqlTimeWhere)
      if (ordersCount === 0) {
        this.$message({message: `没有选择的单据，请重新选择筛选条件！`, type: 'warning'})
      }
      if (ordersCount >= 60000) {
        this.$message({message: `选择的单据数量太多了，请重新选择筛选条件！`, type: 'warning'})
      }

      let sqlStr = ''
      if (sqlTimeWhere === '') {
        sqlStr = `SELECT * FROM orders order by id desc;`
      } else {
        sqlStr = `SELECT * FROM orders where${sqlTimeWhere} order by id desc;`
      }
      let ordersData = await this.getOrdersData(sqlStr)
      let ordersExcel = []
      ordersExcel.push(Array.from(Object.keys(ordersData[0])))
      ordersData.forEach(value => {
        let orderData = Object.assign({}, value)
        orderData.status = orderData.status === 1 ? '已完成' : '已撤单'
        orderData.updated = formatTimestamp(orderData.updated)
        orderData.created = formatTimestamp(orderData.created)
        let orderData2 = Array.from(Object.values(orderData))
        ordersExcel.push(orderData2)
      })
      /* json 数组转换 excel */
      let worksheet = XLSX.utils.aoa_to_sheet(ordersExcel)
      let workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'sheet1')

      /* 生成文件，导出 */
      XLSX.writeFile(workbook, file)
    },
    // 监听客户端尺寸
    listenResize () {
      this.$nextTick(() => {
        this.contentHeight = document.documentElement.clientHeight - 50 - 60 - 40 - 20
      })
    },
    // 格式化时间戳
    formatterTimestamp (row, column) {
      const timestamp = row[column.property]
      return formatTimestamp(timestamp)
    },
    // 格式化状态
    formatterStatus (row, column) {
      const status = row[column.property]
      if (status === 1) {
        return '已完成'
      } else if (status === 2) {
        return '已撤单'
      } else {
        return '未知'
      }
    },
    // 响应页码点击事件
    handleCurrentChange (val) {
      this.ordersCurrentPage = val
      this.updateOrdersData(false)
    },
    // 更新单据数据
    async updateOrdersData (queryChange) {
      if (!this.ordersDataLoading) {
        this.ordersDataLoading = true
        this.ordersData = []
        this.ordersTotalMoney = 0
        this.ordersActualMoney = 0
        // 处理时间段
        let sqlTimeWhere = ''
        if (this.form.time != null && this.form.time.length === 2) {
          let startTime = this.form.time[0].valueOf()
          let endTime = this.form.time[1].valueOf()
          sqlTimeWhere = ` created >= ${startTime} and created <= ${endTime}`
        }
        // 获取满足条件的记录数
        if (queryChange) {
          this.ordersCount = await this.getOrdersCount(sqlTimeWhere)
        }
        if (this.ordersCount > 0) {
          if ((this.ordersCurrentPage - 1) * this.ordersPageSize > this.ordersCount) {
            this.ordersCurrentPage = 1
          }
          let limitValue = (this.ordersCurrentPage - 1) * this.ordersPageSize
          // 获取单据一页数据
          let sqlSubStr = ''
          let sqlStr = ''
          if (sqlTimeWhere === '') {
            sqlSubStr = `SELECT id FROM orders order by id desc limit ${limitValue}, 1`
            sqlStr = `SELECT * FROM orders where id <= (${sqlSubStr}) order by id desc limit ${this.ordersPageSize};`
          } else {
            sqlSubStr = `SELECT id FROM orders where${sqlTimeWhere} order by id desc limit ${limitValue}, 1`
            sqlStr = `SELECT * FROM orders where${sqlTimeWhere} and id <= (${sqlSubStr}) order by id desc limit ${this.ordersPageSize};`
          }
          this.ordersData = await this.getOrdersData(sqlStr)
          if (queryChange) {
            // 获取满足条件的单据金额和应收金额
            let data = await this.getOrdersMoney(sqlTimeWhere)
            if (data && data.length === 2) {
              this.ordersTotalMoney = data[0]
              this.ordersActualMoney = data[1]
            }
          }
        } else {
          console.log('orders count <= 0')
        }
        this.ordersDataLoading = false
      }
    },
    // 获取单据数据
    getOrdersData (sqlStr) {
      return new Promise((resolve, reject) => {
        let sql = SqliteUtils.getInstance()
        // console.log(sqlStr)
        sql.all(sqlStr)
          .then(data => {
            resolve(data)
          })
          .catch(error => {
            console.log('get orders page：' + error)
            resolve([])
          })
      })
    },
    // 获取单据数量
    getOrdersCount (where) {
      return new Promise((resolve, reject) => {
        let sql = SqliteUtils.getInstance()
        let sqlStr = ''
        if (where === '') {
          sqlStr = `SELECT count(*) as count FROM orders;`
        } else {
          sqlStr = `SELECT count(*) as count FROM orders where${where};`
        }
        // console.log(sqlStr)
        sql.get(sqlStr)
          .then(data => {
            resolve(data.count)
          })
          .catch(error => {
            console.log('get orders count：' + error)
            resolve(0)
          })
      })
    },
    // 获取单据金额
    getOrdersMoney (where) {
      return new Promise((resolve, reject) => {
        let sql = SqliteUtils.getInstance()
        let sqlStr = ''
        if (where === '') {
          sqlStr = `SELECT status, COUNT(*) as count, SUM(money) as money FROM orders group by status;`
        } else {
          sqlStr = `SELECT status, COUNT(*) as count, SUM(money) as money FROM orders where${where} group by status;`
        }
        // console.log(sqlStr)
        sql.all(sqlStr)
          .then(data => {
            let ordersStatus1 = data.filter(data => data.status === 1)
            let ordersStatus2 = data.filter(data => data.status === 2)
            if (ordersStatus1.length > 0) {
              let moneyStatus1 = ordersStatus1[0].money
              let moneyStatus2 = 0
              if (ordersStatus2.length > 0) {
                moneyStatus2 = moneyStatus1 - ordersStatus2[0].money
              } else {
                moneyStatus2 = moneyStatus1
              }
              resolve([moneyStatus1, moneyStatus2])
            } else {
              resolve(null)
            }
            resolve(data)
          })
          .catch(error => {
            console.log('get orders money：' + error)
            resolve(null)
          })
      })
    },
    // 编辑单据
    editOrder () {
    },
    // 撤销单据
    repealOrder (index, row) {
      /* eslint-disable */
      const {id, order_no} = row
      let sqlStr = `UPDATE orders SET status = 2 where id = ${id};`
      let sql = SqliteUtils.getInstance()
      sql.run(sqlStr)
        .then(() => {
          this.$message({message: `单号：${order_no} 成功撤单！`, type: 'success'})
          this.updateOrdersData(true)
        })
        .catch((e) => {
          console.log(e)
          this.$message({message: `单号：${order_no} 撤单失败！`, type: 'warning'})
        })
      /* eslint-disable */
    }
  }
}
</script>

<style lang="scss" scoped>
  .zlz-container {
    display: flex;
    flex-direction: column;
    padding: 20px 15px 0 15px;
    .zlz-header {
      height: 60px;
    }
    .zlz-footer {
      height: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .footer-money {
        font-size: 12px;
        span {
          color: red;
        }
      }
    }
  }
</style>
