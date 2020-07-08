<template>
  <div class="dashboard-alarm-container">
    <el-table :data="tableData" max-height="250" row-class-name="dashboard-alarm-row">
      <el-table-column prop="timestamp" label="告警时间" width="150%"></el-table-column>
      <el-table-column prop="deviceId" label="设备编号"></el-table-column>
      <el-table-column prop="indexName" label="数据名称"></el-table-column>
      <el-table-column prop="indexValue" label="告警数值"></el-table-column>
      <el-table-column prop="thresholdValue" label="告警阈值"></el-table-column>
      <el-table-column prop="severity" label="告警等级"></el-table-column>
      <!--<el-table-column-->
      <!--prop="status"-->
      <!--label="处理状态"-->
      <!--width="120">-->
      <!--</el-table-column>-->
      <!--<el-table-column-->
      <!--prop="city"-->
      <!--label="城市"-->
      <!--width="120">-->
      <!--</el-table-column>-->
      <!--<el-table-column-->
      <!--prop="factory"-->
      <!--label="工厂"-->
      <!--width="120">-->
      <!--</el-table-column>-->
      <!--<el-table-column-->
      <!--prop="department"-->
      <!--:label="GLOBAL.thirdLevel"-->
      <!--width="120">-->
      <!--</el-table-column>-->
      <!--<el-table-column-->
      <!--fixed="right"-->
      <!--label="操作"-->
      <!--width="100">-->
      <!--<template slot-scope="scope">-->
      <!--<el-button @click="handleClick(scope.row)" type="text" size="small">查看</el-button>-->
      <!--<el-button type="text" size="small">编辑</el-button>-->
      <!--</template>-->
      <!--</el-table-column>-->
    </el-table>
  </div>
</template>

<script>
import { getDashboardAlarmInfo } from "../../api/api";

export default {
  name: "DashboardAlarmHistory",
  methods: {
    dataRefreh() {
      // 计时器正在进行中，退出函数
      if (this.intervalId != null) {
        return;
      }
      // 计时器为空，操作
      this.intervalId = setInterval( async() => {
        this.tableData = (await getDashboardAlarmInfo()).data.d; //加载数据函数
      }, 5000);
    }, 
    clear() {
      clearInterval(this.intervalId); //清除计时器
      this.intervalId = null; //设置为null
    },
  },
  async created() {
     this.tableData = (await getDashboardAlarmInfo()).data.d;
     this.dataRefreh();
  },
  destroyed() {
    this.clear();
  },

  data() {
    return {
      tableData: [],
      intervalId: null
    };
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/scss/variaties";

</style>
