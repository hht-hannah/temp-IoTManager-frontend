<template>
  <div class="regional-config-container">
    <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
      @select="handleSelect"
    >
      <el-menu-item index="1">城市</el-menu-item>
      <el-menu-item index="2">实验室</el-menu-item>
      <el-menu-item index="3">实验楼</el-menu-item>
    </el-menu>
    <div v-if="currentPage==='1'">
      <level1></level1>
    </div>
    <div v-if="currentPage==='2'">
      <level2></level2>
    </div>
    <div v-if="currentPage==='3'">
      <level3></level3>
    </div>
  </div>
</template>

 <script>
import level1 from "./Level1";
import level2 from "./Level2";
import level3 from "./Level3";
export default {
  name: "RegionalConfig",
  components: {
    level1,
    level2,
    level3
  },
  data() {
    return {
      //翻页使用的变量
      activeIndex: "1",
      currentPage: "1"
    };
  },
  methods: {
    handleSelect(key) {
      this.currentPage = key;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/scss/variaties.scss";
  .regional-config-container{
    margin-top: 10px;
    margin-left: 20px;
  }
</style>
