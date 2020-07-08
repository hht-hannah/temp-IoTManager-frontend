<template>
  <div>
    <el-row>
      <el-col :span="12">
        <div class="alarm-container"></div>
      </el-col>
      <el-col :span="12">
        <div class="status-container"></div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import echarts from "echarts";
import {
  getNoticeAlarmInfoAmount,
  getDeviceDataAmount,
  getSeriousAlarmInfoAmount,
  getVerySeriousAlarmInfoAmount,
  getDashboardDeviceStatus
} from "../../api/api";
export default {
  name: "DashboardStatistics",
  data() {
    return {
      noticeAlarmInfoAmount: 0,
      seriousAlarmInfoAmount: 0,
      verySeriousAlarmInfoAmount: 0,
      deviceDataAmount: 0,
      intervalId: null,
      alarmOption: {
        title: {
          text: "告警等级",
          x: "center"
        },
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b}: {c} ({d}%)"
        },
        legend: {
          orient: "vertical",
          x: "center",
          top: "33%",
          textStyle: {
            fontSize: 12
          },
          data: ["Info", "Warning", "Critical"]
        },
        color: [ "#3399ff", "#33bbff" , "#ffdd33" ],
        series: []
      },
      statusOption: {
        title: {
          text: "设备状态",
          x: "center"
        },
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b}: {c} ({d}%)"
        },
        legend: {
          orient: "vertical",
          x: "center",
          top: "33%",
          textStyle: {
            fontSize: 12
          },
          data: ["Info", "Warning", "Critical"]
        },
        color: [ "#3399ff", "#33bbff" , "#ffdd33" ],
        series: []
      }
    };
  },
  async created() {
    this.dataRefreh();
  },
  methods: {
    dataRefreh() {
      // 计时器正在进行中，退出函数
      if (this.intervalId != null) {
        return;
      }
      // 计时器为空，操作
      this.intervalId = setInterval(async () => {
        await this.initAlarmChart();
        await this.initStatusChart();
      }, 5000);
    },
    clear() {
      clearInterval(this.intervalId); //清除计时器
      this.intervalId = null; //设置为null
    },
    async initAlarmChart() {
      this.chart1 = echarts.init(
        document.getElementsByClassName("alarm-container")[0]
      );
      // 把配置和数据放这里
      this.noticeAlarmInfoAmount = (await getNoticeAlarmInfoAmount()).data.d;
      this.seriousAlarmInfoAmount = (await getSeriousAlarmInfoAmount()).data.d;
      this.verySeriousAlarmInfoAmount = (
        await getVerySeriousAlarmInfoAmount()
      ).data.d;
      this.alarmOption.series = [
        {
          name: "告警等级",
          type: "pie",
          left: 10,
          radius: ["50%", "70%"],
          avoidLabelOverlap: true,
          label: {
              show: false,
          },
          labelLine: {
              show: false
          },
          data: [
            { value: this.verySeriousAlarmInfoAmount, name: "Critical" },
            { value: this.seriousAlarmInfoAmount, name: "Warning" },
            { value: this.noticeAlarmInfoAmount, name: "Info" }
          ]
        }
      ];
      this.chart1.setOption(this.alarmOption);
    },
    async initStatusChart() {
      var vm = this;
      this.chart2 = echarts.init(
        document.getElementsByClassName("status-container")[0]
      );
      window.onresize = function() {
        vm.chart1.resize();
        vm.chart2.resize();
      };
      // 把配置和数据放这里
      const statusData = (await getDashboardDeviceStatus()).data.d;
      this.statusOption.series = [
        {
          name: "设备状态",
          type: "pie",
          radius: ["50%", "70%"],
          avoidLabelOverlap: true,
          label: {
            normal: {
              show: false,
              position: "center"
            },
            emphasis: {
              show: false,
            }
          },
          labelLine: {
            normal: {
              show: false
            }
          },
          data: [
            { value: statusData["critical"], name: "Critical" },
            { value: statusData["warning"], name: "Warning" },
            { value: statusData["info"], name: "Info" }
          ]
        }
      ];
      this.chart2.setOption(this.statusOption);
    }
  },
  destroyed() {
    this.clear();
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/scss/variaties";
.alarm-container,
.status-container {
  height: 250px;
}
</style>
