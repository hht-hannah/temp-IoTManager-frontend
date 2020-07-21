<template>
  <div>
    <div class="search-container">
      <el-form :inline="true" class="header">
        <el-form-item>
          <h2 id="third">{{GLOBAL.thirdLevel}}</h2>
        </el-form-item>
        <el-form-item v-if="checkRegionAuth(['CONFIGURE_REGION_RETRIEVE'])">
          <el-input v-model="searchLab" :placeholder=" '请输入' + GLOBAL.thirdLevel + '名'"></el-input>
        </el-form-item>
        <el-form-item v-if="checkRegionAuth(['CONFIGURE_REGION_RETRIEVE'])">
          <el-button type="primary" @click="searchByLab">搜索</el-button>
        </el-form-item>
        <el-form-item v-if="checkRegionAuth(['CONFIGURE_REGION_CREATE'])">
          <el-button type="primary" @click="workshopAddVisible = true">添加{{GLOBAL.thirdLevel}}</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table-container" v-if="checkRegionAuth(['CONFIGURE_REGION_RETRIEVE'])">
      <el-table
        v-loading="loading"
        :data="labData"
        style="width: 100%"
        @sort-change="workshopSortChange"
      >
        <el-table-column prop="workshopName" :label="GLOBAL.thirdLevel"></el-table-column>
        <el-table-column prop="workshopPhoneNumber" label="电话"></el-table-column>
        <el-table-column prop="workshopAddress" label="地址"></el-table-column>
        <el-table-column prop="city" :label="'所属'+GLOBAL.firstLevel"></el-table-column>
        <el-table-column prop="factory" :label="'所属'+GLOBAL.secondLevel"></el-table-column>
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
              @click="openLabUpdateForm(scope.row)"
              type="text"
              size="small"
              v-if="checkRegionAuth(['CONFIGURE_REGION_UPDATE'])"
            >修改</el-button>
            <el-button
              @click="deleteLab(scope.row)"
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
        :total="workshopTotalPage"
        :current-page.sync="workshopCurPage"
        :page-size="6"
        @current-change="workshopPageChange()"
      ></el-pagination>
    </div>
    <br />

        <UpdateWorkshop
      :workshopUpdateVisible.sync="workshopUpdateVisible"
      :onClose="onChangeWorkshopClose"
      :defaultData="updateWorkshopData"
    ></UpdateWorkshop>
    <AddWorkshop :workshopAddVisible.sync="workshopAddVisible" :onClose="onChangeWorkshopClose"></AddWorkshop>
  </div>
</template>

<script>
import {
  getWorkshopOptions,
  getWorkshop,
  getWorkshopNumber,
  deleteWorkshop,
  addWorkshop,
  updateWorkshop,
  getWorkshopByWorkshopName,
  getWorkshopAffiliateGateway,
  getWorkshopAffiliateDevice,
  listWorkshopName,
  getCityOptions,
  getFactoryOptions,
  getFactory,
  getNewFactory
} from "../../api/api";
import { checkAuth } from "../../common/util";
import AddWorkshop from "../../components/Dialogues/AddWorkshop";
import UpdateWorkshop from "../../components/Dialogues/UpdateWorkshop";

