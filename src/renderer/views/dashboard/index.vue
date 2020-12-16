<template>
  <div class="dashboard-container">
    <panel-group @handleSetLineChartData="handleSetLineChartData"/>
    <report-table></report-table>
  </div>
</template>

<script>
import PanelGroup from './components/PanelGroup'
import ReportTable from './components/ReportTable'

export default {
  name: 'dashboard',
  components: {
    PanelGroup,
    ReportTable
  },
  methods: {
    handleSetLineChartData (type) {
      console.log(type)
      if (type === 'quick') {
        this.$router.push('/consumption/quick')
      } else if (type === 'orders') {
        this.$router.push('/statement/sales_order')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .dashboard {
    &-container {
      margin: 30px;
    }
    &-text {
      font-size: 30px;
      line-height: 46px;
    }
  }
</style>
