<template>
  <div class="home-container">
    <Navigation class="nav-screen" :handleClick="handleClick" :retract.sync="retract"></Navigation>
    <div class="tac sidebar-screen">
      <div class="full-screen">
        <Sidebar id="sidebar" class="full-screen adaptive"></Sidebar>
      </div>
      <div class="router-view">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import Navigation from "../../components/Navigation/index";
import Sidebar from "../../components/Sidebar/index";

export default {
  name: "Home",
  components: { Sidebar, Navigation },
  data() {
    return {
      retract: false
    };
  },
  methods: {
    handleClick() {
      console.log(this.retract);
      if (this.retract === true) {
        document.getElementById("sidebar").style.display = "inline-block";
        document.getElementsByClassName("router-view")[0].style.width ="88%";
        this.retract = false;
      } else {
        document.getElementById("sidebar").style.display = "none";
        document.getElementsByClassName("router-view")[0].style.width = "98%";
        this.retract = true;
      }
    }
  },
  mounted() {
    //简单鉴权
    // // 查看是否登陆
    //   if (this.$store.state.userInfo.isLogin === false) {
    //     // 没登录的做处理
    //     alert('请先登录');
    //     this.$router.push('/login');
    //   }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
/*sass加变量*/
$nav-height: 60px;
$sidebar-width: 150px;
.home-container {
  height: 100%;
  .nav-screen {
    position: fixed;
    width: 100%;
    height: $nav-height;
    z-index: 99;
  }
  .sidebar-screen {
    .adaptive {
      top: $nav-height;
      position: fixed;
      width: 10%;
    }
  }
}
.full-screen {
  height: calc(100% - #{$nav-height});
}
.router-view {
  position: absolute;
  top: 70px;
  right: 1%;
  width: 88%;
}
</style>
