<template>
  <div class="dashboard-line-chart">
    <div class="dashboard-line-chart-selector-container">
      <el-row>
        <el-col :span="12">
          <span class="select-title">设备</span>
          <el-select
            v-model="tmpDeviceSelectorValue"
            filterable
            placeholder="请选择设备"
            @change="deviceChange"
          >
            <el-option
              v-for="item in deviceSelectorOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-col>
        <el-col :span="12">
          <span class="select-title">属性</span>
          <el-select
            v-model="tmpPropertySelectorValue"
            multiple
            collapse-tags
            placeholder="请选择属性"
            @change="searchLineChartData"
          >
            <el-option
              v-for="item in propertySelectorOptions"
              :key="item.fieldId"
              :label="item.fieldName"
              :value="item.fieldId"
            ></el-option>
          </el-select>
        </el-col>
      </el-row>
      <el-row>
        <el-button size="small" type="primary" v-if="lineChecked" @click="switchToBar">切换为柱状图</el-button>
        <el-button size="small" type="success" v-if="!lineChecked" @click="switchToLine">切换为折线图</el-button>
      </el-row>
      <!--      <el-button type="primary" plain @click="searchLineChartData">确认</el-button>-->
    </div>
    <div v-loading="chartLoading" class="dashboard-line-chart-container"></div>
  </div>
</template>

<script>
import echarts from "echarts";
import {
  getDevicesApi,
  getDeviceProperty,
  getDevicePropertyData,
  getFields,
  getAffiliateFields,
  getDeviceMultiPropertyData
} from "../../api/api";

