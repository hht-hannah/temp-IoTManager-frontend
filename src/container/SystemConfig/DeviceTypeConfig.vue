<template>
  <div>
    <div class="search-container">
      <el-form :inline="true" class="header">
        <el-form-item>
          <h2>设备类型</h2>
        </el-form-item>
        <el-form-item v-if="checkTypeAuth(['CONFIGURE_SYSTEM_RETRIEVE'])">
          <el-input v-model="searchDeviceType" placeholder="请输入设备类型"></el-input>
        </el-form-item>
        <el-form-item v-if="checkTypeAuth(['CONFIGURE_SYSTEM_RETRIEVE'])">
          <el-button type="primary" @click="searchByDeviceType">搜索</el-button>
        </el-form-item>
        <el-form-item v-if="checkTypeAuth(['CONFIGURE_SYSTEM_CREATE'])">
          <el-button type="primary" @click="newFormVisible = true">添加</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table-container" v-if="checkTypeAuth(['CONFIGURE_SYSTEM_RETRIEVE'])">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 60%"
        @selection-change="handleSelectionChange"
        @sort-change="sortChange">
        <el-table-column
          prop="deviceTypeName"
          label="设备类型">
        </el-table-column>
        <el-table-column
          prop="offlineTime"
          label="超时告警时间"
          sortable="custom">
        </el-table-column>
        <el-table-column
          fixed="right"
          label="操作" v-if="checkTypeAuth(['CONFIGURE_SYSTEM_DELETE', 'CONFIGURE_SYSTEM_UPDATE'])">
          <template slot-scope="scope">
            <el-button @click="openUpdateForm(scope.row)" type="text" size="small"
                       v-if="checkTypeAuth(['CONFIGURE_SYSTEM_UPDATE'])">修改
            </el-button>
            <el-button @click="deleteDeviceType(scope.row)" type="text" size="small"
                       v-if="checkTypeAuth(['CONFIGURE_SYSTEM_DELETE'])">删除
            </el-button>
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

    <el-dialog title="修改设备类型" :visible.sync="updateFormVisible">
      <el-form :model="updateData" ref="updateData">
        <el-form-item label="设备类型名称" prop="deviceTypeName" label-width="120px"
                      :rules="[{required: true, message: '设备类型不能为空'}]">
          <el-input v-model="updateData.deviceTypeName"></el-input>
        </el-form-item>
        <el-form-item label="超时告警时间" label-width="120px">
          <el-input v-model="updateData.offlineTime" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="updateFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="update('updateData')">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="添加设备类型" :visible.sync="newFormVisible">
      <el-form :model="newData" ref="newData">
        <el-form-item label="设备类型名称" prop="deviceTypeName" label-width="120px"
                      :rules="[{required: true, message: '设备类型不能为空'}]">
          <el-input v-model="newData.deviceTypeName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="超时告警时间" label-width="120px">
          <el-input v-model="newData.offlineTime" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="newFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="add('newData')">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  import {
    getDevicePageNumber,
    addDeviceType,
    deleteDeviceType,
    getDetailedDeviceType,
    getDeviceType, getDeviceTypeAffiliateDevice, updateDeviceType,
  } from '../../api/api'
  import {checkAuth} from "../../common/util";

  export default {
    name: "DeviceTypeConfig",
    data() {
      return {
        pageMode: 1,
        loading: false,
        totalPage: 0,
        curPage: 1,
        curSortColumn: '',
        curOrder: '',
        deviceType: [],
        tableData: [{
          "deviceType": "测试1",
          "warningTime": "30min",
        }],
        newFormVisible: false,
        updateFormVisible: false,
        searchDeviceType: '',
        multipleSelection: [],
        updateData: {
          id: 0,
          deviceTypeName: '',
          offlineTime: '',
        },
        newData: {
          id: 0,
          deviceTypeName: '',
          offlineTime: '',
        },
        deleteData: {
          number: []
        },
      }
    },

    methods: {
      checkTypeAuth(auth) {
        return checkAuth(auth);
      },
      handleSelectionChange(val) {
        console.log('change', this.multipleSelection);
        this.multipleSelection = val;
      },

      async getTableData() {
        this.loading = true;
        const orderMap = {ascending: 'asc', descending: 'desc'};
        const columnMap = {id: 'id', offlineTime: 'offlineTime'};
        const searchColumn = this.curSortColumn === '' ? "id" : columnMap[this.curSortColumn];
        const searchOrder = this.curOrder === '' ? "asc" : orderMap[this.curOrder];
        const deviceTypeName = this.searchDeviceType === '全部' ? "all" : this.searchDeviceType;
        const data = await getDetailedDeviceType('search', this.curPage, searchColumn, searchOrder, deviceTypeName, this.pageMode);
        this.tableData = data.data.d;
        this.getTotalPage('search', deviceTypeName);
        this.loading = false;
      },
      async pageChange() {
        this.getTableData();
      },
      async getTotalPage(searchType, device='all') {
        if(searchType === 'all') {
          this.totalPage = (await getDevicePageNumber('all')).data.d;
        } else if(searchType === 'search') {
          const d = device === '全部' ? 'all' : device;
          this.totalPage = (await getDevicePageNumber('search', d)).data.d;
        }
      },
      async sortChange(ob) {
        this.curSortColumn = ob.prop;
        this.curOrder = ob.order;
        this.getTableData();
      },

      async deleteDeviceType(row) {
        const affiliateDevice = (await getDeviceTypeAffiliateDevice(row.id)).data.d;
        if (affiliateDevice === 0) {
          try {
            this.$confirm('确认删除？')
              .then(async _ => {
                const data = await deleteDeviceType(row.id);
                if (data.data.c === 200) {
                  this.$message({
                    message: '删除成功',
                    type: 'success'
                  });
                  //再获取一次所有信息
                  this.getTableData();
                }
              })
              .catch(_ => {
              });
          } catch (e) {
            console.log(e)
          }
        } else {
          this.$msgbox('该类型有' + affiliateDevice + '个相关设备， 无法被删除');
        }
      },
      async openUpdateForm(row) {//打开更新表单
        this.updateData = JSON.parse(JSON.stringify(row));
        this.updateFormVisible = true;
      },
      async searchByDeviceType() {
        if (this.searchDeviceType !== "") {
          this.tableData = (await getDetailedDeviceType()).data.d;
        } else {
          this.tableData = (await getDetailedDeviceType()).data.d;
        }
      },
      async multipleDelete() {
        try {
          this.$confirm('确认删除？')
            .then(async _ => {
              this.deleteData.number = this.multipleSelection.map(el => el.id);
              const data = await deleteMultipleDeviceTypeApi(this.deleteData);
              if (data.data.c === 200) {
                this.$message({
                  message: '删除成功',
                  type: 'success'
                });
                //再获取一次所有信息
                this.getTableData();
              }
            })
            .catch(_ => {
            });
        } catch (e) {
          console.log(e)
        }
      },
      async add(formName) {
        this.$refs[formName].validate(async (valid) => {
          if (valid) {
            try {
              const data = await addDeviceType(this.newData);
              this.newFormVisible = false;
              if (data.data.c === 200) {
                this.$message({
                  message: '添加成功',
                  type: 'success'
                });
                //再获取一次所有信息
                this.getTableData();
              }
            } catch (e) {
              this.newFormVisible = false;
              this.$message.error('添加设备类型未成功');
            }
          }
        });
      },
      async update(formName) {
        this.$refs[formName].validate(async (valid) => {
          if (valid) {
            try {
              const data = await updateDeviceType(this.updateData.id, this.updateData);
              this.updateFormVisible = false;
              if (data.data.c === 200) {
                this.$message({
                  message: '更新成功',
                  type: 'success'
                });
                //再获取一次所有信息
                this.getTableData();
              }
            } catch (e) {
              this.updateFormVisible = false;
              this.$message.error('更新设备类型未成功');
            }
          }
        });
      },
    },
    async mounted() {
      this.getTableData();
      this.getTotalPage('all');
      this.deviceType = (await getDeviceType()).data.d;
      console.log(this.tableData);
    },
  }
</script>

<style scoped>
@import "../../assets/scss/variaties.scss";
  .search-container, .table-container, .deleteButton-container {
    margin: 1% 1%;
    text-align: left;
    border: none;
  }

  h2 {
    display: inline;
  }

</style>
