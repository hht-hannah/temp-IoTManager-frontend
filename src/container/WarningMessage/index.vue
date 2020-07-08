<template>
  <div>
    <h2 style="margin-left: 10px">告警信息</h2>
    <div class="search-container">
      <el-form :inline="true" :model="searchData" class="demo-form-inline">
        <el-form-item label="选择设备" v-if="checkInfoAuth(['ALARMINFO_RETRIEVE'])">
          <el-select
            v-model="curSearchDevice"
            filterable
            @change="getAlarmInformation"
            placeholder="请选择"
          >
            <el-option value="全部" label="全部"></el-option>
            <el-option
              v-for="c in dropdownDevices"
              :key="c.id"
              :label="c.deviceName"
              :value="c.hardwareDeviceID"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <!--<div class="addbutton-container">-->
    <!--<el-button type="primary" @click="newFormVisible = true">快速处理</el-button>-->
    <!--</div>-->
    <div class="deleteButton-container">
      <el-button
        type="primary"
        @click="multipleDelete"
        v-if="checkInfoAuth(['ALARMINFO_DELETE'])"
      >批量删除</el-button>
    </div>
    <div class="table-container" v-if="checkInfoAuth(['ALARMINFO_RETRIEVE'])">
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @sort-change="sortChange"
      >
        <el-table-column type="selection" width="55" v-if="checkInfoAuth(['ALARMINFO_DELETE'])">></el-table-column>
        <el-table-column fixed prop="deviceId" label="设备ID" sortable="custom"></el-table-column>
        <el-table-column prop="indexId" label="数据ID" sortable="custom"></el-table-column>
        <el-table-column prop="alarmInfo" label="告警内容" sortable="custom"></el-table-column>
        <el-table-column prop="severity" label="告警等级" sortable="custom"></el-table-column>
        <el-table-column prop="timestamp" label="告警时间" sortable="custom"></el-table-column>
        <el-table-column prop="processed" label="是否处理"></el-table-column>
        <!--<el-table-column-->
        <!--prop="handleMethod"-->
        <!--label="处理方式">-->
        <!--</el-table-column>-->
        <!--<el-table-column-->
        <!--prop="handleContent"-->
        <!--label="处理内容">-->
        <!--</el-table-column>-->
        <el-table-column
          fixed="right"
          label="操作"
          v-if="checkInfoAuth(['ALARMINFO_UPDATE', 'ALARMINFO_DELETE'])"
        >
          <template slot-scope="scope">
            <el-button
              @click="openUpdateForm(scope.row)"
              type="text"
              size="small"
              v-if="checkInfoAuth(['ALARMINFO_UPDATE'])"
            >处理</el-button>
            <el-button
              @click="deleteDevice(scope.row)"
              type="text"
              size="small"
              v-if="checkInfoAuth(['ALARMINFO_DELETE'])"
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

    <el-dialog title="告警处理" :visible.sync="updateFormVisible">
      <el-form :model="updateData">
        <el-form-item label="处理方式" label-width="120px">
          <el-select v-model="updateData.handleMethod" placeholder="请选择">
            <el-option label="电子邮件通知" value="email"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="处理内容" label-width="120px">
          <el-input v-model="updateData.handleContent" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="updateFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="handle">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="快速处理" :visible.sync="newFormVisible">
      <el-form :model="handleData">
        <el-form-item label="处理状态" label-width="120px">
          <el-select v-model="handleData.handleState" placeholder="请选择">
            <el-option label="未处理" value="unhandled"></el-option>
            <el-option label="处理中" value="handling"></el-option>
            <el-option label="已处理" value="handled"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="处理方式" label-width="120px">
          <el-select v-model="handleData.handleMethod" placeholder="请选择">
            <el-option label="电子邮件通知" value="email"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="处理内容" label-width="120px">
          <el-input v-model="handleData.handleContent" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="newFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleAll">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  batchDeleteAlarmInfo,
  batchDeleteThresholds,
  deleteAlarmInfo,
  getAlarmInfoByDeviceid,
  getAlarmInfoNumber,
  getAlarmInformationApi,
  getAllRules,
  getDevicesApi,
  handleAllAlarmInformationApi,
  searchAlarmInformationApi,
  updateAlarmInfoProcessed,
  updateAlarmInformationApi
} from "../../api/api";
import { checkAuth } from "../../common/util";

