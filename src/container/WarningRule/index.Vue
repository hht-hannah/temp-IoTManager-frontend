<template>
     <div>
    <h2 style="margin-left: 10px">告警规则</h2>
    <div class="search-container">
      <el-form :inline="true" :model="searchData" class="demo-form-inline">
        <el-form-item label="选择设备" v-if="checkRuleAuth(['ALARMRULE_RETRIEVE'])">
          <el-select v-model="curSearchDevice" filterable placeholder="请选择" @change="getRules">
            <el-option value="全部" label="全部"></el-option>
            <el-option
              v-for="c in dropdownDevices"
              :key="c.id"
              :label="c.deviceName"
              :value="c.hardwareDeviceID">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
     <div class="addbutton-container">
      <el-button type="primary" @click="multipleDelete" v-if="checkRuleAuth(['ALARMRULE_DELETE'])">批量删除</el-button>
    </div>
    <div class="table-container" v-if="checkRuleAuth(['ALARMRULE_RETRIEVE'])">
      <el-table
        :data="rulesData"
        @selection-change="handleSelectionChange"
        @sort-change="sortChange"
        border>
        <el-table-column
          type="selection"
          width="55" v-if="checkRuleAuth(['ALARMRULE_DELETE'])"/>
        <el-table-column
          prop="name"
          label="规则名称" sortable="custom">
        </el-table-column>
        <el-table-column
          prop="description"
          label="规则描述">
        </el-table-column>
        <el-table-column
          prop="deviceGroup"
          label="设备">
        </el-table-column>
        <el-table-column
          prop="conditionString"
          label="规则">
        </el-table-column>
        <el-table-column
          prop="severity"
          label="告警等级" sortable="custom">
        </el-table-column>
        <el-table-column
        fixed="right"
        label="操作"
        width="100" v-if="checkRuleAuth(['ALARMRULE_UPDATE', 'ALARMRULE_DELETE'])">
        <template slot-scope="scope">
        <el-button @click="openUpdateForm(scope.row)" type="text" size="small" v-if="checkRuleAuth(['ALARMRULE_UPDATE'])">修改</el-button>
        <el-button @click="deleteRule(scope.row)" type="text" size="small" v-if="checkRuleAuth(['ALARMRULE_DELETE'])">删除</el-button>
        </template>
        </el-table-column>
      </el-table>
       <el-pagination background layout="prev, pager, next"
                     :total="totalPage"
                     :current-page.sync="curPage"
                     :page-size="12"
                     @current-change="pageChange()">
      </el-pagination>
    </div>

      <el-dialog title="修改规则" :visible.sync="updateFormVisible">
        <el-form :model="updateData">
          <el-form-item label="规则名称" label-width="120px">
            <el-input v-model="updateData.name" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="规则描述" label-width="120px">
            <el-input v-model="updateData.description" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="设备" label-width="120px">
            <el-select v-model="updateData.deviceGroup" disabled placeholder="选择设备">
              <el-option
                v-for="d in deviceOptions"
                :key="d.id"
                :label="d.deviceName"
                :value="d.hardwareDeviceID">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="设备属性" label-width="120px">
            <el-select v-model="updateData.field" placeholder="选择设备属性">
              <el-option
                v-for="f in affiliateFieldOptions"
                :key="f.id"
                :label="f.fieldName"
                :value="f.fieldId">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="运算" label-width="120px">
            <el-select v-model="updateData.operator" placeholder="请选择运算">
              <el-option label="=" value="equal"></el-option>
              <el-option label=">" value="greater"></el-option>
              <el-option label="<" value="less"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="报警阈值" label-width="120px">
            <el-input v-model="updateData.value" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="告警等级" label-width="120px">
            <el-select v-model="updateData.severity" placeholder="选择告警等级">
              <el-option
                v-for="s in severityOptions"
                :key="s.id"
                :label="s.severityName"
                :value="s.severityName">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="updateFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="update">确 定</el-button>
        </div>
      </el-dialog>
  </div>
</template>


