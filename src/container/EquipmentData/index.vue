<template>
  <div>
    <h2 class="page-title">设备数据</h2>
    <div class="search-container">
      <el-form :inline="true" :model="searchDevice" class="header">
        <el-form-item v-if="checkDeviceDataAuth(['DEVICEDATA_RETRIEVE'])">
          <el-select
            v-model="curSearchDevice"
            filterable
            @change="getDeviceData"
            placeholder="请选择设备"
          >
            <el-option value="全部" label="全部"></el-option>
            <el-option
              v-for="d in deviceOptions"
              :key="d.id"
              :label="d.deviceName"
              :value="d.hardwareDeviceID"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          class="export-excel-button"
          v-if="checkDeviceDataAuth(['DEVICEDATA_EXPORT_EXCEL'])"
        >
          <el-button type="primary" @click="exportExcel">导出Excel</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="addbutton-container">
      <el-button
        type="primary"
        @click="multipleDelete"
        v-if="checkDeviceDataAuth(['DEVICEDATA_DELETE'])"
      >批量删除</el-button>
    </div>
    <div class="table-container" v-if="checkDeviceDataAuth(['DEVICEDATA_RETRIEVE'])">
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @sort-change="sortChange"
        id="equipment-data-out-table"
      >
        <el-table-column
          type="selection"
          width="55"
          v-if="checkDeviceDataAuth(['DEVICEDATA_DELETE'])"
        ></el-table-column>
        <!-- <el-table-column
          prop="id"
          label="数据编号"
          sortable="custom">
        </el-table-column>-->
        <el-table-column prop="deviceId" label="设备ID" sortable="custom"></el-table-column>
        <el-table-column prop="indexName" label="属性名称" sortable="custom"></el-table-column>
        <el-table-column prop="indexId" label="属性ID" sortable="custom"></el-table-column>
        <el-table-column prop="indexType" label="属性类型"></el-table-column>
        <el-table-column prop="indexValue" label="值"></el-table-column>
        <el-table-column prop="indexUnit" label="单位"></el-table-column>
        <el-table-column prop="timestamp" label="时间" sortable="custom"></el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          width="120"
          v-if="checkDeviceDataAuth(['DEVICEDATA_DELETE', 'DEVICEDATA_UPDATE'])"
        >
          <template slot-scope="scope">
            <el-button
              @click="openUpdateForm(scope.row)"
              type="text"
              size="small"
              v-if="checkDeviceDataAuth(['DEVICEDATA_UPDATE'])"
            >修改</el-button>
            <el-button
              @click="deleteDevice(scope.row)"
              type="text"
              size="small"
              v-if="checkDeviceDataAuth(['DEVICEDATA_DELETE'])"
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
    <UpdateEquipmentData
      :updateFormVisible.sync="updateFormVisible"
      :onClose="onUpdateClose"
      :defaultData="updateData"
    ></UpdateEquipmentData>
  </div>
</template>

<script>
import {
  getDeviceDataNumber,
  addDeviceDataApi,
  deleteDeviceDataApi,
  deleteMultipleDataApi,
  getCityCascaderOptions,
  getCityOptions,
  getDevicesApi,
  getDevicesDataApi,
  searchDeviceDataApi,
  updateDeviceDataApi,
  deleteDeviceData,
  batchDeleteDeviceData,
  updateDeviceData
} from "../../api/api";
import UpdateEquipmentData from "./UpdateEquipmentData";
import FileSaver from "file-saver";
import XLSX from "xlsx";
import { checkAuth } from "../../common/util";

