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
      <AddNewGateway
        :newFormVisible.sync="newFormVisible"
        :city="city"
        :gatewayType="gatewayType"
        @getGateways="getGateways"
      ></AddNewGateway>
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
    <el-dialog title="修改网关" :visible.sync="updateFormVisible">
      <el-form :model="updateData" ref="updateData">
        <el-form-item label="网关编号" label-width="120px">
          <el-input v-model="updateData.hardwareGatewayID" autocomplete="off" disabled></el-input>
        </el-form-item>
        <el-form-item
          label="网关名称"
          prop="gatewayName"
          label-width="120px"
          :rules="[{required: true, message: '网关名称不能为空'}]"
        >
          <el-input v-model="updateData.gatewayName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="网关类型"
          prop="gatewayType"
          label-width="120px"
          :rules="[{required: true, message: '网关类型不能为空'}]"
        >
          <el-select v-model="updateData.gatewayType" placeholder="选择网关类型">
            <el-option
              v-for="gt in gatewayType"
              :key="gt.id"
              :label="gt.gatewayTypeName"
              :value="gt.gatewayTypeName"
            ></el-option>
          </el-select>
          <el-button type="primary" @click="typeAddVisible = true">+</el-button>
        </el-form-item>
        <el-form-item
          :label="GLOBAL.firstLevel"
          prop="city"
          label-width="120px"
          :rules="[{required: true, message: GLOBAL.firstLevel+'不能为空'}]"
        >
          <el-select
            v-model="updateData.city"
            @change="getUpdateFactory(updateData.city)"
            placeholder="选择城市"
          >
            <el-option v-for="c in updateCity" :key="c.value" :label="c.label" :value="c.label"></el-option>
          </el-select>
          <el-button type="primary" @click="cityAddVisible = true">+</el-button>
        </el-form-item>
        <el-form-item
          :label="GLOBAL.secondLevel+'名称'"
          prop="factory"
          label-width="120px"
          :rules="[{required: true, message: GLOBAL.secondLevel+'不能为空'}]"
        >
          <el-select
            v-model="updateData.factory"
            @change="getUpdateWorkshop(updateData.factory)"
            placeholder="选择工厂"
          >
            <el-option v-for="f in updateFactory" :key="f.value" :label="f.label" :value="f.label"></el-option>
          </el-select>
          <el-button type="primary" @click="factoryAddVisible = true">+</el-button>
        </el-form-item>
        <el-form-item
          :label="GLOBAL.thirdLevel"
          prop="workshop"
          label-width="120px"
          :rules="[{required: true, message: GLOBAL.thirdLevel+'不能为空'}]"
        >
          <el-select v-model="updateData.workshop" placeholder="选择车间">
            <el-option v-for="w in updateWorkshop" :key="w.value" :label="w.label" :value="w.label"></el-option>
          </el-select>
          <el-button type="primary" @click="workshopAddVisible = true">+</el-button>
        </el-form-item>
        <!--<el-form-item label="网关状态" label-width="120px">-->
        <!--<el-select v-model="updateData.gatewayState" placeholder="选择网关类型">-->
        <!--<el-option-->
        <!--v-for="gs in gatewayState"-->
        <!--:key="gs.id"-->
        <!--:label="gs.stateName"-->
        <!--:value="gs.stateName">-->
        <!--</el-option>-->
        <!--</el-select>-->
        <!--</el-form-item>-->
        <!--<el-form-item label="网关图像链接" label-width="120px">
          <el-input v-model="updateData.imageUrl" autocomplete="off"></el-input>
        </el-form-item>-->
        <el-form-item label="描述" label-width="120px">
          <el-input v-model="updateData.remark" autocomplete="off"></el-input>
        </el-form-item>
        <!--<el-form-item label="部门" label-width="120px">-->
        <!--<el-select v-model="updateData.department" placeholder="选择网关类型">-->
        <!--<el-option-->
        <!--v-for="d in department"-->
        <!--:key="d.id"-->
        <!--:label="d.departmentName"-->
        <!--:value="d.departmentName">-->
        <!--</el-option>-->
        <!--</el-select>-->
        <!--</el-form-item>-->
        <!--<el-form-item>
          <UploadImg></UploadImg>
        </el-form-item>-->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="updateFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="update('updateData')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  addCity,
  addFactory,
  addGatewayApi,
  addWorkshop,
  createGatewayType,
  deleteGatewayApi,
  deleteMultipleGatewayApi,
  getAffiliateDeviceNumber,
  getAllDepartments,
  getCity,
  getCityCascaderOptions,
  getCityOptions,
  getFactory,
  getFactoryOptions,
  getGatewayByWorkshop,
  getGatewayIdExist,
  getGatewayNumber,
  getGatewaysApi,
  getGatewayState,
  getGatewayType,
  getWorkshop,
  getWorkshopOptions,
  searchGatewaysApi,
  updateGatewayApi,
  listWorkshopName
} from "../../api/api";
import AddNewGateway from "./AddNewGateway";
import AddCity from "./AddCity"
import FileSaver from "file-saver";
import XLSX from "xlsx";
import { checkAuth } from "../../common/util";
export default {
  name: "GatewayEquipment",
  components: { AddNewGateway, AddCity },
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
      newCityList: [],
      newFactoryList: [],
      city: [],
      factory: [],
      workshop: [],
      updateCity: [],
      updateFactory: [],
      updateWorkshop: [],
      department: [],
      gatewayState: [],
      gatewayType: [],
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
      cityOptions: [],
      factoryOptions: [],
      workshopOptions: [],
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
    async getUpdateFactory(city) {
      this.updateFactory = (await getFactoryOptions(city)).data.d;
      if (this.updateFactory[0] != null) {
        this.updateData.factory = this.updateFactory[0].value;
        this.getUpdateWorkshop(city, this.updateData.factory);
      } else {
        this.updateData.factory = "";
        this.updateData.workshop = "";
        this.updateFactory = [];
      }
    },
    async getUpdateWorkshop(city, factory) {
      this.updateWorkshop = (await getWorkshopOptions(city, factory)).data.d;
      if (this.updateWorkshop[0] != null) {
        this.updateData.workshop = this.updateWorkshop[0].value;
      } else {
        this.updateData.workshop = "";
      }
    },
    async update(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          try {
            const data = await updateGatewayApi(this.updateData);
            this.updateFormVisible = false;
            if (data.data.c === 200) {
              this.$message({
                message: "更新成功",
                type: "success"
              });
              this.getGateways();
            }
          } catch (e) {
            this.updateFormVisible = false;
            this.$message.error("更新网关未成功");
          }
        } else {
          console.log("error input");
          return false;
        }
      });
    },
    async openUpdateForm(row) {
      //打开更新表单
      console.log("test", row);
      this.updateData = JSON.parse(JSON.stringify(row));
      this.updateFactory = (await getFactoryOptions(row.city)).data.d;
      this.updateWorkshop = (await getWorkshopOptions(
        row.city,
        row.factory
      )).data.d;
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
    async getFactoryList(city) {
      if (city !== "全部") {
        this.factoryOptions = (await getFactoryOptions(city)).data.d;
        if (this.factoryOptions[0] != null) {
          this.searchGateway.factory = this.factoryOptions[0].value;
          this.getWorkshopList(city, this.searchGateway.factory);
        } else {
          this.searchGateway.factory = "";
          this.searchGateway.workshop = "";
          this.workshopOptions = [];
        }
      } else {
        this.factoryOptions = [];
        this.workshopOptions = [];
        this.searchGateway.factory = "全部";
        this.searchGateway.workshop = "全部";
      }
      // 调获取工厂接口，searchGateway.city参数
    },
    async getWorkshopList(city, factory) {
      this.workshopOptions = (await getWorkshopOptions(city, factory)).data.d;
      if (this.workshopOptions[0] != null) {
        this.searchGateway.workshop = this.workshopOptions[0].value;
      } else {
        this.searchGateway.workshop = "";
      }
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
    this.cityOptions = (await getCityOptions()).data.d;
    this.city = (await getCityOptions()).data.d;
    this.updateCity = (await getCityOptions()).data.d;
    this.newCityList = (await getCity(1, "id", "asc", 0)).data.d;
    this.newFactoryList = (await getFactory(1, "id", "asc", 0)).data.d;
    this.gatewayState = (await getGatewayState()).data.d;
    this.gatewayType = (await getGatewayType()).data.d;
    this.department = (await getAllDepartments()).data.d;
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
