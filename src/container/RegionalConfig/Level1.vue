
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
          <el-button type="primary" @click="newCityFormVisible = true">添加{{GLOBAL.firstLevel}}</el-button>
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
        :page-size="6"
        @current-change="cityPageChange()"
      ></el-pagination>
    </div>
    <br />

    <el-dialog :title="'修改'+GLOBAL.firstLevel" :visible.sync="updateCityFormVisible">
      <el-form :model="updateCityData" ref="updateCityData">
        <el-form-item
          :label="GLOBAL.firstLevel"
          prop="cityName"
          label-width="120px"
          :rules="[{required: true, message:GLOBAL.firstLevel+ '不能为空'}]"
        >
          <el-input v-model="updateCityData.cityName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="备注" label-width="120px">
          <el-input v-model="updateCityData.remark" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="updateCityFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateCity('updateCityData')">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="'添加'+GLOBAL.firstLevel" :visible.sync="newCityFormVisible">
      <el-form :model="newCityData" ref="newCityData">
        <el-form-item
          :label="GLOBAL.firstLevel"
          prop="cityName"
          label-width="120px"
          :rules="[{required: true, message: GLOBAL.firstLevel+'不能为空'}]"
        >
          <el-input v-model="newCityData.cityName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="备注" label-width="120px">
          <el-input v-model="newCityData.remark" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="newCityFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCity('newCityData')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getCityOptions,
  getCity,
  getCityNumber,
  updateCityApi,
  deleteCity,
  addCity,
  getCityByCityName,
  getCityAffiliateFactory,
  getCityAffiliateDevice,
  getCityAffiliateGateway
} from "../../api/api";
import { checkAuth } from "../../common/util";

export default {
  name: "Level1",
  data() {
    return {
      //city-table-container
      cityTotalPage: 0,
      cityCurPage: 1,
      loading: false,
      cityData: [],
      //city修改el-dialog
      cityList: [],
      searchCity: "",
      updateCityData: {
        cityName: "",
        remark: "",
        createTime: "",
        updateTime: "",
        longitude: "",
        latitude: ""
      },
      updateCityFormVisible: false,
      newCityData: {
        cityName: "",
        remark: ""
      },
      newCityFormVisible: false,
      changeCityForm: "",
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
      this.updateCityFormVisible = true;
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
      const orderMap = { ascending: "asc", descending: "desc" };
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

    async updateCity(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          try {
            console.log(this.updateCityData);
            const data = await updateCityApi(
              this.updateCityData.id,
              this.updateCityData
            );
            this.updateCityFormVisible = false;
            if (data.data.c === 200) {
              this.$message({
                message: "更新成功",
                type: "success"
              });
              //再获取一次所有城市信息
              this.getCity();
            }
          } catch (e) {
            this.updateCityFormVisible = false;
            this.$message.error("更新城市未成功");
          }
        }
      });
    },
    async addCity(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          try {
            const data = await addCity(this.newCityData);
            this.newCityFormVisible = false;
            if (data.data.c === 200) {
              this.$message({
                message: "添加成功",
                type: "success"
              });
              //再获取一次所有城市信息
              this.getCity();
            }
          } catch (e) {
            this.newCityFormVisible = false;
            this.$message.error("添加城市未成功");
          }
        }
      });
    }
  },
  async mounted() {
    this.getCityTotalPage("all");
    this.getCity(); //得到“城市管理”的表单数据
    this.cityList = (await getCityOptions()).data.d;
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
