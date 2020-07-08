<template>
  <div>
    <el-row>
      <el-col :span="14">
        <el-card class="dashboard-row1">
          <div class="dashboard-card-header"> 地域分布 </div>
          <DashBoardMap></DashBoardMap>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card class="dashboard-row1">
          <div class="dashboard-card-header"> 实时数据 </div>
          <DashboardLineChart></DashboardLineChart>
        </el-card>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="14">
        <el-card class="dashboard-row2">
          <div class="dashboard-card-header"> 告警信息 </div>
          <DashboardAlarmHistory></DashboardAlarmHistory>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card class="dashboard-row2">
          <div class="dashboard-card-header"> 告警统计 </div>
          <DashboardStatistics></DashboardStatistics>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import DashBoardMap from "./DashboardMap";
import DashboardLineChart from "./DashboardLineChart";
import DashboardAlarmHistory from "./DashboardAlarmHistory";
import DashboardStatistics from "./DashboardStatistics";

export default {
  name: "DashBoard",
  components: {
    DashboardStatistics,
    DashboardAlarmHistory,
    DashboardLineChart,
    DashBoardMap
  }
};
</script>

<style scoped>
.dashboard-row1 {
  height: 524px;
}

.dashboard-row2 {
  height: 340px;
}

.el-card {
  margin: 10px;
}

.dashboard-card-header {
  font-size: 20px;
  font-weight: bold;
  border-left: 5px solid #409EFF ;
  padding: 15px 0 15px 20px;
  margin: -20px 0 5px -20px;
}
</style>
