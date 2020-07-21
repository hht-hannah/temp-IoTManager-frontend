<template>
  <div class="block">
    <span class="select-title">地域筛选</span>
    <el-cascader :options="selectorOptions" v-model="searchCity" @change="areaFilter"></el-cascader>
    <div class="dashboard-map-container"></div>
  </div>
</template>

<script>
// http://efe.baidu.com/blog/echarts-map-tutorial/
// http://gallery.echartsjs.com/editor.html?c=xBJDR584vG
import echarts from "echarts";
// 一定要引入才能正常显示
import "echarts/map/js/world";
import {
  getMapInfo,
  getCityCascaderOptions,
  getOneMapInfo,
  getDeviceByCity,
  getDevicesApi,
  getCity
} from "../../api/api";

export default {
  name: "DashBoardMap",
  data() {
    return {
      chart: null,
      reload: true,
      searchCity: ["全部"],
      option: {
        backgroundColor: '#eeeeee',
        geo: {
          show: true,
          map: "world",
          label: {
            normal: {
              show: false
            },
            emphasis: {
              show: false
            }
          },
          roam: true,
          itemStyle: {
            normal: {
              areaColor: "#3077BF", //#031525
              borderColor: "#083A66" //#3B5077
            },
            emphasis: {
              areaColor: "#70B6FF" //'#2B91B7'
            }
          },
          center: [110, 30],
          zoom: 4
        },
        tooltip: {
          show: true,
          formatter: function(params) {
            return (
              params.seriesName + "</br>" + params.name + ": " + params.value[2]
            );
          }
        },
        series: [
          {
            name: "地域分布",
            type: "effectScatter",
            coordinateSystem: "geo",
            data: [],
            symbolSize: 10,
            showEffectOn: "render",
            hoverAnimation: true,
            label: {
              normal: {
                formatter: "{b}",
                position: "bottom",
                color: "#fff",
                show: true
              }
            },
            itemStyle: {
              normal: {
                color: "yellow",
                shadowBlur: 0,
                shadowColor: "yellow"
              }
            },
            zlevel: 1
          }
        ]
      },
      mapInfo: [],
      selectorOptions: [],
      selectedArea: []
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
        this.getDeviceOptions().then(_ => {
          this.setMapInfo();
        });
        this.chinaConfigure();
      }, 5000);
    },
    clear() {
      clearInterval(this.intervalId); //清除计时器
      this.intervalId = null; //设置为null
    },
    chinaConfigure() {
      let myChart = echarts.init(
        document.getElementsByClassName("dashboard-map-container")[0]
      ); //这里是为了获得容器所在位置
      window.onresize = function() {
        myChart.resize();
      };
      myChart.setOption(this.option);
    },
    async areaFilter() {
      this.setMapInfo();
    },
    async setMapInfo() {
      let amount = [];
      let centerPos = [];
      if (this.searchCity[0] === "全部") {
        amount = (await getMapInfo()).data.d;
        this.option.geo.zoom = 4;
      } else {
        amount = (await getOneMapInfo(this.searchCity[0])).data.d;
        centerPos.push(amount[0]["value"][0]);
        centerPos.push(amount[0]["value"][1]);
        this.option.geo.center = centerPos;
        this.option.geo.zoom = 8;
      }
      this.option.series[0].data = amount;

      let data = [];
      if (this.searchCity[0] === "全部") {
        data = (await getDevicesApi("all")).data.d;
      } else {
        console.log(this.searchCity);
        if (this.searchCity.length === 3 && this.searchCity[2] !== "全部") {
          console.log("search1");
          data = (await getDeviceByCity(
            this.searchCity[0],
            this.searchCity[1],
            this.searchCity[2]
          )).data.d;
        } else if (
          (this.searchCity.length === 2 && this.searchCity[1] !== "全部") ||
          (this.searchCity.length === 3 && this.searchCity[2] === "全部")
        ) {
          console.log("search2");
          data = (await getDeviceByCity(this.searchCity[0], this.searchCity[1]))
            .data.d;
        } else if (
          this.searchCity.length === 1 ||
          (this.searchCity.length === 2 && this.searchCity[1] === "全部")
        ) {
          console.log("search3");
          data = (await getDeviceByCity(this.searchCity[0])).data.d;
        }
      }
      this.$store.dispatch("device/setDashboardDeviceOption", data);
      if (this.reload) {
        this.chinaConfigure();
        this.reload = false;
      }
    },
    async getDeviceOptions() {
      this.selectorOptions = (await getCityCascaderOptions()).data.d;
    }
  },
  destroyed() {
    this.clear();
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/scss/variaties.scss";
.dashboard-map-container {
  margin-top: 7px;
  height: $dashboard-block-height;
}

.search-container {
  margin: 1% 1%;
  text-align: left;
}
</style>