<script>
  import {
    batchDeleteThresholds,
    deleteRule, getAffiliateFields,
    getAlarmInfoByDeviceid,
    getAlarmInformationApi, getAllRules, getDevicesApi, getRuleNumber, getSeverity,
    handleAllAlarmInformationApi,
    searchAlarmInformationApi,
    updateAlarmInformationApi, updateThreshold,
    //deleteMultipleWarningRuleApi
  } from '../../api/api';
  import {checkAuth} from "../../common/util";

  export default {
    name: "WarningRule",
    data() {
      return {
        totalPage: 0,
        curPage: 1,
        curSortColumn: '',
        curOrder: '',
        curSearchDevice: '全部',
        updateFormVisible: false,
        newFormVisible: false,
        deviceOptions: [],
        severityOptions: [],
        affiliateFieldOptions: [],
        rulesData:[],
        multipleSelection: [],
        dropdownDevices: [],
        updateData: {
          id: 0,
          name:'',
          description:'',
          deviceGroup: '',
          severity: '',
          field: '',
          operator: '',
          value: ''
        },
        handleData: {},
        searchData: {
          deviceID: '',
          deviceName: ''
        },
        deleteData: {
          number: []
        }
      }
    },

    methods: {
      checkRuleAuth(auth) {
        return checkAuth(auth);
      },
      async searchDeviceByName() {
        const data = await searchAlarmInformationApi(this.searchData);
        this.tableData = data.data.d;
      },
      
      async handleAll() {
        try {
          const data = await handleAllAlarmInformationApi(this.handleData,this.multipleSelection.map(el=>el.id));
          this.newFormVisible = false;
          if (data.data.c === 200) {
            this.$message({
              message: '已选警报处理成功',
              type: 'success'
            });
            this.getAlarmInformation();
          }
        } catch (e) {
          this.newFormVisible = false;
          this.$message.error('警报处理未成功');
        }
      },
      
      async update() {
        try {
          const data = await updateThreshold(this.updateData.id, this.updateData);
          this.updateFormVisible = false;
          if (data.data.c === 200) {
            this.$message({
              message: '更新成功',
              type: 'success'
            });
            this.getRules();
          }
        } catch (e) {
          this.updateFormVisible = false;
          this.$message.error('更新规则未成功');
        }
      },
      async openUpdateForm(row) {//打开更新表单
        this.affiliateFieldOptions = (await getAffiliateFields(row.deviceGroup)).data.d;
        this.updateData = row;
        console.log(this.updateData);
        this.updateFormVisible = true
      },
      handleSelectionChange(val) {
        console.log('change',this.multipleSelection);
        this.multipleSelection = val;
      },
      async deleteRule(row) {console.log(row);
        try {
          this.$confirm('确认删除？')
            .then(async _ => {
              const data = await deleteRule(row.id);
              if (data.data.c === 200) {
                this.$message({
                  message: '删除成功',
                  type: 'success'
                });
                this.getRules();
              }
            })
            .catch(_ => {
            });
        } catch (e) {
          console.log(e)
        }
      },
      async getRules() {
        const orderMap = {ascending: 'asc', descending: 'desc'};
        const searchColumn = this.curSortColumn === '' ? 'id' : this.curSortColumn;
        const searchOrder = this.curOrder === '' ? 'asc' : orderMap[this.curOrder];
        const searchDevice = this.curSearchDevice === '全部' ? 'all' : this.curSearchDevice;
        const data = await getAllRules('search', searchDevice, this.curPage, searchOrder, searchColumn);
        this.rulesData = data.data.d;
        this.getTotalPage('search', searchDevice);
      },
      async getTotalPage(searchType, deviceName='all') {
        if (searchType === 'all') {
          this.totalPage = (await getRuleNumber('all')).data.d;
        } else if(searchType === 'search') {
          const d = deviceName === '全部' ? 'all' : deviceName;
          this.totalPage = (await getRuleNumber('search', d)).data.d;
        }
      },
      async pageChange() {
        this.getRules();
      },
      async sortChange(ob) {
        const columnMap = {'name': 'ruleName', 'severity': 'severity'}
        this.curSortColumn = columnMap[ob.prop];
        this.curOrder = ob.order;
        this.getRules();
      },
      async multipleDelete() {
        try {
          this.$confirm('确认删除？')
            .then(async _ => {
              this.deleteData.number = this.multipleSelection.map(el => el.id);
              const data = await batchDeleteThresholds(this.deleteData);
              if (data.data.c === 200) {
                this.$message({
                  message: '删除成功',
                  type: 'success'
                });
                //再获取一次所有网关信息
                this.getRules();
              }
            })
            .catch(_ => {
            });
        } catch (e) {
          console.log(e)
        }
      },
    },
    async mounted() {
      //获取所有信息
      this.severityOptions = (await getSeverity()).data.d;
      this.getTotalPage('all');
      this.getRules();
      this.dropdownDevices = (await getDevicesApi('all')).data.d;
      this.deviceOptions = (await getDevicesApi('all')).data.d;
      // 此处需要获取所有告警规则信息的接口，返回态如rulesData。
    }
  }
</script>

<style scoped>
@import "../../assets/scss/variaties.scss";
  .addbutton-container ,.table-container{
    margin: 1% 1%;
    text-align: left;
  }
</style>
