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
      <el-col :span="16">
        <el-card>
          <div v-loading="chartLoading" class="report-statistic-daily-histogram"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <div v-loading="chartLoading" class="report-statistic-daily-piechart1"></div>
        </el-card>
        <el-card>
          <div v-loading="chartLoading" class="report-statistic-daily-piechart2"></div>
        </el-card>
      </el-col>
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
  data() {
    return {
      chartLoading: false,
      selectedType: "",
      // 时间戳数组
      selectedDate: "",
      showSecondaryChart: false,
      histogramOption: {
        xAxis: {
          type: "category",
          axisLine: {
            lineStyle: {
              color: "#B4B4B4"
            }
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
            name: "平均在线时间",
            nameLocation: "middle",
            nameTextStyle: {
              padding: [3, 4, 50, 6]
            },
            splitLine: {
              show: true,
              lineStyle: {
                type: "dashed",
                color: "#B4B4B4"
              }
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: "#B4B4B4"
              }
            },
            axisLabel: {
              textStyle: {
                color: "#B4B4B4"
              },
              formatter: "{value} "
            }
          },
          {
            name: "设备综合效率",
            nameLocation: "middle",
            nameTextStyle: {
              padding: [50, 4, 5, 6]
            },
            splitLine: {
              show: false
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: "#B4B4B4"
              }
            },
            axisLabel: {
              textStyle: {
                color: "#B4B4B4"
              },
              formatter: "{value} "
            }
          }
        ],
        series: [
          {
            name: "平均在线时间",
            data: [],
            yAxisIndex: 0,
            type: "bar",
            label: {
              show: true,
              fontSize: 14,
              fontWeight: "bold",
              position: "top",
              color: "#409EFF"
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
                      color: "#409EFF" // 0% 处的颜色
                    },
                    {
                      offset: 1,
                      color: "#D9ECFF" // 100% 处的颜色
                    }
                  ],
                  false
                ),
                barBorderRadius: [30, 30, 0, 0]
              }
            }
          },
          {
            name: "设备综合效率",
            data: [],
            yAxisIndex: 1,
            type: "bar",
            label: {
              show: true,
              fontSize: 14,
              fontWeight: "bold",
              position: "top",
              color: "#FFDD33"
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
                      color: "#FFDD33" // 0% 处的颜色
                    },
                    {
                      offset: 1,
                      color: "#FFF5C2" // 100% 处的颜色
                    }
                  ],
                  false
                ),
                barBorderRadius: [30, 30, 0, 0]
              }
            }
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
          subtext: 0,
          textStyle: {
            color: "#000",
            fontSize: 20,
            align: "center"
          },
          subtextStyle: {
            fontSize: 16,
            color: ["#C0C0C0"]
          },
          x: "center",
          y: "center"
        },
        color: [
          "#409EFF",
          "#FFDD33",
          "#669966",
          "#7B76D8",
          "#6EDBCF",
          "#FFAD60",
          "#E3787E"
        ],
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
            name: "报警次数",
            type: "pie",
            selectedMode: "single",
            radius: ["50%", "70%"],
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
          text: "设备数量",
          subtext: 0,
          textStyle: {
            color: "#000",
            fontSize: 20,
            align: "center"
          },
          subtextStyle: {
            fontSize: 16,
            color: ["#C0C0C0"]
          },
          x: "center",
          y: "center"
        },
        color: [
          "#409EFF",
          "#FFDD33",
          "#669966",
          "#7B76D8",
          "#6EDBCF",
          "#FFAD60",
          "#E3787E"
        ],
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
            radius: ["50%", "70%"],
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
      this.chart.on("click", async params => {
        vm.showSecondaryChart = true;
        vm.chartLoading = true;

        const result = (await getReportByType({
          startTime: new Date("1980/1/1"),
          endTime: new Date("2030/12/31")
        })).data.d;
        console.log(result);
        vm.pieChartOption2.title.text = params.name;
        vm.secondaryChart = echarts.init(
          document.getElementsByClassName(
            "report-statistic-daily-secondary-chart1"
          )[0]
        );
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
      var result = [];
      this.chartLoading = true;
      if (this.selectedDate !== null && this.selectedDate.length > 1) {
        result = (await getReportByType({
          startTime: this.selectedDate[0],
          endTime: this.selectedDate[1]
        })).data.d;
      } else {
        result = (await getReportByType({
          startTime: new Date("1980/1/1"),
          endTime: new Date("2030/12/31")
        })).data.d;
      }
      
      this.histogramOption.xAxis.data = result["xAxis"];
      result["lineChartSeries"].forEach(r => {
        if (r["name"] === "平均在线时间") {
          this.histogramOption.series[0].data = r.data;
        } else if (r["name"] === "设备综合效率") {
          this.histogramOption.series[1].data = r.data;
        }
      });
      this.chart.setOption(this.histogramOption);

      var total1 = 0;
      this.pieChartOption.series[0].data = result["pieChart1Series"];
      result["pieChart1Series"].forEach(r => {
        total1 += r.value;
      });
      this.pieChartOption.title.subtext = total1;
      this.pieChart1.setOption(this.pieChartOption);

      this.pieChartOption2.series[0].data = result["pieChart2Series"];
            var total2 = 0;
      result["pieChart2Series"].forEach(r => {
        total2 += r.value;
      });
      this.pieChartOption2.title.subtext = total2;
      this.pieChart2.setOption(this.pieChartOption2);
      this.chartLoading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/scss/variaties.scss";
.device-type-dimension-container {
  .report-statistic-daily-histogram {
    height: 520px;
  }

  .report-statistic-daily-piechart1 {
    height: 240px;
  }
  .report-statistic-daily-piechart2 {
    height: 240px;
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
