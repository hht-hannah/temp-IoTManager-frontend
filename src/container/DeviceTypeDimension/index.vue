<template>
  <div class="device-type-dimension-container">
    <div class="head-container">
      <span class="demonstration">选择时间</span>
      <el-date-picker
        v-model="selectedDate"
        type="daterange"
        range-separator="至"
        start-placeholder="开始月份"
        end-placeholder="结束月份"
        @change="handleDateChange"
      ></el-date-picker>
    </div>
    <!--<el-steps style="margin: 20px 0" simple>-->
    <!--<el-step title="资源类别统计" icon="el-icon-upload"></el-step>-->
    <!--</el-steps>-->
    <el-row>
      <el-col :span="12">
        <el-card>
          <div v-loading="chartLoading" class="report-statistic-daily-piechart1"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div v-loading="chartLoading" class="report-statistic-daily-piechart2"></div>
        </el-card>
      </el-col>
    </el-row>
    <el-row>
      <el-card>
        <div v-loading="chartLoading" class="report-statistic-daily-histogram"></div>
      </el-card>
    </el-row>
    <el-row>
      <div v-show="showSecondaryChart" class="report-statistic-daily-secondary-chart">
        <el-card>
          <div v-loading="chartLoading" class="report-statistic-daily-secondary-chart1"></div>
        </el-card>
      </div>
    </el-row>
  </div>
</template>

<script>
import echarts from "echarts";
import { getReportByType } from "../../api/api";