export default {
  name: "WarningMessage",
  data() {
    return {
      totalPage: 0,
      curPage: 1,
      curSortColumn: "",
      curOrder: "",
      curSearchDevice: "全部",
      deviceOptions: [],
      updateFormVisible: false,
      newFormVisible: false,
      rulesData: [
        {
          name: "规则1",
          description: "规则描述",
          deviceGroup: "",
          condition: [
            {
              //保留，以免增加需求
              field: "",
              operator: "",
              value: ""
            }
          ],
          conditionString: "", //这里把condition整合成字符串
          severityLevel: "",
          ruleStatus: "",
          affectNumber: 0
        }
      ],
      tableData: [
        {
          id: "1",
          deviceName: "设备1",
          dataName: "警报！",
          alarmType: "类型1",
          handleState: "未处理",
          alarmTime: "2018-9-9",
          alarmContent: "警报警报哈哈哈哈",
          handleTime: "",
          handleMethod: "",
          handleContent: "",
          timestamp: "oaisdjboiadjfb"
        }
      ],
      multipleSelection: [],
      dropdownDevices: [],
      updateData: {},
      handleData: {
        id: "",
        handleMethod: "",
        handleContent: ""
      },
      searchData: {
        deviceID: "",
        deviceName: ""
      },
      deleteData: {
        number: []
      }
    };
  },

  methods: {
    checkInfoAuth(auth) {
      return checkAuth(auth);
    },
    async searchDeviceByName() {
      const data = await searchAlarmInformationApi(this.searchData);
      this.tableData = data.data.d;
    },
    async handleAll() {
      try {
        const data = await handleAllAlarmInformationApi(
          this.handleData,
          this.multipleSelection.map(el => el.id)
        );
        this.newFormVisible = false;
        if (data.data.c === 200) {
          this.$message({
            message: "已选警报处理成功",
            type: "success"
          });
          this.getAlarmInformation();
        }
      } catch (e) {
        this.newFormVisible = false;
        this.$message.error("警报处理未成功");
      }
    },
    async handle() {
      try {
        const data = await updateAlarmInfoProcessed(this.updateData.id);
        this.updateFormVisible = false;
        if (data.data.c === 200) {
          this.$message({
            message: "警报处理成功",
            type: "success"
          });
          this.getAlarmInformation();
        }
      } catch (e) {
        this.updateFormVisible = false;
        this.$message.error("警报处理未成功");
      }
    },
    async openUpdateForm(row) {
      //打开更新表单
      this.updateData = row;
      this.updateFormVisible = true;
    },
    async getAlarmInformationByDeviceId(deviceId) {
      const data = await getAlarmInfoByDeviceid(deviceId);
      this.tableData = data.data.d;
    },
    async getAlarmInformation() {
      const orderMap = { ascending: "asc", descending: "desc" };
      const columnMap = {
        deviceId: "DeviceId",
        indexId: "IndexId",
        alarmInfo: "AlarmInfo",
        severity: "Severity",
        timestamp: "Timestamp"
      };
      const searchColumn =
        this.curSortColumn === "" ? "Id" : columnMap[this.curSortColumn];
      const searchOrder =
        this.curOrder === "" ? "desc" : orderMap[this.curOrder];
      const searchDeviceId =
        this.curSearchDevice === "全部" ? "all" : this.curSearchDevice;
      const data = await getAlarmInformationApi(
        "search",
        searchDeviceId,
        this.curPage,
        searchColumn,
        searchOrder
      );
      this.tableData = data.data.d;
      this.getTotalPage("search", searchDeviceId);
    },
    async deleteDevice(row) {
      try {
        this.$confirm("确认删除？")
          .then(async _ => {
            const data = await deleteAlarmInfo(row.id);
            if (data.data.c === 200) {
              this.$message({
                message: "删除成功",
                type: "success"
              });
              //再获取一次所有网关信息
              this.getAlarmInformation();
            }
          })
          .catch(_ => {});
      } catch (e) {
        console.log(e);
      }
    },
    handleSelectionChange(val) {
      console.log("change", this.multipleSelection);
      this.multipleSelection = val;
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        if (rowIndex % 2 === 0) {
          return {
            rowspan: 2,
            colspan: 1
          };
        } else {
          return {
            rowspan: 0,
            colspan: 0
          };
        }
      }
    },
    async pageChange() {
      this.getAlarmInformation();
    },
    async sortChange(ob) {
      this.curSortColumn = ob.prop;
      this.curOrder = ob.order;
      this.getAlarmInformation();
    },
    async getTotalPage(searchType, deviceId = "all") {
      if (searchType === "all") {
        this.totalPage = (await getAlarmInfoNumber("all")).data.d;
      } else if (searchType === "search") {
        const d = deviceId === "全部" ? "all" : deviceId;
        this.totalPage = (await getAlarmInfoNumber("search", d)).data.d;
      }
    },
    async multipleDelete() {
      try {
        this.$confirm("确认删除？")
          .then(async _ => {
            this.deleteData.number = this.multipleSelection.map(el => el.id);
            const data = await batchDeleteAlarmInfo({
              str: this.deleteData.number
            });
            if (data.data.c === 200) {
              this.$message({
                message: "删除成功",
                type: "success"
              });
              //再获取一次所有网关信息
              this.getAlarmInformation();
            }
          })
          .catch(_ => {});
      } catch (e) {
        console.log(e);
      }
    }
  },
  async mounted() {
    //获取所有设备信息
    this.getTotalPage("search");
    this.getAlarmInformation();
    this.rulesData = (await getAllRules()).data.d;
    this.dropdownDevices = (await getDevicesApi()).data.d;
    console.log(this.dropdownDevices);
    // 此处需要获取所有告警规则信息的接口，返回态如rulesData。
  }
};
</script>

<style scoped>
@import "../../assets/scss/variaties.scss";
.deleteButton-container,
.table-container {
  margin: 1% 1%;
  text-align: left;
}
</style>
