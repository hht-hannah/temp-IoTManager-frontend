<template>
  <div>
    <div class="search-container">
      <el-form :inline="true" class="header">
        <el-form-item>
          <h2 id="second">{{GLOBAL.secondLevel}}</h2>
        </el-form-item>
        <el-form-item v-if="checkRegionAuth(['CONFIGURE_REGION_RETRIEVE'])">
          <el-input v-model="searchBuilding" :placeholder=" '请输入' + GLOBAL.secondLevel + '名'"></el-input>
        </el-form-item>
        <el-form-item v-if="checkRegionAuth(['CONFIGURE_REGION_RETRIEVE'])">
          <el-button type="primary" @click="searchByBuilding">搜索</el-button>
        </el-form-item>
        <el-form-item v-if="checkRegionAuth(['CONFIGURE_REGION_CREATE'])">
          <el-button type="primary" @click="factoryAddVisible = true">添加{{GLOBAL.secondLevel}}</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table-container" v-if="checkRegionAuth(['CONFIGURE_REGION_RETRIEVE'])">
      <el-table
        v-loading="loading"
        :data="buildingData"
        border
        style="width: 100%"
        @sort-change="factorySortChange"
      >
        <el-table-column prop="factoryName" :label="GLOBAL.secondLevel"></el-table-column>
        <el-table-column prop="factoryPhoneNumber" label="电话"></el-table-column>
        <el-table-column prop="factoryAddress" label="地址"></el-table-column>
        <el-table-column prop="city" :label="'所属'+GLOBAL.firstLevel"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" sortable="custom"></el-table-column>
        <el-table-column prop="updateTime" label="更新时间" sortable="custom"></el-table-column>
        <el-table-column prop="remark" label="备注"></el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          v-if="checkRegionAuth(['CONFIGURE_REGION_DELETE', 'CONFIGURE_REGION_UPDATE'])"
        >
          <template slot-scope="scope">
            <el-button
              @click="openBuildingUpdateForm(scope.row)"
              type="text"
              size="small"
              v-if="checkRegionAuth(['CONFIGURE_REGION_UPDATE'])"
            >修改</el-button>
            <el-button
              @click="deleteBuilding(scope.row)"
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
        :total="factoryTotalPage"
        :current-page.sync="factoryCurPage"
        :page-size="6"
        @current-change="factoryPageChange()"
      ></el-pagination>
    </div>
    <br />
    <AddFactory :factoryAddVisible.sync="factoryAddVisible" :onClose="onChangeFactoryClose"></AddFactory>
    <UpdateFactory
      :factoryUpdateVisible.sync="factoryUpdateVisible"
      :onClose="onChangeFactoryClose"
      :defaultData="updateFactoryData"
    ></UpdateFactory>
  </div>
</template>

<script>
import {
  getFactory,
  getFactoryNumber,
  deleteFactory,
  getFactoryByFactoryName,
  getFactoryAffiliateWorkshop,
  getFactoryAffiliateDevice,
  getFactoryAffiliateGateway,
} from "../../api/api";
import { checkAuth } from "../../common/util";
import AddFactory from "../../components/Dialogues/AddFactory";
import UpdateFactory from "../../components/Dialogues/UpdateFactory";
export default {
  name: "Level2",
  components: { AddFactory, UpdateFactory },
  data() {
    return {
      loading: false,
      //factory-search-container
      searchBuilding: "",
      //factory-table-container
      factoryTotalPage: 0,
      factoryCurPage: 1,
      factoryCurSortColumn: "",
      factoryCurOrder: "",
      buildingData: [],
      //factory修改el-dialog
      factoryUpdateVisible: false,
      updateFactoryData: [],
      //factory添加el-dialog
      factoryAddVisible: false,
      factoryList: [],
      pageMode: 1
    };
  },
  methods: {
    checkRegionAuth(auth) {
      return checkAuth(auth);
    },
    async searchByBuilding() {
      if (this.searchBuilding !== "") {
        this.buildingData = (await getFactoryByFactoryName(
          this.searchBuilding
        )).data.d;
      } else {
        this.buildingData = this.getFactory();
      }
    },
    async getFactory() {
      this.loading = true;
      const orderMap = { ascending: "asc", descending: "desc" };
      const columnMap = {
        id: "id",
        updateTime: "updateTime",
        createTime: "createTime"
      };
      const searchColumn =
        this.factoryCurSortColumn === ""
          ? "id"
          : columnMap[this.factoryCurSortColumn];
      const searchOrder =
        this.factoryCurOrder === "" ? "asc" : orderMap[this.factoryCurOrder];
      const searchFactoryName =
        this.searchBuilding === "全部" ? "all" : this.searchBuilding;
      const data = await getFactory(
        this.factoryCurPage,
        searchColumn,
        searchOrder,
        this.pageMode
      );
      this.buildingData = data.data.d;
      this.getFactoryTotalPage("search", searchFactoryName);
      this.loading = false;
    },
    async factoryPageChange() {
      this.getFactory();
    },
    async getFactoryTotalPage(searchType, factory = "all") {
      if (searchType === "all") {
        this.factoryTotalPage = (await getFactoryNumber("all")).data.d;
      } else if (searchType === "search") {
        const f = factory === "全部" ? "all" : factory;
        this.factoryTotalPage = (await getFactoryNumber("search", f)).data.d;
      }
    },
    async factorySortChange(ob) {
      this.factoryCurSortColumn = ob.prop;
      this.factoryCurOrder = ob.order;
      this.getFactory();
    },
    async openBuildingUpdateForm(row) {
      //打开更新表单
      this.updateFactoryData = row;
      this.factoryUpdateVisible = true;
    },
    async deleteBuilding(row) {
      const affiliateWorkshop = (await getFactoryAffiliateWorkshop(row.id)).data
        .d;
      const affiliateDevice = (await getFactoryAffiliateDevice(row.id)).data.d;
      const affiliateGateway = (await getFactoryAffiliateGateway(row.id)).data
        .d;
      if (
        affiliateWorkshop === 0 &&
        affiliateDevice === 0 &&
        affiliateGateway === 0
      ) {
        try {
          this.$confirm("确认删除？")
            .then(async _ => {
              const data = await deleteFactory(row.id);
              if (data.data.c === 200) {
                this.$message({
                  message: "删除成功",
                  type: "success"
                });
                //再获取一次所有实验楼信息
                this.getFactory();
              }
            })
            .catch(_ => {});
        } catch (e) {
          console.log(e);
        }
      } else {
        this.$msgbox(
          "该实验楼有" +
            affiliateWorkshop +
            "下属实验室, " +
            affiliateDevice +
            "个下属设备， " +
            affiliateGateway +
            "个下属网关, 无法被删除"
        );
      }
    },
    onChangeFactoryClose () {
      this.getFactory();
    }
  },
  async mounted() {
    this.getFactoryTotalPage("all");
    this.getFactory();
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
