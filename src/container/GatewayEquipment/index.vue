<template>
  <div>
    <h2 class="page-title">网关设备</h2>
    <div class="search-container">
      <el-form :inline="true" :model="searchGateway" class="header">
        <el-form-item v-if="checkGatewayAuth(['GATEWAY_RETRIEVE'])">
          <el-cascader
            v-model="cascaderValue"
            :placeholder="'选择' + GLOBAL.firstLevel + '/' + GLOBAL.secondLevel + '/' + GLOBAL.thirdLevel "
            :options="cascaderOptions"
            @change="searchCascader"
          ></el-cascader>
        </el-form-item>
        <el-form-item v-if="checkGatewayAuth(['GATEWAY_EXPORT_EXCEL'])">
          <el-button type="primary" @click="exportExcel">导出Excel</el-button>
        </el-form-item>
        <el-form-item v-if="checkGatewayAuth(['GATEWAY_IMPORT_EXCEL'])">
          <el-upload
            ref="upload"
            action="https://jsonplaceholder.typicode.com/posts/"
            :show-file-list="false"
            :on-success="readExcel"
            :on-error="uploadFailed"
            :file-list="fileList"
          >
            <el-button slot="trigger" type="primary">导入excel</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
    </div>
    <div class="addbutton-container" v-if="checkGatewayAuth(['GATEWAY_CREATE'])">
      <el-button type="primary" @click="newFormVisible = true">新增网关</el-button>
      <el-button
        type="primary"
        @click="multipleDelete"
        v-if="checkGatewayAuth(['GATEWAY_DELETE'])"
      >批量删除</el-button>
    </div>
    <div class="table-container" v-if="checkGatewayAuth(['GATEWAY_RETRIEVE'])">
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @sort-change="sortChange"
        id="gateway-equipment-out-table"
      >
        <el-table-column type="selection" v-if="checkGatewayAuth(['GATEWAY_DELETE'])"></el-table-column>
        <el-table-column prop="hardwareGatewayID" label="网关编号" sortable="custom"></el-table-column>
        <el-table-column prop="gatewayName" label="网关名称" sortable="custom"></el-table-column>
        <el-table-column prop="gatewayType" label="网关类型"></el-table-column>
        <el-table-column prop="city" :label="GLOBAL.firstLevel"></el-table-column>
        <el-table-column prop="factory" :label="GLOBAL.secondLevel"></el-table-column>
        <el-table-column prop="workshop" :label="GLOBAL.thirdLevel"></el-table-column>
        <!--<el-table-column
          prop="gatewayState"
          label="网关状态"
          width="120">
        </el-table-column>-->
        <!--<el-table-column
          prop="lastConnectionTime"
          label="上次连接时间"
          width="120">
        </el-table-column>-->
        <el-table-column prop="createTime" label="创建时间" sortable="custom"></el-table-column>
        <el-table-column prop="updateTime" label="更新时间" sortable="custom"></el-table-column>
        <!--<el-table-column
          prop="department"
          label="部门"
          width="120">
        </el-table-column>-->
        <el-table-column prop="remark" label="描述"></el-table-column>
        <!--<el-table-column
          prop="imageUrl"
          label="网关图像链接"
          width="120">
        </el-table-column>-->
        <el-table-column
          fixed="right"
          label="操作"
          v-if="checkGatewayAuth(['GATEWAY_UPDATE', 'GATEWAY_DELETE'])"
        >
          <template slot-scope="scope">
            <el-button
              @click="openUpdateForm(scope.row)"
              type="text"
              size="small"
              v-if="checkGatewayAuth(['GATEWAY_UPDATE'])"
            >修改</el-button>
            <el-button
              @click="deleteGateway(scope.row)"
              type="text"
              size="small"
              v-if="checkGatewayAuth(['GATEWAY_DELETE'])"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        layout="prev, pager, next"
        :total="totalPage"
        :current-page.sync="curPage"
        :page-size="12"
        @current-change="pageChange()"
      ></el-pagination>
    </div>
    <AddNewGateway
      :newFormVisible.sync="newFormVisible"
      @getGateways="getGateways"
      :getDeviceOptions="getDeviceOptions"
    ></AddNewGateway>
    <UpdateGateway
      :updateFormVisible.sync="updateFormVisible"
      :defaultData="updateData"
      @getGateways="getGateways"
      :getDeviceOptions="getDeviceOptions"
    ></UpdateGateway>
  </div>
</template>