export default {
  name: "DashboardLineChart",
  data() {
    return {
      chartLoading: false,
      lineChecked: true,
      chartType: "line",
      data: [],
      xAxisData: [],
      deviceSelectorOptions: [],
      deviceSelectorValue: "",
      tmpDeviceSelectorValue: "",
      propertySelectorOptions: [],
      propertySelectorValue: "",
      tmpPropertySelectorValue: [],
      chart: null,
      pollInterval: {},
      option: {
        title: {
          text: ""
        },
        tooltip: {},
        legend: {
          itemGap: 25,
          data: [
            // 'temperature', 'humidity'
          ]
        },
        toolbox: {
          show: true
          // feature: {
          //   magicType: {type: ['line', 'bar']},
          // }
        },
        xAxis: [
          {
            type: "category",
            boundaryGap: true,
            axisLine: {
              //坐标轴轴线相关设置。数学上的x轴
              show: true,
              lineStyle: {}
            },
            axisLabel: {
              //坐标轴刻度标签的相关设置
              textStyle: {
                margin: 15
              },
              interval: 0,
              rotate: 30
            },
            axisTick: {
              show: false
            },
            data: this.xAxisData
          }
        ],
        yAxis: {},
        series: [
          {
            type: "line",
            name: "",
            label: {
              show: true
              // position: 'top'
            },
            itemStyle: {
              normal: {}
            },
            data: this.data
          }
        ]
      },
      nullOption: {
        title: {
          text: ""
        },
        tooltip: {},
        legend: {
          itemGap: 25,
          data: [
            // 'temperature', 'humidity'
          ]
        },
        toolbox: {
          show: true
          // feature: {
          //   magicType: {type: ['line', 'bar']},
          // }
        },
        xAxis: [
          {
            type: "category",
            boundaryGap: true,
            axisLine: {
              //坐标轴轴线相关设置。数学上的x轴
              show: true,
              lineStyle: {}
            },
            axisLabel: {
              //坐标轴刻度标签的相关设置
              textStyle: {
                margin: 15
              },
              interval: 0,
              rotate: 30
            },
            axisTick: {
              show: false
            },
            data: this.xAxisData
          }
        ],
        yAxis: {},
        series: [
          {
            type: "line",
            name: "",
            label: {
              show: true
              // position: 'top'
            },
            itemStyle: {
              normal: {}
            },
            data: this.data
          }
        ]
      }
    };
  },
  async mounted() {
    this.deviceSelectorOptions = (await getDevicesApi()).data.d.map(el => {
      return {
        value: el.hardwareDeviceID,
        label: el.deviceName
      };
    });
    // console.log(this.computedDeviceOption);
    // if (this.computedDeviceOption[0] != null) {
    //   this.tmpDeviceSelectorValue = this.computedDeviceOption[0].value;
    //   this.propertySelectorOptions = (await getAffiliateFields(this.tmpDeviceSelectorValue)).data.d;
    //   if  (this.propertySelectorOptions[0] != null) {
    //     this.tmpPropertySelectorValue.push(this.propertySelectorOptions[0].fieldId);
    //     this.searchLineChartData();
    //   }
    // }
    if (this.deviceSelectorOptions[0] != null) {
      this.tmpDeviceSelectorValue = this.deviceSelectorOptions[0].value;
      this.propertySelectorOptions = (await getAffiliateFields(
        this.tmpDeviceSelectorValue
      )).data.d;
      if (this.propertySelectorOptions[0] != null) {
        this.tmpPropertySelectorValue.push(
          this.propertySelectorOptions[0].fieldId
        );
        this.searchLineChartData();
      }
    }
    // if (this.deviceSelectorOptions[0] != null && this.propertySelectorOptions[0] != null) {
    //   this.tmpDeviceSelectorValue = this.deviceSelectorOptions[0].value;
    //   this.propertySelectorOptions = (await getAffiliateFields(this.deviceSelectorOptions[0].label)).data.d;
    //   // this.tmpPropertySelectorValue = this.propertySelectorOptions[0].fieldId;
    //   // this.searchLineChartData();
    // }
  },
  // computed: {
  //   computedDeviceOption: {
  //     get: function () {
  //       return this.$store.state.device.dashboardDeviceOption.map(el => {
  //         return {
  //           value: el.hardwareDeviceID,
  //           label: el.deviceName
  //         }
  //       });
  //     }
  //   }
  // },
  // watch: {
  //   async computedDeviceOption(val, oldVal) {
  //     console.log(val);
  //     if (this.computedDeviceOption.length > 0) {
  //       this.tmpDeviceSelectorValue = this.computedDeviceOption[0].value;
  //       this.propertySelectorOptions = (await getAffiliateFields(this.tmpDeviceSelectorValue)).data.d;
  //       if  (this.propertySelectorOptions[0] != null) {
  //         this.tmpPropertySelectorValue = [];
  //         this.tmpPropertySelectorValue.push(this.propertySelectorOptions[0].fieldId);
  //         this.searchLineChartData();
  //       } else {
  //         this.tmpPropertySelectorValue = [];
  //         clearInterval(this.pollInterval);
  //         this.chart.setOption(this.nullOption);
  //       }
  //     } else {
  //       this.tmpDeviceSelectorValue = '';
  //       this.tmpPropertySelectorValue = [];
  //       clearInterval(this.pollInterval);
  //       this.chart.setOption(this.nullOption);
  //     }
  //   }
  // },
  methods: {
    initChart() {
      this.chart = echarts.init(
        document.getElementsByClassName("dashboard-line-chart-container")[0]
      );
      // 把配置和数据放这里
      this.chart.setOption(this.option);
      // this.chart.setOption({series:[{data: this.data}]});
    },
    async searchLineChartData() {
      this.chartLoading = true;
      if (this.tmpDeviceSelectorValue && this.tmpPropertySelectorValue) {
        this.deviceSelectorValue = this.tmpDeviceSelectorValue;
        this.propertySelectorValue = this.tmpPropertySelectorValue;
        setTimeout(async () => {
          let result = (await getDeviceMultiPropertyData(
            this.deviceSelectorValue,
            {
              str: this.propertySelectorValue
            }
          )).data.d;
          this.setChart(result);
          // this.chart.setOption({xAxis: [{data: result.xAxis}], series: [{data: result.series}]});
        }, 1000);
        this.initChart();
      }
      this.chartLoading = false;
    },
    setChart(opt) {
      if (opt.length > 0) {
        let s = [];
        const color1 = [
          "#409EFF",
          "#FFDD33",
          "#669966",
          "#7B76D8",
          "#6EDBCF",
          "#FFAD60",
          "#E3787E"
        ]; //0%处的颜色
        const color2 = [
          "#D9ECFF",
          "#FFF5C2",
          "#E5F5E5",
          "#DDDDF7",
          "#DFF8F5",
          "#FFEFDF",
          "#F9D6D8"
        ]; //100%处的颜色
        if (this.chartType === "bar") {
          opt.forEach((e, index) => {
            while (e["series"].length > 11) {
              e["series"].shift();
            }
            s.push({
              type: this.chartType,
              barGap: "0",
              data: e["series"],
              name: e["indexId"],
              label: {
                show: true,
                fontSize: 14,
                fontWeight: "bold",
                position: "top",
                color: color1[index % 7]
              },
              itemStyle: {
                normal: {
                  color: new echarts.graphic.LinearGradient(
                    0,
                    0,
                    0,
                    1,
                    [
                      {
                        offset: 0,
                        color: color1[index % 7] // 0% 处的颜色
                      },
                      {
                        offset: 1,
                        color: color2[index % 7] // 100% 处的颜色
                      }
                    ],
                    false
                  ),
                  barBorderRadius: [30, 30, 0, 0]
                }
              }
            });
          });
        } else {
          opt.forEach((e, index) => {
            while (e["series"].length > 11) {
              e["series"].shift();
            }
            s.push({
              type: this.chartType,
              barGap: "0",
              data: e["series"],
              name: e["indexId"],
              label: {
                show: true,
                fontSize: 14,
                fontWeight: "bold",
                position: "top",
                color: color1[index % 7]
              },
              itemStyle: {
                normal: {
                  color: color1[index % 7],
                  barBorderRadius: [30, 30, 0, 0]
                }
              }
            });
          });
        }
        var x = opt[0].xAxis;
        while (x.length > 11) {
          x.shift();
        }
        this.option.xAxis[0].data = x ;
        this.option.series = s;
        this.option.legend = {
          data: this.propertySelectorValue
        };
        this.chart.setOption(this.option, true);
      } else {
        this.option.xAxis[0].data = [];
        this.option.series = [];
        this.option.legend = {
          data: []
        };
        this.chart.setOption(this.option, true);
      }
    },
    async deviceChange() {
      this.propertySelectorOptions = (await getAffiliateFields(
        this.tmpDeviceSelectorValue
      )).data.d;
      this.tmpPropertySelectorValue = [];
      this.searchLineChartData();
    },
    switchToLine() {
      this.chartType = "line";
      this.searchLineChartData();
      this.lineChecked = true;
    },
    switchToBar() {
      this.chartType = "bar";
      this.searchLineChartData();
      this.lineChecked = false;
    },
    dataRefreh() {
      // 计时器正在进行中，退出函数
      if (this.intervalId != null) {
        return;
      }
      // 计时器为空，操作
      this.intervalId = setInterval(async () => {
        let result = (await getDeviceMultiPropertyData(
          this.deviceSelectorValue,
          {
            str: this.propertySelectorValue
          }
        )).data.d;
        this.setChart(result);
      }, 5000);
    },
    clear() {
      clearInterval(this.intervalId); //清除计时器
      this.intervalId = null; //设置为null
    }
  },
  async created() {
    this.dataRefreh();
  },
  destroyed() {
    this.clear();
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/scss/variaties";
.dashboard-line-chart-container {
  height: 400px;
  margin: 0 -60px 40px -40px;
}

.el-select {
  width: 80%;
}

.el-button {
  float: right;
}
</style>
