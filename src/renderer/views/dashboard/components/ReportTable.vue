<template>
  <el-table :data="reportData" style="width: 100%" border>
    <el-table-column label="类目" width="120">
      <el-table-column prop="date" label="日期" width="120"></el-table-column>
    </el-table-column>
    <el-table-column prop="money1" label="销售额"></el-table-column>
    <el-table-column prop="money2" label="撤单"></el-table-column>
    <el-table-column prop="money" label="总收入"></el-table-column>
  </el-table>
</template>

<script>
export default {
  name: 'ReportTable',
  data () {
    return {
      reportData: [
        {
          date: '今天',
          money1: '0.00',
          money2: '0.00',
          money: '0.00'
        },
        {
          date: '昨天',
          money1: '0.00',
          money2: '0.00',
          money: '0.00'
        },
        {
          date: '本月',
          money1: '0.00',
          money2: '0.00',
          money: '0.00'
        }
      ]
    }
  }

}
</script>

<style lang="scss">
  .el-table thead.is-group th {
    background: none;
    padding: 0;
  }
  .el-table thead.is-group tr:first-of-type th:first-of-type, .el-table thead.is-group tr:last-of-type th:first-of-type {
    background: #ffffff !important;
  }
  .el-table thead.is-group tr:first-of-type th:first-of-type {
    border-bottom: none;
  }
  .el-table thead.is-group tr:first-of-type th:first-of-type div.cell {
    text-align: right;
  }
  .el-table thead.is-group tr:last-of-type th:first-of-type div.cell {
    text-align: left;
  }
  .el-table thead.is-group tr:first-of-type th:first-of-type:before {
    content: "";
    position: absolute;
    width: 1px;
    height: 64px;  //自行调整
    top: 0;
    left: 0;
    background-color: grey;
    opacity: 0.2;
    display: block;
    transform: rotate(-69deg);  //自行调整
    -webkit-transform-origin: top;
    transform-origin: top;
  }
  .el-table thead.is-group tr:last-of-type th:first-of-type:before {
    content: "";
    position: absolute;
    width: 1px;
    height: 64px;  //自行调整
    bottom: 0;
    right: 0;
    background-color: grey;
    opacity: 0.2;
    display: block;
    transform: rotate(-69deg);
    -webkit-transform-origin: bottom;
    transform-origin: bottom;
  }
</style>
