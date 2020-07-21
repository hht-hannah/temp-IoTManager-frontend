<template>
  <el-menu
    class="el-menu-demo navigation-container"
    mode="horizontal"
    @select="handleSelect"
    :background-color="mainColor"
    text-color="#fff"
    active-text-color="#ffffff"
  >
    <el-menu-item index="1">{{GLOBAL.name}}</el-menu-item>
    <el-menu-item index="2" @click="onClick"> {{status === true ? "展开" : "收起" }} </el-menu-item>
    <el-menu-item index="3" style="float: right">
      <el-dropdown trigger="click">
        <span class="el-dropdown-link" style="color: white">
          切换皮肤
          <i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <!--<router-link to="/personalInformation" style="text-decoration: none"><el-dropdown-item>用户信息</el-dropdown-item></router-link>-->
          <!--<el-dropdown-item>设置</el-dropdown-item>-->
          <el-dropdown-item @click.native="changeColor('black')">黑色</el-dropdown-item>
          <el-dropdown-item @click.native="changeColor('blue')">蓝色</el-dropdown-item>
          <el-dropdown-item @click.native="changeColor('orange')">橙色</el-dropdown-item>
          <el-dropdown-item @click.native="changeColor('red')">红色</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </el-menu-item>
    <el-menu-item index="4" style="float: right">
      <el-dropdown trigger="click">
        <span class="el-dropdown-link" style="color: white">
          <!--          <img src="../../assets/img/yonghu.svg"> -->
          用户
          <i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <router-link to="/personalInformation" style="text-decoration: none">
            <el-dropdown-item>用户信息</el-dropdown-item>
          </router-link>
          <!--<el-dropdown-item>设置</el-dropdown-item>-->
          <el-dropdown-item @click.native="logout">注销</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </el-menu-item>
  </el-menu>
</template>

<script>
import { mainColor, changeMainColor } from "../../common/globalvariaties";
import {
  delCookie,
  getCookie,
  setCookie
} from "../../../utils/package-cookies";
import { signOut } from "../../api/api";
export default {
  name: "Navigation",
  props: ["handleClick", "retract"],
  data() {
    return {
      status: this.retract,
      userInfo: [],
      activeIndex: "1",
      activeIndex2: "1",
      mainColor: mainColor ? mainColor : "#409EFF"
    };
  },
  methods: {
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    },
    onClick() {
      this.$props.handleClick()
    },
    logout() {
      // let sessionID=getCookie('userSessionID');
      // signOut(sessionID);
      delCookie("userSessionID");
      localStorage.removeItem("userInfo");
      localStorage.removeItem("auth");
      this.$router.push("/login");
    },
    changeColor(color) {
      switch (color) {
        case "black":
          changeMainColor("#303133");
          window.location.reload();
          break;
        case "blue":
          changeMainColor("#409EFF");
          window.location.reload();
          break;
        case "orange":
          changeMainColor("#E6A23C");
          window.location.reload();
          break;
        case "red":
          changeMainColor("#F56C6C");
          window.location.reload();
          break;
      }
    }
  },
  mounted() {
    console.log("manman", getCookie("mainColor"));
    console.log("manman", this.mainColor);
  },
  watch: {
    retract() {
      this.status = this.retract;
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "../../assets/scss/variaties";
.navigation-container {
  border: $main-color;
  .el-menu-item,
  .el-submenu__title {
    height: 100%;
  }
  .hide-underline {
    text-decoration: none;
  }
}
</style>