export default {
  name: "level3",
  components: { AddWorkshop, UpdateWorkshop },
  data() {
    return {
      loading: false,
      searchLab: "",
      //workshop-table-container
      workshopTotalPage: 0,
      workshopCurPage: 1,
      workshopCurSortColumn: "",
      workshopCurOrder: "",
      labData: [],
      changeWorkshopForm: "",
      labList: [],
      workshopUpdateVisible: false,
      workshopAddVisible: false,
      updateWorkshopData: [],
      updateBuildingData: {
        factoryName: "",
        factoryPhoneNumber: "",
        factoryAddress: "",
        city: "",
        remark: ""
      },
      pageMode: 1,
      cityList: [],
      buildingList: [],
      factoryList: []
    };
  },
  methods: {
    checkRegionAuth(auth) {
      return checkAuth(auth);
    },
    async searchByLab() {
      console.log(this.searchLab);
      if (this.searchLab !== "") {
        this.labData = (await getWorkshopByWorkshopName(this.searchLab)).data.d;
      } else {
        this.labData = this.getWorkshop();
      }
    },
    async getUpdateLabList(city) {
      this.LabList = (await getWorkshopOptions(city)).data.d;
      if (this.LabList[0] != null) {
        this.updateWorkshopData.workshopName = this.labList[0].value;
      } else {
        this.updateWorkshopData.workshopName = "";
        this.labList = [];
      }
    },

    async getWorkshop() {
      this.loading = true;
      const orderMap = { ascending: "asc", descending: "desc" };
      const columnMap = {
        id: "id",
        updateTime: "updateTime",
        createTime: "createTime"
      };
      const searchColumn =
        this.workshopCurSortColumn === ""
          ? "id"
          : columnMap[this.workshopCurSortColumn];
      const searchOrder =
        this.workshopCurOrder === "" ? "asc" : orderMap[this.workshopCurOrder];
      const searchWorkshopName =
        this.searchLab === "全部" ? "all" : this.searchLab;
      const data = await getWorkshop(
        this.workshopCurPage,
        searchColumn,
        searchOrder,
        this.pageMode
      );
      this.labData = data.data.d;
      this.getWorkshopTotalPage("search", searchWorkshopName);
      this.loading = false;
    },
    async workshopPageChange() {
      this.getWorkshop();
    },
    async getWorkshopTotalPage(searchType, workshop = "all") {
      if (searchType === "all") {
        this.workshopTotalPage = (await getWorkshopNumber("all")).data.d;
      } else if (searchType === "search") {
        const w = workshop === "全部" ? "all" : workshop;
        this.workshopTotalPage = (await getWorkshopNumber("search", w)).data.d;
      }
    },
    async workshopSortChange(ob) {
      this.workshopCurSortColumn = ob.prop;
      this.workshopCurOrder = ob.order;
      this.getWorkshop();
    },
    async openLabUpdateForm(row) {
      //打开实验室更新表单
      this.updateWorkshopData = JSON.parse(JSON.stringify(row));
      this.workshopUpdateVisible = true;
      this.getUpdateBuildingList(this.updateWorkshopData.city);
    },
    async deleteLab(row) {
      const affiliateDevice = (await getWorkshopAffiliateDevice(row.id)).data.d;
      const affiliateGateway = (await getWorkshopAffiliateGateway(row.id)).data
        .d;
      if (affiliateDevice === 0 && affiliateGateway === 0) {
        try {
          this.$confirm("确认删除？")
            .then(async _ => {
              const data = await deleteWorkshop(row.id);
              if (data.data.c === 200) {
                this.$message({
                  message: "删除成功",
                  type: "success"
                });
                //再获取一次所有实验室信息
                this.getWorkshop();
              }
            })
            .catch(_ => {});
        } catch (e) {
          console.log(e);
        }
      } else {
        this.$msgbox(
          "该实验室有" +
            affiliateDevice +
            "个下属设备, " +
            affiliateGateway +
            "个下属网关, 无法被删除"
        );
      }
    },
    async getNewFactory(city) {
      this.factoryList = (await getFactoryOptions(city)).data.d;
      if (this.factoryList.length != 0) {
        this.newLabData.factory = this.factoryList[0].value;
      } else {
        this.newLabData.factory = null;
      }
    },
    async getUpdateBuildingList(city) {
      this.buildingList = (await getFactoryOptions(city)).data.d;
      if (this.buildingList != null && this.buildingList.length > 0) {
        this.updateBuildingData.buildingName = this.buildingList[0].value;
      } else {
        this.updateBuildingData.buildingName = "";
        this.buildingList = [];
      }
    },
    onChangeWorkshopClose() {
      this.getWorkshop();
    }
  },
  async mounted() {
    this.getWorkshopTotalPage("all");
    this.getWorkshop();
    this.cityList = (await getCityOptions()).data.d;
    this.buildingList = (await getFactory(1, "id", "asc", 0)).data.d;
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