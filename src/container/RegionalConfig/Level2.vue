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
          <el-button type="primary" @click="newBuildingFormVisible = true">添加{{GLOBAL.secondLevel}}</el-button>
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

    <el-dialog :title="'修改'+GLOBAL.secondLevel" :visible.sync="updateBuildingFormVisible">
      <el-form :model="updateBuildingData" ref="updateBuildingData">
        <el-form-item
          :label="'所属'+GLOBAL.firstLevel"
          prop="city"
          label-width="120px"
          :rules="[{required: true, message: GLOBAL.firstLevel+'不能为空'}]"
        >
          <el-select v-model="updateBuildingData.city" :placeholder="'选择'+GLOBAL.firstLevel">
            <el-option v-for="c in cityList" :key="c.value" :label="c.label" :value="c.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          :label="GLOBAL.secondLevel"
          prop="factoryName"
          label-width="120px"
          :rules="[{required: true, message: GLOBAL.secondLevel+'不能为空'}]"
        >
          <el-input v-model="updateBuildingData.factoryName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="电话" label-width="120px">
          <el-input v-model="updateBuildingData.factoryPhoneNumber" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="地址" label-width="120px">
          <el-input v-model="updateBuildingData.factoryAddress" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="备注" label-width="120px">
          <el-input v-model="updateBuildingData.remark" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="updateBuildingFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateBuilding('updateBuildingData')">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="'添加'+GLOBAL.secondLevel" :visible.sync="newBuildingFormVisible">
      <el-form :model="newBuildingData" ref="newBuildingData">
        <el-form-item
          :label="'所属'+GLOBAL.firstLevel"
          prop="city"
          label-width="120px"
          :rules="[{required: true, message: GLOBAL.firstLevel+'不能为空'}]"
        >
          <el-select v-model="newBuildingData.city" :placeholder="'选择'+GLOBAL.firstLevel">
            <el-option v-for="c in cityList" :key="c.value" :label="c.label" :value="c.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          :label="GLOBAL.secondLevel"
          prop="factoryName"
          label-width="120px"
          :rules="[{required: true, message: GLOBAL.secondLevel+'不能为空'}]"
        >
          <el-input v-model="newBuildingData.factoryName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="电话" label-width="120px">
          <el-input v-model="newBuildingData.factoryPhoneNumber" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="地址" label-width="120px">
          <el-input v-model="newBuildingData.factoryAddress" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="备注" label-width="120px">
          <el-input v-model="newBuildingData.remark" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="newBuildingFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addBuilding('newBuildingData')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getFactoryOptions,
  getFactory,
  getFactoryNumber,
  deleteFactory,
  addFactory,
  updateFactory,
  getFactoryByFactoryName,
  getFactoryAffiliateWorkshop,
  getFactoryAffiliateDevice,
  getFactoryAffiliateGateway,
  getCityOptions
} from "../../api/api";
import { checkAuth } from "../../common/util";
export default {
  name: "Level2",
  data() {
    return {
      loading: false,
      cityList: [],
      //factory-search-container
      searchBuilding: "",
      //factory-table-container
      factoryTotalPage: 0,
      factoryCurPage: 1,
      factoryCurSortColumn: "",
      factoryCurOrder: "",
      buildingData: [],
      //factory修改el-dialog
      buildingList: [],
      updateBuildingFormVisible: false,
      updateBuildingData: {
        factoryName: "",
        factoryPhoneNumber: "",
        factoryAddress: "",
        city: "",
        remark: ""
      },
      //factory添加el-dialog
      newBuildingFormVisible: false,
      newBuildingData: {
        factoryName: "",
        factoryPhoneNumber: "",
        factoryAddress: "",
        city: "",
        remark: ""
      },
      changeFactoryForm: "",
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
        this.buildingData = (
          await getFactoryByFactoryName(this.searchBuilding)
        ).data.d;
      } else {
        this.buildingData = this.getFactory();
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
      console.log(this.updateLabData.city);
      if (this.buildingList != null) {
        this.updateBuildingData.buildingName = this.buildingList[0].value;
      } else {
        this.updateBuildingData.buildingName = "";
        this.buildingList = [];
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
    async updateBuilding(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          try {
            const data = await updateFactory(
              this.updateBuildingData.id,
              this.updateBuildingData
            );
            this.updateBuildingFormVisible = false;
            if (data.data.c === 200) {
              this.$message({
                message: "更新成功",
                type: "success"
              });
              //再获取一次所有实验楼信息
              this.getFactory();
            }
          } catch (e) {
            this.updateBuildingFormVisible = false;
            this.$message.error("更新实验楼未成功");
          }
        }
      });
    },
    async openBuildingUpdateForm(row) {
      //打开更新表单
      this.updateBuildingData = JSON.parse(JSON.stringify(row));
      this.updateBuildingFormVisible = true;
    },
    async addBuilding(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          try {
            const data = await addFactory(this.newBuildingData);
            this.newBuildingFormVisible = false;
            if (data.data.c === 200) {
              this.$message({
                message: "添加成功",
                type: "success"
              });
              //再获取一次所有实验楼信息
              this.getFactory();
            }
          } catch (e) {
            this.newBuildingFormVisible = false;
            this.$message.error("添加实验楼未成功");
          }
        }
      });
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
    }
  },
  async mounted() {
    this.getFactoryTotalPage("all");
    this.getFactory();
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
