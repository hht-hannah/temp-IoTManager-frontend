<template>
  <div>
    <div class="search-container">
      <el-form :inline="true" class="header">
        <el-form-item>
          <h2 id="first">{{GLOBAL.firstLevel}}</h2>
        </el-form-item>
        <el-form-item v-if="checkRegionAuth(['CONFIGURE_REGION_RETRIEVE'])">
          <el-input v-model="searchCity" :placeholder=" '请输入' + GLOBAL.firstLevel + '名'"></el-input>
        </el-form-item>
        <el-form-item v-if="checkRegionAuth(['CONFIGURE_REGION_RETRIEVE'])">
          <el-button type="primary" @click="searchByCity">搜索</el-button>
        </el-form-item>
        <el-form-item v-if="checkRegionAuth(['CONFIGURE_REGION_CREATE'])">
          <el-button type="primary" @click="cityAddVisible = true">添加{{GLOBAL.firstLevel}}</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table-container" v-if="checkRegionAuth(['CONFIGURE_REGION_RETRIEVE'])">
      <el-table
        v-loading="loading"
        :data="cityData"
        style="width: 100%"
        @sort-change="citySortChange"
      >
        <el-table-column prop="cityName" :label="GLOBAL.firstLevel"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" sortable="custom"></el-table-column>
        <el-table-column prop="updateTime" label="更新时间" sortable="custom"></el-table-column>
        <el-table-column prop="longitude" label="经度" sortable="custom"></el-table-column>
        <el-table-column prop="latitude" label="纬度" sortable="custom"></el-table-column>
        <el-table-column prop="remark" label="备注"></el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          v-if="checkRegionAuth(['CONFIGURE_REGION_DELETE', 'CONFIGURE_REGION_UPDATE'])"
        >
          <template slot-scope="scope">
            <el-button
              @click="openCityUpdateForm(scope.row)"
              type="text"
              size="small"
              v-if="checkRegionAuth(['CONFIGURE_REGION_UPDATE'])"
            >修改</el-button>
            <el-button
              @click="deleteCity(scope.row)"
              type="text"
              size="small"
              v-if="checkRegionAuth(['CONFIGURE_REGION_DELETE'])"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        layout="prev, pager, next"
        :total="cityTotalPage"
        :current-page.sync="cityCurPage"
        :page-size="pageSize"
        @current-change="cityPageChange()"
      ></el-pagination>
    </div>
    <AddCity :cityAddVisible.sync="cityAddVisible" :onClose="onChangeCityClose"></AddCity>
    <UpdateCity
      :cityUpdateVisible.sync="cityUpdateVisible"
      :onClose="onChangeCityClose"
      :defaultData="updateCityData"
    ></UpdateCity>
  </div>
</template>

<script>
import {
  getCity,
  getCityNumber,
  deleteCity,
  getCityByCityName,
  getCityAffiliateFactory,
  getCityAffiliateDevice,
  getCityAffiliateGateway
} from "../../api/api";
import AddCity from "../../components/Dialogues/AddCity";
import UpdateCity from "../../components/Dialogues/UpdateCity";
import { checkAuth } from "../../common/util";

export default {
  name: "Level1",
  components: { AddCity, UpdateCity },
  data() {
    return {
      //city-table-container
      cityTotalPage: 0,
      cityCurPage: 1,
      loading: false,
      cityData: [],
      pageSize: 6,
      //city修改el-dialog
      cityAddVisible: false,
      searchCity: "",
      updateCityData: [],
      cityUpdateVisible: false,
      cityCurSortColumn: "",
      cityCurOrder: "",
      pageMode: 1
    };
  },
  methods: {
    //city-search-container
    checkRegionAuth(auth) {
      return checkAuth(auth);
    },
    async searchByCity() {
      if (this.searchCity !== "") {
        this.cityData = (await getCityByCityName(this.searchCity)).data.d;
      } else {
        this.cityData = this.getCity();
      }
    },
    //city-table-container
    async openCityUpdateForm(row) {
      //打开更新表单
      this.updateCityData = JSON.parse(JSON.stringify(row));
      this.cityUpdateVisible = true;
    },
    async deleteCity(row) {
      const affiliateFactory = (await getCityAffiliateFactory(row.id)).data.d;
      const affiliateDevice = (await getCityAffiliateDevice(row.id)).data.d;
      const affiliateGateway = (await getCityAffiliateGateway(row.id)).data.d;
      if (
        affiliateFactory === 0 &&
        affiliateDevice === 0 &&
        affiliateGateway === 0
      ) {
        try {
          this.$confirm("确认删除？")
            .then(async _ => {
              const data = await deleteCity(row.id);
              if (data.data.c === 200) {
                this.$message({
                  message: "删除成功",
                  type: "success"
                });
                //再获取一次所有城市信息
                this.getCity();
              }
            })
            .catch(_ => {});
        } catch (e) {
          console.log(e);
        }
      } else {
        this.$msgbox(
          "该城市有" +
            affiliateFactory +
            "个下属实验楼, " +
            affiliateDevice +
            "个下属设备, " +
            affiliateGateway +
            "个下属网关，无法被删除"
        );
      }
    },
    async getCity() {
      this.loading = true;
      const orderMap = { ascending: "id ASC", descending: "id DESC" };
      const columnMap = {
        id: "id",
        longitude: "longitude",
        latitude: "latitude",
        updateTime: "updateTime",
        createTime: "createTime"
      };
      const searchColumn =
        this.cityCurSortColumn === ""
          ? "id"
          : columnMap[this.cityCurSortColumn];
      const searchOrder =
        this.cityCurOrder === "" ? "asc" : orderMap[this.cityCurOrder];
      const searchCityName =
        this.searchCity === "全部" ? "all" : this.searchCity;
      const data = await getCity(
        this.cityCurPage,
        searchColumn,
        searchOrder,
        this.pageMode
      );
      this.cityData = data.data.d;
      this.getCityTotalPage("search", searchCityName);
      this.loading = false;
    },
    async cityPageChange() {
      this.getCity();
    },
    async getCityTotalPage(searchType, city = "all") {
      if (searchType === "all") {
        this.cityTotalPage = (await getCityNumber("all")).data.d;
      } else if (searchType === "search") {
        const c = city === "全部" ? "all" : city;
        this.cityTotalPage = (await getCityNumber("search", c)).data.d;
      }
    },
    async citySortChange(ob) {
      this.cityCurSortColumn = ob.prop;
      this.cityCurOrder = ob.order;
      this.getCity();
    },
    onChangeCityClose() {
      this.getCity();
    }
  },
  async mounted() {
    this.getCityTotalPage("all");
    this.getCity(); //得到“城市管理”的表单数据
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/scss/variaties.scss";
h2 {
  display: inline;
}

.search-container,
.table-container {
  margin: 1% 1%;
  text-align: left;
  border: none;
}
</style>
