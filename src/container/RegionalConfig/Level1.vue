<template>
  <div>
    <div class="search-container">
      <el-form :inline="true" class="header">
        <el-form-item>
          <h2 id="first">{{GLOBAL.firstLevel}}</h2>
        </el-form-item>
        <el-form-item v-if="checkRegionAuth(['CONFIGURE_REGION_RETRIEVE'])">
          <el-input
            v-model="searchCity"
            @change="getCity"
            :placeholder=" '请输入' + GLOBAL.firstLevel + '名'"
          ></el-input>
        </el-form-item>
        <el-form-item v-if="checkRegionAuth(['CONFIGURE_REGION_RETRIEVE'])">
          <el-button type="primary" @click="getCity">搜索</el-button>
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
        border
        style="width: 100%"
        @sort-change="citySortChange"
      >
        <el-table-column prop="cityName" :label="GLOBAL.firstLevel"></el-table-column>
        <el-table-column
          prop="creationTime"
          label="创建时间"
          sortable="custom"
          :formatter="row => timeFormatter(row.creationTime)"
        ></el-table-column>
        <el-table-column
          prop="lastModificationTime"
          label="更新时间"
          sortable="custom"
          :formatter="row => timeFormatter(row.lastModificationTime)"
        ></el-table-column>
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
  getCityOptions,
  getCity,
  getCityNumber,
  deleteCity,
  getCityByCityName,
  getCityAffiliate
} from "../../api/api";
import AddCity from "../../components/Dialogues/AddCity";
import UpdateCity from "../../components/Dialogues/UpdateCity";
import { checkAuth, timeFormatter } from "../../common/util";

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
      cityCurOrder: null,
      pageMode: 1
    };
  },
  methods: {
    //city-search-container
    checkRegionAuth(auth) {
      return checkAuth(auth);
    },
    //city-table-container
    async openCityUpdateForm(row) {
      //打开更新表单
      this.updateCityData = JSON.parse(JSON.stringify(row));
      this.cityUpdateVisible = true;
    },
    timeFormatter(time) {
      if (time) {
        return timeFormatter(time);
      }
    },
    async deleteCity(row) {
      const affiliate = (await getCityAffiliate(row.id)).result;
      console.log(affiliate)
      if (
        affiliate["factoryNumber"] === 0 &&
        affiliate["workshopName"] === 0 
      ) {
        try {
          this.$confirm("确认删除？")
            .then(async _ => {
              const data = await deleteCity(row.id);
              console.log(data)
              if (data.success === true) {
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
            affiliate["factoryNumber"] +
            "个下属实验楼, " +
            affiliate["workshopName"] +
            "个下属设备, 无法被删除"
        );
      }
    },
    async getCity() {
      this.loading = true;
      const orderMap = { ascending: "ASC", descending: "DESC" };
      this.cityCurOrder === null
        ? (this.searchOrder = "")
        : (this.searchOrder =
            this.cityCurSortColumn + " " + orderMap[this.cityCurOrder]);
      var skipcount = (this.cityCurPage - 1) * this.pageSize;
      const data = await getCity(
        this.searchCity,
        this.searchOrder,
        this.pageSize,
        skipcount
      );
      this.cityData = data.result.items;
      this.cityTotalPage = data.result.totalCount;
      this.loading = false;
    },
    async cityPageChange() {
      this.getCity();
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
    this.getCity(); //得到“城市管理”的表单数;
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