export default {
  name: "EquipmentData",
  components: { UpdateEquipmentData },
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
      deviceOptions: [],
      curSearchDevice: "全部",
      tableData: [
        {
          id: "1",
          dataName: "6",
          deviceName: "设备1",
          deviceId: "8",
          indexName: "",
          indexType: "",
          indexId: "",
          indexValue: "",
          indexUnit: "",
          timestamp: ""
        }
      ],
      //allTableData: [],
      multipleSelection: [],
      updateData: [],
      newDeviceData: {
        hardwareDeviceID: "",
        DeviceName: "",
        hardwareGatewayID: "",
        gatewayName: "",
        data: "",
        remark: "",

        // 标签
        inputVisible: false,
        inputValue: "",
        dynamicTags: ["标签一", "标签二", "标签三"]
      },
      searchData: {
        deviceID: "",
        deviceName: ""
      },
      searchDevice: {
        city: "all",
        factory: "all",
        workshop: "all"
      }
    };
  },

  methods: {
    checkDeviceDataAuth(auth) {
      return checkAuth(auth);
    },
    uploadFailed() {
      this.$message.error("导入失败");
    },
    // readExcel(res, file) {
    //   console.log("testss", file);
    //   let vm = this;
    //   const fileReader = new FileReader();
    //   fileReader.onload = ev => {
    //     try {
    //       const data = ev.target.result;
    //       const workbook = XLSX.read(data, {
    //         type: "binary"
    //       });
    //       let sheetArray;
    //       for (let sheet in workbook.Sheets) {
    //         sheetArray = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
    //       }
    //       let dictionary = {
    //         数据编号: "ID",
    //         所属网关编号: "hardwareGatewayID",
    //         所属网关名称: "gatewayName",
    //         所属设备编号: "hardwareDeviceID",
    //         所属设备名称: "deviceName",
    //         数据: "data",
    //         创建时间: "createTime",
    //         描述: "remark"
    //       };
    //       let newData = sheetArray.map(item => {
    //         let obj = {};
    //         for (let key in item) {
    //           obj[dictionary[key]] = item[key];
    //         }
    //         return obj;
    //       });
    //       // 导入接口，将数据导入后端
    //       vm.tableData.push(...newData);
    //       this.$message({
    //         message: "导入成功",
    //         type: "success"
    //       });
    //     } catch (e) {
    //       this.$message.warning("文件类型不正确！");
    //       return false;
    //     }
    //   };
    //   fileReader.readAsBinaryString(file.raw);
    // },
    exportExcel() {
      var fix = document.querySelector(".el-table__fixed-right");
      var wb;
      if (fix) {
        wb = XLSX.utils.table_to_book(
          document.querySelector("#equipment-data-out-table").removeChild(fix)
        );
        console.log("test");
        document.querySelector("#equipment-data-out-table").appendChild(fix);
      } else {
        wb = XLSX.utils.table_to_book(
          document.querySelector("#equipment-data-out-table")
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
          "设备数据.xlsx"
        );
      } catch (e) {
        if (typeof console !== "undefined") console.log(e, wbout);
      }
      return wbout;
    },
    async searchDeviceByName() {
      const data = await searchDeviceDataApi(this.searchData);
      this.tableData = data.data.d;
    },
    // async add() {
    //   try {
    //     const data = await addDeviceDataApi(this.newDeviceData);
    //     this.newFormVisible = false;
    //     if (data.data.c === 200) {
    //       this.$message({
    //         message: "添加成功",
    //         type: "success"
    //       });
    //       this.getDeviceData();
    //     }
    //   } catch (e) {
    //     this.newFormVisible = false;
    //     this.$message.error("添加设备未成功");
    //   }
    // },
    async openUpdateForm(row) {
      //打开更新表单
      // console.log(row.id);
      this.updateData = row;
      this.updateFormVisible = true;
    },
    async deleteDevice(row) {
      try {
        this.$confirm("确认删除？")
          .then(async _ => {
            const data = await deleteDeviceData(row.id);
            if (data.data.c === 200) {
              this.$message({
                message: "删除成功",
                type: "success"
              });
              //再获取一次所有网关信息
              this.getDeviceData();
            }
          })
          .catch(_ => {});
      } catch (e) {
        console.log(e);
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    async multipleDelete() {
      try {
        this.$confirm("确认删除？")
          .then(async _ => {
            console.log(this.multipleSelection.map(el => el.id));
            const data = await batchDeleteDeviceData(
              this.multipleSelection.map(el => el.id)
            );
            if (data.data.c === 200) {
              this.$message({
                message: "删除成功",
                type: "success"
              });
              //再获取一次所有网关信息
              this.getDeviceData();
            }
          })
          .catch(_ => {});
      } catch (e) {
        console.log(e);
      }
    },
    // showInput() {
    //   this.newDeviceData.inputVisible = true;
    //   this.$nextTick(_ => {
    //     this.$refs.saveTagInput.$refs.input.focus();
    //   });
    // },

    // handleInputConfirm() {
    //   let inputValue = this.newDeviceData.inputValue;
    //   if (inputValue) {
    //     this.newDeviceData.dynamicTags.push(inputValue);
    //   }
    //   this.newDeviceData.inputVisible = false;
    //   this.newDeviceData.inputValue = "";
    // },
    async getDeviceData() {
      this.loading = true;
      const orderMap = { ascending: "asc", descending: "desc" };
      const columnMap = {
        id: "Id",
        deviceId: "DeviceId",
        indexName: "IndexName",
        indexId: "IndexId",
        timestamp: "Timestamp"
      };
      const searchColumn =
        this.curSortColumn === "" ? "Id" : columnMap[this.curSortColumn];
      const searchOrder =
        this.curOrder === "" ? "asc" : orderMap[this.curOrder];
      const searchDeviceId =
        this.curSearchDevice === "全部" ? "all" : this.curSearchDevice;
      this.getTotalPage("search", searchDeviceId);
      const data = await getDevicesDataApi(
        "search",
        this.curPage,
        searchColumn,
        searchOrder,
        searchDeviceId
      );
      this.tableData = data.data.d;

      this.loading = false;
    },
    async pageChange() {
      this.getDeviceData();
    },
    async sortChange(ob) {
      this.curSortColumn = ob.prop;
      this.curOrder = ob.order;
      this.getDeviceData();
    },
    async getDeviceOptions() {
      this.deviceOptions = (await getDevicesApi("all")).data.d;
    },
    async getTotalPage(searchType, deviceId = "all") {
      if (searchType === "all") {
        this.totalPage = (await getDeviceDataNumber("all")).data.d;
      } else if (searchType === "search") {
        const d = deviceId === "全部" ? "all" : deviceId;
        this.totalPage = (await getDeviceDataNumber("search", d)).data.d;
      }
    },
    onUpdateClose() {
      this.getDeviceData();
    }
  },
  async mounted() {
    this.getTotalPage("all");
    this.getDeviceOptions();
    //获取所有设备信息
    this.getDeviceData();
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

/*标签处理*/
.el-tag + .el-tag {
  margin-left: 10px;
}

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
