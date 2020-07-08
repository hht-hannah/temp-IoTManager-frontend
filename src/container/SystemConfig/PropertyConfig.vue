<template>
  <div>
    <div class="search-container">
      <el-form :inline="true" class="header">
        <el-form-item>
          <h2>设备属性</h2>
        </el-form-item>
        <el-form-item v-if="checkPropertyAuth(['CONFIGURE_SYSTEM_RETRIEVE'])">
          <el-input v-model="searchProperty" placeholder="请输入设备属性"></el-input>
        </el-form-item>
        <el-form-item v-if="checkPropertyAuth(['CONFIGURE_SYSTEM_RETRIEVE'])">
          <el-button type="primary">搜索</el-button>
        </el-form-item>
        <el-form-item v-if="checkPropertyAuth(['CONFIGURE_SYSTEM_CREATE'])">
          <el-button type="primary" @click="newFormVisible = true">添加</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table-container" v-if="checkPropertyAuth(['CONFIGURE_SYSTEM_RETRIEVE'])">
      <el-pagination background layout="prev, pager, next"
                     :total="totalPage"
                     :current-page.sync="curPage"
                     :page-size="12"
                     @current-change="pageChange()">
      </el-pagination>
      <el-table
        :data="properties"
        border
        style="width: 60%;"
        @sort-change="sortChange">
        <el-table-column
          prop="device"
          label="所属设备">
        </el-table-column>
        <el-table-column
          prop="fieldId"
          label="属性ID">
        </el-table-column>
        <el-table-column
          prop="fieldName"
          label="属性名称">
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="创建时间"
          sortable="custom">
        </el-table-column>
        <el-table-column
          prop="updateTime"
          label="更新时间"
          sortable="custom">
        </el-table-column>
        <el-table-column
          fixed="right"
          label="操作">
          <template slot-scope="scope" v-if="checkPropertyAuth(['CONFIGURE_SYSTEM_DELETE', 'CONFIGURE_SYSTEM_UPDATE'])">
            <el-button @click="openUpdateForm(scope.row)" type="text" size="small"
                       v-if="checkPropertyAuth(['CONFIGURE_SYSTEM_UPDATE'])">修改</el-button>
            <el-button @click="deleteField(scope.row)" type="text" size="small"
                       v-if="checkPropertyAuth(['CONFIGURE_SYSTEM_DELETE'])">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog title="修改设备属性" :visible.sync="updateFormVisible">
      <el-form :model="updateData" ref="updateData">
        <el-form-item label="属性ID" prop="fieldId" label-width="120px"
                      :rules="[{required: true, message: '属性ID不能为空'}]">
          <el-input v-model="updateData.fieldId" disabled></el-input>
        </el-form-item>
        <el-form-item label="属性名称" prop="fieldName" label-width="120px"
                      :rules="[{required: true, message: '属性名称不能为空'}]">
          <el-input v-model="updateData.fieldName"></el-input>
        </el-form-item>
        <el-form-item label="所属设备" prop="device" label-width="120px"
                      :rules="[{required: true, message: '所属设备不能为空'}]">
          <el-select v-model="updateData.device" placeholder="请选择设备">
            <el-option
              v-for="d in devices"
              :key="d.id"
              :label="d.deviceName"
              :value="d.deviceName">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="updateFormVisible = false">取消</el-button>
        <el-button @click="update('updateData')" type="primary">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="新增设备属性" :visible.sync="newFormVisible">
      <el-form :model="newData" ref="newData">
        <el-form-item label="属性ID" prop="fieldId" label-width="120px"
                      :rules="[{required: true, message: '属性ID不能为空'}]">
          <el-input v-model="newData.fieldId"></el-input>
        </el-form-item>
        <el-form-item label="属性名称" prop="fieldName" label-width="120px"
                      :rules="[{required: true, message: '属性名称不能为空'}]">
          <el-input v-model="newData.fieldName"></el-input>
        </el-form-item>
        <el-form-item label="所属设备" prop="device" label-width="120px"
                      :rules="[{required: true, message: '所属设备不能为空'}]">
          <el-select v-model="newData.device" placeholder="请选择设备">
            <el-option
              v-for="d in devices"
              :key="d.id"
              :label="d.deviceName"
              :value="d.deviceName">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="newFormVisible = false">取消</el-button>
        <el-button @click="add('newData')" type="primary">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {
    createNewField,
    deleteField,
    getDevicesApi,
    getFieldAffiliateData,
    getFields,
    updateField,
    getFieldPageNumber,
  } from "../../api/api";
  import {checkAuth} from "../../common/util";

  export default {
    name: "PropertyConfig",
    data() {
      return {
        pageMode: 1,
        totalPage: 0,
        curPage: 1,
        curSortColumn: '',
        curOrder: '',
        updateFormVisible: false,
        newFormVisible: false,
        properties: [],
        devices: [],
        searchProperty: '',
        updateData: {
          id: 0,
          fieldId: '',
          fieldName: '',
          device: ''
        },
        newData: {
          id: 0,
          fieldId: '',
          fieldName: '',
          device: ''
        }
      }
    },
    methods: {
      checkPropertyAuth(auth) {
        return checkAuth(auth);
      },
      async getAllProperties() {
        const orderMap = {ascending: 'asc', descending: 'desc'};
        const columnMap = {device: 'device', updateTime: 'updateTime', createTime: 'createTime'};
        const searchColumn = this.curSortColumn === '' ? "device" : columnMap[this.curSortColumn];
        const searchOrder = this.curOrder === '' ? "asc" : orderMap[this.curOrder];
        const property = this.searchProperty === '全部' ? "all" : this.searchProperty;
        const data = await getFields('search', this.curPage, searchColumn, searchOrder, property, this.pageMode);
        this.properties = data.data.d;
        this.getTotalPage('search', property);
      },
      async pageChange() {
        this.getAllProperties();
      },
      async getTotalPage(searchType, property='all') {
        if(searchType === 'all') {
          this.totalPage = (await getFieldPageNumber('all')).data.d;
        } else if(searchType === 'search') {
          const p = property === '全部' ? 'all' : property;
          this.totalPage = (await getFieldPageNumber('search', p)).data.d;
        }
      },
      async sortChange(ob) {
        this.curSortColumn = ob.prop;
        this.curOrder = ob.order;
        this.getAllProperties();
      },

      async getDevices() {
        this.devices = (await getDevicesApi('all')).data.d;
      },
      openUpdateForm(row) {
        this.updateData = JSON.parse(JSON.stringify(row));
        this.updateFormVisible = true;
      },
      async add(formName) {
        this.$refs[formName].validate(async (valid) => {
          if (valid) {
            try {
              console.log(this.newData);
              const data = await createNewField(this.newData);
              this.newFormVisible = false;
              if(data.data.c === 200) {
                this.$message({
                  message: '更新成功',
                  type: 'success'
                });
                this.getAllProperties();
              }
            } catch (e) {
              this.newFormVisible = false;
              this.$message.error('添加失败')
            }
          }
        });
      },
      async update(formName) {
        this.$refs[formName].validate(async (valid) => {
          if (valid) {
            try {
              const data = await updateField(this.updateData.id, this.updateData);
              this.updateFormVisible = false;
              if (data.data.c === 200) {
                this.$message({
                  message: '更新成功',
                  type: 'success'
                });
                this.getAllProperties();
              }
            } catch (e) {
              this.updateFormVisible = false;
              this.$message.error('更新未成功');
            }
          }
        });
      },
      async deleteField(row) {
        const affiliateData = (await getFieldAffiliateData(row.fieldId)).data.d;
        if (affiliateData === 0) {
          try {
            this.$confirm('确认删除?')
              .then(async _ => {
                const data = await deleteField(row.id);
                if (data.data.c === 200) {
                  this.$message({
                    message: '删除成功',
                    type: 'success'
                  });
                  this.getAllProperties();
                }
              });
          } catch (e) {
            console.log(e);
          }
        } else {
          this.$msgbox('该属性有' + affiliateData + '条数据，无法被删除');
        }
      }
    },
    async mounted() {
      this.getAllProperties();
      this.getDevices();
    }
  }
</script>

<style scoped>
  .search-container, .table-container, .deleteButton-container {
    margin: 1% 1%;
    text-align: left;
  }

  h2{
    display: inline;
  }
</style>
