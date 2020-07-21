<template>
  <div class="system-config-container">
    <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
      @select="handleSelect"
    >
      <el-menu-item index="1">网关类型配置</el-menu-item>
      <el-menu-item index="2">设备类型配置</el-menu-item>
      <!--<el-menu-item index="2">数据库配置</el-menu-item>-->
      <el-menu-item index="3">属性配置</el-menu-item>
      <el-menu-item index="4">标签配置</el-menu-item>
      <el-menu-item index="5">名称配置</el-menu-item>
    </el-menu>
    <div v-if="currentPage==='1'">
      <DeviceTypeConfig></DeviceTypeConfig>
    </div>
    <div v-if="currentPage==='2'">
      <GatewayTypeConfig></GatewayTypeConfig>
    </div>
    <div v-if="currentPage==='3'">
      <PropertyConfig></PropertyConfig>
    </div>
    <div v-if="currentPage==='4'">
      <TagConfig></TagConfig>
    </div>
    <div v-if="currentPage==='5'">
      <NameConfig></NameConfig>
    </div>
  </div>
</template>

<script>
import DatabaseConfig from "./DatabaseConfig";
import DeviceTypeConfig from "./DeviceTypeConfig";
import PropertyConfig from "./PropertyConfig";
import TagConfig from "./TagConfig";
import NameConfig from "./NameConfig";
import GatewayTypeConfig from "./GatewayTypeConfig";
export default {
  name: "SystemConfig",
  data() {
    return {
      //翻页使用的变量
      activeIndex: "1",
      currentPage: "1"
    };
  },
  computed: {
    deviceData: {
      // getter
      get: function() {
        return this.$store.state.device.currentDeviceData;
      },
      // setter
      set: function(newValue) {
        console.log("newValue", newValue);
      }
    }
  },
  methods: {
    handleSelect(key) {
      this.currentPage = key;
    }
  },
  components: {
    DeviceTypeConfig,
    DatabaseConfig,
    PropertyConfig,
    TagConfig,
    NameConfig,
    GatewayTypeConfig
  }
};
</script>

<style scoped>
@import "../../assets/scss/variaties.scss";
.system-config-container {
  margin-top: 10px;
  margin-left: 20px;
}
</style>
