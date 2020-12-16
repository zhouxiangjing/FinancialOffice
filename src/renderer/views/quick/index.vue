<template>
  <div class="app-container quick-container">
    <el-form ref="form" :model="form" label-width="80px">
      <el-form-item label="订单号">
        <el-input v-model="form.id" :readonly="true"></el-input>
      </el-form-item>
      <el-form-item label="消费金额" prop="money" :rules="[{ required: true, message: '金额不能为空'}, { type: 'number', message: '金额必须为数字值'}]">
        <el-input placeholder="请输入内容" v-model.number="form.money">
          <template slot="prepend">￥</template>
          <template slot="append">元</template>
        </el-input>
      </el-form-item>
      <el-form-item label="消费类型">
        <el-select v-model="form.type" placeholder="请选择">
          <el-option v-for="value in types" :key="value" :label="value" :value="value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="消费备注">
        <el-input type="textarea" v-model="form.remark"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onQuickSubmit">订单结算</el-button>
        <el-button>取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { generateOrderNumber } from '@/utils'
import SqliteUtils from '@/utils/sqlite'

export default {
  name: 'quick',
  data () {
    return {
      form: {
        id: generateOrderNumber(),
        money: 0,
        type: '理发',
        remark: ''
      },
      types: ['理发', '染烫', '其他']
    }
  },
  methods: {
    onQuickSubmit () {
      let orders = {
        'order_no': this.form.id,
        'member_id': '0000',
        'member_type': '散客',
        'money': this.form.money,
        'category': this.form.type,
        'status': 1,
        'remark': this.form.remark,
        'created': (new Date()).valueOf(),
        'updated': (new Date()).valueOf()
      }
      let sqlValues = Object.keys(orders).map((key) => { return typeof orders[key] === 'string' ? '\'' + orders[key] + '\'' : orders[key] }).join(',')
      let sqlStr = `INSERT INTO orders VALUES (NULL, ${sqlValues});`
      let sql = SqliteUtils.getInstance()
      sql.run(sqlStr)
        .then(() => {
          this.form = {
            id: generateOrderNumber(),
            money: 0,
            type: '理发',
            remark: ''
          }
          this.$message({message: `单号：${orders['order_no']} 成功结算！`, type: 'success'})
        })
        .catch((e) => {
          console.log(e)
          this.$message({message: `单号：${orders['order_no']} 结算失败！`, type: 'warning'})
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.quick-container {

}
</style>
