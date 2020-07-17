<template>
  <div class="time-dimension-container">
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
    <el-row>
      <el-card>
        <div v-loading="chartLoading" class="report-statistic-daily-histogram"></div>
      </el-card>
    </el-row>
  </div>
</template>

<script>
import echarts from "echarts";
import { getReportByTag } from "../../api/api";

export default {
  name: "TagDimension",
  data() {
    return {
      chartLoading: false,
      selectedType: "",
      // 时间戳数组
      selectedDate: "",
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
          data: ["平均在线时间", "告警次数", "设备数量", "设备综合效率"]
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
        series: [],
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
                  document.querySelector("#tag-dimension-table")
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
                var nameData = new Array(
                  "平均在线时间",
                  "告警次数",
                  "设备数量"
                );
                for (var i = 0; i < nameData.length; i++) {
                  tdHeads +=
                    '<td style="padding: 0 10px">' + nameData[i] + "</td>";
                }
                var table =
                  '<table id="tag-dimension-table" border="1" class="table-bordered table-striped" style="width:80%;text-align:center" ><tbody><tr>' +
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
      defaultProps: {
        children: "children",
        label: "label"
      },
      showMonth: false
    };
  },
  async mounted() {
    this.initTypeChart();
    this.handleDateChange();
  },
  methods: {
    initTypeChart() {
      this.chart = echarts.init(
        document.getElementsByClassName("report-statistic-daily-histogram")[0]
      );
      // 把配置和数据放这里
      this.chart.setOption(this.histogramOption);
    },
    async handleDateChange() {
      this.chartLoading = true;
      var result = [];
      console.log(this.selectedDate)
      if (this.selectedDate !== null && this.selectedDate.length > 1) {
        result = (await getReportByTag({
          startTime: this.selectedDate[0],
          endTime: this.selectedDate[1]
        })).data.d;
      } else {
        result = (await getReportByTag({
          startTime: new Date("1980/1/1"),
          endTime: new Date("2020/12/31")
        })).data.d;
      }
      this.histogramOption.xAxis.data = result["xAxis"];
      const color1 = [
        "#409EFF",
        "#FFDD33",
        "#669966",
        "#7B76D8",
        "#6EDBCF",
        "#FFAD60",
        "#E3787E"
      ];
      const color2 = [
        "#D9ECFF",
        "#FFF5C2",
        "#E5F5E5",
        "#DDDDF7",
        "#DFF8F5",
        "#FFEFDF",
        "#F9D6D8"
      ];
      this.histogramOption.series = [];
      result["series"].forEach((s, index) => {
        this.histogramOption.series.push({
          name: s.name,
          data: s.data,
          type: "bar",
          yAxisIndex: s.name === "设备综合效率" ? 1 : 0,
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
      this.chart.setOption(this.histogramOption, true);
      this.chartLoading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/scss/variaties.scss";
.time-dimension-container {
  .report-statistic-daily-histogram {
    height: 500px;
  }

  .report-statistic-daily-histogram2 {
    height: 500px;
  }

  .el-card {
    margin: 20px;
  }
}
</style>

