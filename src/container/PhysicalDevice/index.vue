<template>
  <div>
    <h2 class="page-title">物理设备</h2>
    <div class="search-container">
      <el-form :inline="true" :model="searchDevice" class="header">
        <el-form-item v-if="checkDeviceAuth(['DEVICE_RETRIEVE'])">
          <el-cascader
            v-model="cascaderValue"
            :placeholder="'选择' + GLOBAL.firstLevel + '/' + GLOBAL.secondLevel + '/' + GLOBAL.thirdLevel "
            :options="cascaderOptions"
            @change="searchCascader"
          ></el-cascader>
        </el-form-item>
        <el-form-item class="export-excel-button" v-if="checkDeviceAuth(['DEVICE_EXPORT_EXCEL'])">
          <el-button type="primary" @click="exportExcel">导出Excel</el-button>
        </el-form-item>
        <el-form-item class="upload-excel-button" v-if="checkDeviceAuth(['DEVICE_IMPORT_EXCEL'])">
          <el-upload
            ref="upload"
            action="https://jsonplaceholder.typicode.com/posts/"
            :show-file-list="false"
            :on-success="readExcel"
            :on-error="uploadFailed"
          >
            <el-button slot="trigger" type="primary">导入excel</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
    </div>
    <div class="addbutton-container" v-if="checkDeviceAuth(['DEVICE_CREATE'])">
      <el-button type="primary" @click="newFormVisible = true">新增设备</el-button>
      <el-button
        type="primary"
        @click="multipleDelete"
        v-if="checkDeviceAuth(['DEVICE_DELETE'])"
      >批量删除</el-button>
    </div>
    <div class="table-container" v-if="checkDeviceAuth(['DEVICE_RETRIEVE'])">
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @sort-change="sortChange"
        id="physical-device-out-table"
      >
        <el-table-column type="selection" v-if="checkDeviceAuth(['DEVICE_DELETE'])"></el-table-column>
        <el-table-column prop="hardwareDeviceID" label="设备编号" width="120px" sortable="custom"></el-table-column>
        <el-table-column prop="deviceName" label="设备名称" width="120px" sortable="custom"></el-table-column>
        <el-table-column prop="deviceType" label="设备类型"></el-table-column>
        <el-table-column prop="city" :label="GLOBAL.firstLevel"></el-table-column>
        <el-table-column prop="factory" :label="GLOBAL.secondLevel"></el-table-column>
        <el-table-column prop="workshop" :label="GLOBAL.thirdLevel"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="120" sortable="custom"></el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="120" sortable="custom"></el-table-column>
        <el-table-column prop="gatewayId" label="所属网关"></el-table-column>
        <el-table-column prop="mac" label="Mac地址"></el-table-column>
        <el-table-column prop="remark" label="描述"></el-table-column>
        <el-table-column label="标签">
          <template slot-scope="scope">
            <div slot="reference" class="name-wrapper">
              <el-tag v-for="t in scope.row.tags" v-bind:key="t">{{ t }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          width="120"
          label="操作"
          v-if="checkDeviceAuth(['DEVICE_UPDATE', 'DEVICE_DELETE'])"
        >
          <template slot-scope="scope">
            <el-button
              @click="openUpdateForm(scope.row)"
              type="text"
              size="small"
              v-if="checkDeviceAuth(['DEVICE_UPDATE'])"
            >修改</el-button>
            <el-button
              @click="deleteDevice(scope.row)"
              type="text"
              size="small"
              v-if="checkDeviceAuth(['DEVICE_DELETE'])"
            >删除</el-button>
            <el-button @click="editTag(scope.row)" type="text" size="small">标签编辑</el-button>
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
    <EditTag
      :tagEditVisible.sync="tagEditVisible"
      @getDevices="getDevices"
      :curTagEdit="curTagEdit"
    ></EditTag>
    <AddNewDevice
      :newFormVisible.sync="newFormVisible"
      @getDevices="getDevices"
      :getDeviceOptions="getDeviceOptions"
    ></AddNewDevice>
    <UpdateDevice
      :updateFormVisible.sync="updateFormVisible"
      :defaultData="updateData"
      @getDevices="getDevices"
      :getDeviceOptions="getDeviceOptions"
    ></UpdateDevice>
  </div>
</template>

<script>
import {
  addTag,
  deleteDeviceApi,
  deleteMultipleDeviceApi,
  getAllTags,
  getCityCascaderOptions,
  getDeviceAffiliateAlarmInfo,
  getDeviceAffiliateData,
  getDeviceAffiliateThreshold,
  getDeviceByWorkshop,
  getDeviceNumber,
  getDevicesApi,
  getDeviceTag,
  searchDevicesByDeviceIdApi,
  searchDevicesByDeviceNameApi,
  setDeviceTags
} from "../../api/api";
import UploadImg from "../../components/UploadImg/index";
import FileSaver from "file-saver";
import XLSX from "xlsx";
import { checkAuth } from "../../common/util";
import AddNewDevice from "./AddNewDevice";
import UpdateDevice from "./UpdateDevice";
import EditTag from "./EditTag";
export default {
  name: "PhysicalDevice",
  components: { UploadImg, AddNewDevice, UpdateDevice, EditTag },
  data() {
    return {
      loading: false,
      totalPage: 0,
      curSortColumn: "",
      curOrder: "",
      curTagEdit: 0,
      newTagName: "",
      cascaderValue: [],
      cascaderOptions: [],
      updateFormVisible: false,
      newFormVisible: false,
      tagEditVisible: false,
      allTags: [],
      curTag: [],
      affiliateGateways: [],
      tableData: [
        {
          id: "",
          hardwareDeviceID: "",
          deviceName: "",
          city: "",
          factory: "",
          workshop: "",
          deviceState: "",
          lastConnectionTime: "",
          imageUrl: "",
          gatewayID: "",
          mac: "",
          deviceType: "",
          createTime: "",
          updateTime: "",
          remark: "",
          department: ""
        }
      ],
      updateData: {
        hardwareDeviceID: "",
        deviceName: "",
        city: "",
        factory: "",
        workshop: "",
        deviceState: "",
        imageUrl: "",
        gatewayId: "",
        mac: "",
        deviceType: "",
        remark: ""
        // department: '',
      },
      multipleSelection: [],
      searchDevice: {
        city: "all",
        factory: "all",
        workshop: "all"
      },
      searchData: {
        deviceID: "",
        deviceName: ""
      },
      deleteData: {
        number: []
      },
      curPage: 1
    };
  },

  methods: {
    checkDeviceAuth(auth) {
      return checkAuth(auth);
    },
    uploadFailed() {
      this.$message.error("导入失败");
    },
    readExcel(res, file) {
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
            设备编号: "hardwareDeviceID",
            设备名称: "deviceName",
            设备类型: "deviceType",
            城市: "city",
            实验楼: "factory",
            实验室: "workshop",
            设备图像链接: "imageUrl",
            所属网关: "gatewayId",
            Mac地址: "mac",
            设备状态: "deviceState",
            上次连接时间: "lastConnectionTime",
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
          // 导入接口，将数据导入后端
          console.log(newData);
          const t = newData.forEach(async ob => {
            console.log(ob);
            const data = (await addDeviceApi(ob)).data.d;
            if (data === "success") {
              this.getDevices();
            }
          });
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
          document.querySelector("#physical-device-out-table").removeChild(fix)
        );
        console.log("test");
        document.querySelector("#physical-device-out-table").appendChild(fix);
      } else {
        wb = XLSX.utils.table_to_book(
          document.querySelector("#physical-device-out-table")
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
          "物理设备.xlsx"
        );
      } catch (e) {
        if (typeof console !== "undefined") console.log(e, wbout);
      }
      return wbout;
    },
    addImage(file) {
      this.newDeviceData.img = file;
    },
    async searchDeviceByName() {
      console.log(this.searchDeviceName);
      const data = await searchDevicesByDeviceNameApi(
        this.searchDeviceName.deviceName
      );
      this.tableData = data.data.d;
    },
    async searchDeviceById() {
      const data = await searchDevicesByDeviceIdApi(
        this.searchDeviceId.deviceId
      );
      this.tableData = data.data.d;
    },
    async editTag(row) {
      this.curTagEdit = row.id;
      this.tagEditVisible = true;
    },
    async openUpdateForm(row) {
      //打开更新表单
      this.updateData = row;
      this.updateFormVisible = true;
    },
    async deleteDevice(row) {
      const affiliateData = (await getDeviceAffiliateData(row.hardwareDeviceID))
        .data.d;
      const affiliateAlarmInfo = (await getDeviceAffiliateAlarmInfo(
        row.hardwareDeviceID
      )).data.d;
      const affiliateThreshold = (await getDeviceAffiliateThreshold(
        row.hardwareDeviceID
      )).data.d;
      if (
        affiliateData === 0 &&
        affiliateAlarmInfo === 0 &&
        affiliateThreshold === 0
      ) {
        try {
          this.$confirm("确认删除？")
            .then(async _ => {
              console.log(row);
              console.log(row.id);
              const data = await deleteDeviceApi(row.id);
              if (data.data.c === 200) {
                this.$message({
                  message: "删除成功",
                  type: "success"
                });
                //再获取一次所有网关信息
                this.getDevices();
              }
            })
            .catch(_ => {});
        } catch (e) {
          console.log(e);
        }
      } else {
        this.$msgbox(
          "该设备有" +
            affiliateData +
            "条数据, " +
            affiliateAlarmInfo +
            "条告警记录, " +
            affiliateThreshold +
            "个相关规则, 无法被删除"
        );
      }
    },
    async getDevices() {
      this.loading = true;
      const orderMap = { ascending: "asc", descending: "desc" };
      const searchColumn =
        this.curSortColumn === "" ? "id" : this.curSortColumn;
      const searchOrder =
        this.curOrder === "" ? "asc" : orderMap[this.curOrder];
      const searchCity =
        this.searchDevice.city === "全部" ? "all" : this.searchDevice.city;
      const searchFactory =
        this.searchDevice.factory === "全部"
          ? "all"
          : this.searchDevice.factory;
      const searchWorkshop =
        this.searchDevice.workshop === "全部"
          ? "all"
          : this.searchDevice.workshop;
      const data = await getDevicesApi(
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
            const data = await deleteMultipleDeviceApi(this.deleteData);
            if (data.data.c === 200) {
              this.$message({
                message: "删除成功",
                type: "success"
              });
              //再获取一次所有网关信息
              this.getDevices();
            }
          })
          .catch(_ => {});
      } catch (e) {
        console.log(e);
      }
    },
    // 标签处理函数
    handleClose(tag) {
      this.newDeviceData.dynamicTags.splice(
        this.newDeviceData.dynamicTags.indexOf(tag),
        1
      );
    },

    showInput() {
      this.newDeviceData.inputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },

    handleInputConfirm() {
      let inputValue = this.newDeviceData.inputValue;
      if (inputValue) {
        this.newDeviceData.dynamicTags.push(inputValue);
      }
      this.newDeviceData.inputVisible = false;
      this.newDeviceData.inputValue = "";
    },
    async filter(city, factory, workshop) {
      if (city !== "全部") {
        const data = await getDeviceByWorkshop(city, factory, workshop);
        this.tableData = data.data.d;
      } else {
        this.getDevices();
      }
      //调接口，传searchDevice参数
    },
    async pageChange() {
      this.getDevices();
    },
    async sortChange(ob) {
      this.curSortColumn = ob.prop;
      this.curOrder = ob.order;
      this.getDevices();
    },
    async searchCascader() {
      this.curPage = 1;
      this.searchDevice.city = this.cascaderValue[0];
      this.searchDevice.factory = this.cascaderValue[1];
      this.searchDevice.workshop = this.cascaderValue[2];
      this.getDevices();
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
        this.totalPage = (await getDeviceNumber("all")).data.d;
      } else if (searchType === "search") {
        const c = city === "全部" ? "all" : city;
        const f = factory === "全部" ? "all" : factory;
        const w = workshop === "全部" ? "all" : workshop;
        this.totalPage = (await getDeviceNumber("search", c, f, w)).data.d;
      }
    }
  },
  async mounted() {
    this.getTotalPage("all");
    this.getDeviceOptions();
    //获取所有设备信息
    this.getDevices();
    this.allTags = (await getAllTags()).data.d;
  }
};
</script>

<style scoped>
@import "../../assets/scss/variaties.scss";
.addbutton-container,
.table-container {
  margin: 1% 1%;
  text-align: left;
}

.el-form {
  margin: 10px 0 -10px 10px;
}
.export-excel-button,
.upload-excel-button {
  float: right;
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