export default {
  name: "DeviceTypeDimension",
  data()  {
    return {
      chartLoading: false,
      selectedType: "",
      // 时间戳数组
      selectedDate: "",
      showSecondaryChart: false,
      histogramOption: {
        xAxis: {
          type: "category",
          axisLabel: {
            interval: 0
          },
          data: []
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow"
          }
        },
        legend: {
          show: true,
          data: ["平均在线时间", "设备综合效率"]
        },
        yAxis: [
          {
            type: "value",
            name: "平均在线时间",
            splitNumber: 6
          },
          {
            type: "value",
            name: "设备综合效率",
            position: "right",
            max: 1,
            min: 0,
            splitNumber: 6,
            axisLabel: {
              show: true,
              showMinLabel: true,
              showMaxLabel: true,
              formatter: function(value) {
                return value;
              }
            }
          }
        ],
        series: [
          {
            name: "平均在线时间",
            data: [],
            yAxisIndex: 0,
            type: "bar"
          },
          {
            name: "设备综合效率",
            data: [],
            yAxisIndex: 1,
            type: "bar"
          }
        ],
        toolbox: {
          show: true,
          feature: {
            dataView: {
              show: true,
              title: "数据视图",
              //readOnly: true, //设置只读，会隐藏刷新按钮。
              lang: ["数据视图", "关闭", "导出Excel"],
              contentToOption: function(opts) {
                /* generate workbook object from table */
                var wb = XLSX.utils.table_to_book(
                  document.querySelector("#device-type-dimension-table")
                );
                /* get binary string as output */
                var wbout = XLSX.write(wb, {
                  bookType: "xlsx",
                  bookSST: true,
                  type: "array"
                });
                try {
                  FileSaver.saveAs(
                    new Blob([wbout], { type: "application/octet-stream" }),
                    "按年维度.xlsx"
                  );
                } catch (e) {
                  if (typeof console !== "undefined") console.log(e, wbout);
                }
                return wbout;
              },
              optionToContent: function(opt) {
                // console.log(opt);

                var axisData = opt.xAxis[0].data; //坐标数据
                var series = opt.series; //折线图数据
                var tdHeads = '<td  style="padding: 0 10px">车间</td>'; //表头第一列
                var tdBodys = ""; //表数据
                //组装表头
                var nameData = new Array("平均在线时间");
                for (var i = 0; i < nameData.length; i++) {
                  tdHeads +=
                    '<td style="padding: 0 10px">' + nameData[i] + "</td>";
                }
                var table =
                  '<table id="device-type-dimension-table" border="1" class="table-bordered table-striped" style="width:80%;text-align:center" ><tbody><tr>' +
                  tdHeads +
                  " </tr>";
                //组装表数据
                for (let i = 0, l = axisData.length; i < l; i++) {
                  for (let j = 0; j < series.length; j++) {
                    var temp = series[j].data[i];
                    if (temp != null && temp != undefined) {
                      tdBodys += "<td>" + temp.toFixed(2) + "</td>";
                    } else {
                      tdBodys += "<td></td>";
                    }
                  }
                  table +=
                    '<tr><td style="padding: 0 10px">' +
                    axisData[i] +
                    "</td>" +
                    tdBodys +
                    "</tr>";
                  tdBodys = "";
                }
                table += "</tbody></table>";
                // console.log(table);
                return table;
              }
            },
            saveAsImage: { show: true }
          }
        }
      },
      pieChartOption: {
        title: {
          text: "报警次数",
          x: "center"
        },
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        toolbox: {
          show: true,
          y: "bottom",
          feature: {
            restore: { show: true },
            saveAsImage: { show: true }
          }
        },
        series: [
          {
            name: "设备数",
            type: "pie",
            radius: "50%",
            selectedMode: "single",
            label: {
              position: "outer",
              alignTo: "edge",
              normal: {
                formatter: "{b}\n{c}次",
                textStyle: {
                  color: "",
                  fontSize: 14
                }
              }
            },
            data: []
          }
        ]
      },
      pieChartOption2: {
        title: {
          text: "设备数",
          x: "center"
        },
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        toolbox: {
          show: true,
          y: "bottom",
          feature: {
            restore: { show: true },
            saveAsImage: { show: true }
          }
        },
        series: [
          {
            name: "饼图",
            type: "pie",
            radius: "50%",
            selectedMode: "single",
            label: {
              normal: {
                position: "outside",
                formatter: "{b}\n{c}个",
                textStyle: {
                  color: "",
                  fontSize: 14
                }
              }
            },
            data: []
          }
        ]
      }
    };
  },
  async mounted() {
    this.initTypeChart();
    this.initSubClassChartOne();
    this.initSubClassChartTwo();
    this.handleDateChange();
  },
  methods: {
   initTypeChart() {
      var vm = this;
      this.chart = echarts.init(
        document.getElementsByClassName("report-statistic-daily-histogram")[0]
      );
      // 把配置和数据放这里
      this.chart.setOption(this.histogramOption);
      this.chart.on("click", async(params) => {

        vm.showSecondaryChart = true;
        vm.chartLoading = true;

        const result = (
          await getReportByType({
            startTime: new Date("1980/1/1"),
            endTime: new Date("2030/12/31")
          })
        ).data.d;
        console.log(result)
        vm.pieChartOption2.title.text = params.name;
        vm.secondaryChart = echarts.init( document.getElementsByClassName( "report-statistic-daily-secondary-chart1")[0] );
        console.log(vm.pieChartOption2);
        vm.secondaryChart.setOption(vm.pieChartOption2);
        vm.chartLoading = false;
      });
    },
    initSubClassChartOne() {
      this.pieChart1 = echarts.init(
        document.getElementsByClassName("report-statistic-daily-piechart1")[0]
      );
      // 把配置和数据放这里
      this.pieChart1.setOption(this.pieChartOption);
    },
    initSubClassChartTwo() {
      this.pieChart2 = echarts.init(
        document.getElementsByClassName("report-statistic-daily-piechart2")[0]
      );
      // 把配置和数据放这里
      this.pieChart2.setOption(this.pieChartOption2);
    },
    async handleDateChange() {
      this.chartLoading = true;
      if (this.selectedDate.length > 1) {
        const result = (
          await getReportByType({
            startTime: this.selectedDate[0],
            endTime: this.selectedDate[1]
          })
        ).data.d;

        this.histogramOption.xAxis.data = result["xAxis"];
        this.histogramOption.series = result["lineChartSeries"];
        this.chart.setOption(this.histogramOption);

        this.pieChartOption.series[0].data = result["pieChart1Series"];
        this.pieChart1.setOption(this.pieChartOption);
        console.log(result);

        this.pieChartOption2.series[0].data = result["pieChart2Series"];
        this.pieChart2.setOption(this.pieChartOption2);
      } else {
        const result = (
          await getReportByType({
            startTime: new Date("1980/1/1"),
            endTime: new Date("2030/12/31")
          })
        ).data.d;

        console.log(result)
        this.histogramOption.xAxis.data = result["xAxis"];
        this.histogramOption.series = result["lineChartSeries"];
        this.chart.setOption(this.histogramOption);

        this.pieChartOption.series[0].data = result["pieChart1Series"];
        this.pieChart1.setOption(this.pieChartOption);

        this.pieChartOption2.series[0].data = result["pieChart2Series"];
        this.pieChart2.setOption(this.pieChartOption2);
      }
      this.chartLoading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.device-type-dimension-container {
  .head-container {
    margin: 20px 50px;
  }

  .report-statistic-daily-histogram {
    height: 500px;
  }

  .report-statistic-daily-piechart1 {
    height: 400px;
  }
  .report-statistic-daily-piechart2 {
    height: 400px;
  }

  .report-statistic-daily-secondary-chart {
    height: 400px;
  }

  .report-statistic-daily-secondary-chart1 {
    height: 400px;
  }

  .el-card {
    margin: 10px;
  }
}
</style>
