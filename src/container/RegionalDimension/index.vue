<template>
  <div class="regional-dimension-container">
    <el-row>
      <el-col :span="3">
        <el-tree
          v-loading="treeLoading"
          :data="treeData"
          :props="defaultProps"
          @node-click="handleNodeClick"
        ></el-tree>
      </el-col>
      <el-col :span="21">
        <div class="head-container">
          <span class="demonstration">选择时间</span>
          <el-date-picker
            v-model="selectedDate"
            type="daterange"
            range-separator="至"
            start-placeholder="开始月份"
            end-placeholder="结束月份"
            @change="handleTimeChange"
          ></el-date-picker>
        </div>
        <el-row>
          <el-col :span="23">
            <el-card>
              <div v-loading="chartLoading" class="report-statistic-daily-histogram"></div>
            </el-card>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <!--<el-steps style="margin: 20px 0" simple>-->
    <!--<el-step title="资源类别统计" icon="el-icon-upload"></el-step>-->
    <!--</el-steps>-->
    <!--<div class="report-statistic-daily-piechart">-->
    <!--</div>-->
  </div>
</template>

<script>
import echarts from "echarts";
import FileSaver from "file-saver";
import XLSX from "xlsx";
import { getCityFactoryTree, getReportByRegion } from "../../api/api";

export default {
  name: "RegionalDimension",
  data() {
    return {
      treeLoading: false,
      chartLoading: false,
      curCity: "",
      curFactory: "",
      nameOptions: [],
      selectedType: "",
      // 时间戳数组
      selectedDate: [],
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
          data: ["平均在线时间", "告警次数", "设备数量", "设备综合效率"]
        },
        yAxis: {
          type: "value"
        },
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
                  document.querySelector("#tableExcel_Day")
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
                    "网关设备.xlsx"
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
                  '<table id="tableExcel_Day" border="1" class="table-bordered table-striped" style="width:80%;text-align:center;" ><tbody><tr>' +
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
      // 左边栏数据
      treeData: [],
      defaultProps: {
        children: "children",
        label: "label"
      }
    };
  },
  async mounted() {
    this.initTypeChart();
    this.treeLoading = true;
    this.treeData = (await getCityFactoryTree()).data.d;
    this.treeLoading = false;
  },
  methods: {
    initTypeChart() {
      this.chart = echarts.init(
        document.getElementsByClassName("report-statistic-daily-histogram")[0]
      );
      this.chart.setOption(this.histogramOption);
    },
    async handleNodeClick(data) {
      console.log("handleNodeClick");
      console.log(data);
      this.chartLoading = true;
      if (data.factoryName) {
        this.curFactory = data.factoryName;
        this.curCity = data.cityName;
        console.log(data.factoryName);
        if (this.selectedDate.length > 1) {
          const result = (
            await getReportByRegion(data.cityName, data.factoryName, {
              startTime: this.selectedDate[0],
              endTime: this.selectedDate[1]
            })
          ).data.d;
          this.histogramOption.xAxis.data = result["xAxis"];
          this.histogramOption.series = result["series"];
          this.chart.setOption(this.histogramOption, true);
        } else {
          const result = (
            await getReportByRegion(data.cityName, data.factoryName, {
              startTime: new Date("1980/1/1"),
              endTime: new Date("2030/12/31")
            })
          ).data.d;
          this.histogramOption.xAxis.data = result["xAxis"];
          this.histogramOption.series = result["series"];
          this.chart.setOption(this.histogramOption, true);
        }
      }
      this.chartLoading = false;
    },
    async handleTimeChange() {
      if (this.curFactory !== "") {
        this.chartLoading = true;
        const result = (
          await getReportByRegion(this.curCity, this.curFactory, {
            startTime: this.selectedDate[0],
            endTime: this.selectedDate[1]
          })
        ).data.d;
        this.histogramOption.xAxis.data = result["xAxis"];
        this.histogramOption.series = result["series"];
        this.chart.setOption(this.histogramOption, true);
        this.chartLoading = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.regional-dimension-container {
  .head-container {
    margin: 20px;
  }

  .report-statistic-daily-histogram {
    height: 500px;
  }

  .report-statistic-daily-piechart {
    height: 400px;
  }

  .el-tree {
    margin-right: 20px;
    padding-top: 10px;
    height: 1000px;
    // background-color: rgba(64, 158, 255, 0.1);
  }

}
</style>