<script>
import {
  addGatewayApi,
  deleteGatewayApi,
  deleteMultipleGatewayApi,
  getAffiliateDeviceNumber,
  getCityCascaderOptions,
  getGatewayByWorkshop,
  getGatewayNumber,
  getGatewaysApi,
  searchGatewaysApi
} from "../../api/api";
import AddNewGateway from "./AddNewGateway";
import UpdateGateway from "./UpdateGateway";
import FileSaver from "file-saver";
import XLSX from "xlsx";
import { checkAuth } from "../../common/util";
export default {
  name: "GatewayEquipment",
  components: { AddNewGateway, UpdateGateway },
  data() {
    return {
      loading: false,
      totalPage: 0,
      curPage: 1,
      curSortColumn: "",
      curOrder: "",
      cascaderValue: [],
      cascaderOptions: [],
      updateFormVisible: false,
      newFormVisible: false,
      tableData: [
        {
          id: "1",
          hardwareGatewayID: "T001",
          gatewayName: "",
          gatewayType: "",
          city: "",
          factory: "",
          workshop: "",
          gatewayState: "",
          lastConnectionTime: "",
          imageUrl: "",
          createTime: "",
          updateTime: "",
          remark: "",
          department: ""
        }
      ],
      multipleSelection: [],
      updateData: {
        hardwareGatewayID: "",
        gatewayName: "",
        gatewayType: "",
        city: "",
        factory: "",
        workshop: "",
        gatewayState: "",
        imageUrl: "",
        remark: "",
        department: ""
      },
      newGatewayData: {},
      searchGateway: {
        city: "all",
        factory: "all",
        workshop: "all"
      },
      searchData: {
        deviceID: "",
        deviceName: ""
      },
      fileList: [],
      deleteData: {
        number: []
      }
    };
  },
  methods: {
    checkGatewayAuth(auth) {
      return checkAuth(auth);
    },
    uploadFailed() {
      this.$message.error("导入失败");
    },
    async readExcel(res, file) {
      let vm = this;
      const fileReader = new FileReader();
      fileReader.onload = ev => {
        try {
          const data = ev.target.result;
          const workbook = XLSX.read(data, {
            type: "binary"
          });
          let sheetArray;
          for (let sheet in workbook.Sheets) {
            sheetArray = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
          }
          let dictionary = {
            网关编号: "hardwareGatewayID",
            网关名称: "gatewayName",
            更新时间: "gatewayType",
            城市: "city",
            实验楼: "factory",
            实验室: "workshop",
            网关状态: "gatewayState",
            上次连接时间: "lastConnectionTime",
            网关图像链接: "imageUrl",
            创建时间: "createTime",
            更新时间: "updateTime",
            描述: "remark",
            部门: "department"
          };
          let newData = sheetArray.map(item => {
            let obj = {};
            for (let key in item) {
              obj[dictionary[key]] = item[key];
            }
            return obj;
          });
          const t = newData.forEach(async ob => {
            const data = (await addGatewayApi(ob)).data.d;
            if (data === "success") {
              this.getGateways();
            }
          });
          // 导入接口，将数据导入后端
          this.$message({
            message: "导入成功",
            type: "success"
          });
        } catch (e) {
          this.$message.warning("文件类型不正确！");
          return false;
        }
      };
      fileReader.readAsBinaryString(file.raw);
    },
    exportExcel() {
      var fix = document.querySelector(".el-table__fixed-right");
      var wb;
      if (fix) {
        wb = XLSX.utils.table_to_book(
          document
            .querySelector("#gateway-equipment-out-table")
            .removeChild(fix)
        );
        console.log("test");
        document.querySelector("#gateway-equipment-out-table").appendChild(fix);
      } else {
        wb = XLSX.utils.table_to_book(
          document.querySelector("#gateway-equipment-out-table")
        );
      }
      /* get binary string as output */
      var wbout = XLSX.write(wb, {
        bookType: "xlsx",
        bookSST: true,
        type: "array"
      });
      try {
        FileSaver.saveAs(
          new Blob([wbout], {
            type: "application/octet-stream"
          }),
          "网关设备.xlsx"
        );
      } catch (e) {
        if (typeof console !== "undefined") console.log(e, wbout);
      }
      return wbout;
    },
    async searchGatewayByName() {
      const data = await searchGatewaysApi(this.searchData);
      this.tableData = data.data.d;
    },
    async openUpdateForm(row) {
      //打开更新表单
      this.updateData = row;
      this.updateFormVisible = true;
    },
    async deleteGateway(row) {
      const affiliateDeviceNumber = (await getAffiliateDeviceNumber(row.id))
        .data.d;
      if (affiliateDeviceNumber === 0) {
        try {
          this.$confirm("确认删除？")
            .then(async _ => {
              const data = await deleteGatewayApi(row.id);
              if (data.data.c === 200) {
                this.$message({
                  message: "删除成功",
                  type: "success"
                });
                //再获取一次所有网关信息
                this.getGateways();
              }
            })
            .catch(_ => {});
        } catch (e) {
          console.log(e);
        }
      } else {
        this.$msgbox(
          "该网关有" + affiliateDeviceNumber + "个关联设备，无法被删除"
        );
      }
    },
    async getGateways() {
      this.loading = true;
      const orderMap = { ascending: "asc", descending: "desc" };
      const searchColumn =
        this.curSortColumn === "" ? "id" : this.curSortColumn;
      const searchOrder =
        this.curOrder === "" ? "asc" : orderMap[this.curOrder];
      const searchCity =
        this.searchGateway.city === "全部" ? "all" : this.searchGateway.city;
      const searchFactory =
        this.searchGateway.factory === "全部"
          ? "all"
          : this.searchGateway.factory;
      const searchWorkshop =
        this.searchGateway.workshop === "全部"
          ? "all"
          : this.searchGateway.workshop;
      const data = await getGatewaysApi(
        "search",
        this.curPage,
        searchColumn,
        searchOrder,
        searchCity,
        searchFactory,
        searchWorkshop
      );
      this.tableData = data.data.d;
      this.getTotalPage("search", searchCity, searchFactory, searchWorkshop);
      this.loading = false;
    },
    handleSelectionChange(val) {
      console.log("change", this.multipleSelection);
      this.multipleSelection = val;
    },
    async multipleDelete() {
      try {
        this.$confirm("确认删除？")
          .then(async _ => {
            this.deleteData.number = this.multipleSelection.map(el => el.id);
            const data = await deleteMultipleGatewayApi(this.deleteData);
            if (data.data.c === 200) {
              this.$message({
                message: "删除成功",
                type: "success"
              });
              //再获取一次所有网关信息
              this.getGateways();
            }
          })
          .catch(_ => {});
      } catch (e) {
        console.log(e);
      }
    },
    // 标签处理函数
    handleClose(tag) {
      this.newGatewayData.dynamicTags.splice(
        this.newGatewayData.dynamicTags.indexOf(tag),
        1
      );
    },
    showInput() {
      this.newGatewayData.inputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    handleInputConfirm() {
      let inputValue = this.newGatewayData.inputValue;
      if (inputValue) {
        this.newGatewayData.dynamicTags.push(inputValue);
      }
      this.newGatewayData.inputVisible = false;
      this.newGatewayData.inputValue = "";
    },
    async filter(city, factory, workshop) {
      if (city !== "全部") {
        const data = await getGatewayByWorkshop(city, factory, workshop);
        this.tableData = data.data.d;
      } else {
        this.getGateways();
      }
      //调接口，传searchGateway参数
    },
    async pageChange() {
      this.getGateways();
    },
    async sortChange(ob) {
      this.curSortColumn = ob.prop;
      this.curOrder = ob.order;
      this.getGateways();
    },
    async searchCascader() {
      this.curPage = 1;
      this.searchGateway.city = this.cascaderValue[0];
      this.searchGateway.factory = this.cascaderValue[1];
      this.searchGateway.workshop = this.cascaderValue[2];
      this.getGateways();
    },
    async getDeviceOptions() {
      this.cascaderOptions = (await getCityCascaderOptions()).data.d;
    },
    async getTotalPage(
      searchType,
      city = "all",
      factory = "all",
      workshop = "all"
    ) {
      if (searchType === "all") {
        this.totalPage = (await getGatewayNumber("all")).data.d;
      } else if (searchType === "search") {
        const c = city === "全部" ? "all" : city;
        const f = factory === "全部" ? "all" : factory;
        const w = workshop === "全部" ? "all" : workshop;
        this.totalPage = (await getGatewayNumber("search", c, f, w)).data.d;
      }
    }
  },
  async mounted() {
    this.getTotalPage("all");
    this.getDeviceOptions();
    //获取所有网关信息
    this.getGateways();
  }
};
</script>

<style scoped>
@import "../../assets/scss/variaties.scss";

.el-form {
  margin: 10px 0 -10px 10px;
}

.export-excel-button,
.upload-excel-button {
  float: right;
}

.addbutton-container,
.table-container {
  margin: 1% 1%;
  text-align: left;
}

.gateway-radio {
  margin: 0 auto 10px;
  width: 200px;
}

/*标签处理*/
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}

.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}

.tag-center {
  text-align: center;
}
</style>
