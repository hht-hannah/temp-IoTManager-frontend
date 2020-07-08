<template>
    <div>
      <div class="header-container">
        <el-form :inline="true" class="header">
          <el-form-item>
            <h2>平台三级名称配置</h2>
          </el-form-item>
          <el-form-item v-if="checkNameAuth(['CONFIGURE_SYSTEM_CREATE'])">
            <el-button type="primary" @click="newFormVisible = true">添加三级名称</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="table-container">
        <el-table
          v-if="checkNameAuth(['CONFIGURE_SYSTEM_RETRIEVE'])"
          v-loading="loading"
          :data="tableData"
          border
          highlight-current-row
          style="width: 60%"
          @current-change="handleSelectionChange">
          <el-table-column
            type="index"
            width="55">
          </el-table-column>
          <el-table-column
            prop="name"
            label="平台名称">
          </el-table-column>
          <el-table-column
            prop="first"
            label="一级名称">
          </el-table-column>
          <el-table-column
            prop="second"
            label="二级名称">
          </el-table-column>
          <el-table-column
            prop="third"
            label="三级名称">
          </el-table-column>
          <el-table-column
            fixed="right"
            label="操作">
            <template slot-scope="scope" v-if="checkNameAuth(['CONFIGURE_SYSTEM_UPDATE', 'CONFIGURE_SYSTEM_DELETE'])">
              <el-button @click="openUpdateForm(scope.row)" type="text" size="small"
                         v-if="checkNameAuth(['CONFIGURE_SYSTEM_UPDATE'])">修改</el-button>
              <el-button @click="deleteName(scope.row)" type="text" size="small"
                         v-if="checkNameAuth(['CONFIGURE_SYSTEM_DELETE'])">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div v-if="checkNameAuth(['CONFIGURE_SYSTEM_UPDATE'])" class="selection-container">
        <el-button type="primary" @click="changeGlobalName()">修改为选中三级名称</el-button>
      </div>

      <el-dialog title="添加平台三级名称" :visible.sync="newFormVisible">
        <el-form :model="newData" ref="newData">
          <el-form-item label="平台名称" prop="name" label-width="120px"
                        :rules="[{required: true, message: '平台名称不能为空'}]">
            <el-input v-model="newData.name" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="一级名称" prop="first" label-width="120px"
                        :rules="[{required: true, message: '一级名称不能为空'}]">
            <el-input v-model="newData.first" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="二级名称" prop="second" label-width="120px"
                        :rules="[{required: true, message: '二级名称不能为空'}]">
            <el-input v-model="newData.second" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="三级名称" prop="third" label-width="120px"
                        :rules="[{required: true, message: '三级名称不能为空'}]">
            <el-input v-model="newData.third" autocomplete="off"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="newFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="add('newData')">确 定</el-button>
        </div>
      </el-dialog>

      <el-dialog title="修改平台三级名称" :visible.sync="updateFormVisible">
        <el-form :model="updateData" ref="updateData">
          <el-form-item label="平台名称" prop="name" label-width="120px"
                        :rules="[{required: true, message: '平台名称不能为空'}]">
            <el-input v-model="updateData.name"></el-input>
          </el-form-item>
          <el-form-item label="一级名称" prop="first" label-width="120px"
                        :rules="[{required: true, message: '一级名称不能为空'}]">
            <el-input v-model="updateData.first" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="二级名称" prop="second" label-width="120px"
                        :rules="[{required: true, message: '二级名称不能为空'}]">
            <el-input v-model="updateData.second" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="三级名称" prop="third" label-width="120px"
                        :rules="[{required: true, message: '三级名称不能为空'}]">
            <el-input v-model="updateData.third" autocomplete="off"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="updateFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="update('updateData')">确 定</el-button>
        </div>
      </el-dialog>

    </div>
</template>

<script>
  import global from '../../common/global';
  import {
    getUserByName,
    getAllName,
    deleteName,
    addName,
    updateName,
    changeGlobalName,
    getNewName,
    getUserThreeLevelName,

  } from '../../api/api'
  import {checkAuth} from "../../common/util";
  export default {
    name: "NameConfig",
    data() {
      return {
        newFormVisible: false,
        updateFormVisible: false,
        loading: false,
        tableData: [{
          id: '',
          name: '',
          first: '',
          second: '',
          third: '',
        }],
        newData: {
          name: '',
          first: '',
          second: '',
          third: '',
        },
        updateData: {
          id: '',
          name: '',
          first: '',
          second: '',
          third: '',
        },
        selection: {

        },
        userInfo: '',
      }
    },
    methods: {
      checkNameAuth(auth) {
        return checkAuth(auth);
      },
      handleSelectionChange(val) {
        this.selection = val;
        console.log('select: '+ this.selection.id);
        // console.log(global.firstLevel);
      },
      async getTableData() {
        this.tableData = (await getAllName()).data.d
      },
      async changeGlobalName() {
        try {
          this.$confirm('确认修改？')
            .then(async _ => {
              const data = await changeGlobalName(this.selection.id, this.selection);
              console.log("uid:"+this.userInfo.id);
              const x = await getUserThreeLevelName(this.userInfo.id);
              console.log("uTheme:"+x.data.d.theme);
              const newName = await getNewName(x.data.d.theme);
              global.name = newName.data.d.name;
              console.log("平台名称："+global.name);
              global.firstLevel = newName.data.d.first;
              console.log("一级名称："+global.firstLevel);
              global.secondLevel = newName.data.d.second;
              console.log("一级名称："+global.secondLevel);
              global.thirdLevel = newName.data.d.third;
              if (data.data.c === 200) {
                this.$message({
                  message: '修改成功',
                  type: 'success'
                });
              }
              //location.reload();
            })
        } catch (e) {
          this.$message.error('修改未成功');
        }
      },
      async deleteName(row) {
        try {
          this.$confirm('确认删除？')
            .then(async _ => {
              const data = await deleteName(row.id);
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
      async add(formData){
        this.$refs[formData].validate(async (valid) => {
          if (valid) {
            try {
              const data = await addName(this.newData);
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
              this.$message.error('添加平台三级名称未成功');
            }
          }
        });
      },
      async openUpdateForm(row) {//打开更新表单
        this.updateData = JSON.parse(JSON.stringify(row));
        this.updateFormVisible = true;
      },
      async update(formData) {
        this.$refs[formData].validate(async (valid) => {
          if (valid) {
            try {
              const data = await updateName(this.updateData.id, this.updateData);
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
              this.newFormVisible = false;
              this.$message.error('更新平台三级名称未成功');
            }
          }
        });
      },
    },
    async mounted() {
      console.log("平台名称："+global.name);
      this.getTableData();
      this.userInfo = (await getUserByName(localStorage.getItem('userInfo').substr(1, localStorage.getItem('userInfo').length-2))).data.d;
      console.log(this.userInfo);
    }
  }
</script>

<style scoped>
  h2 {
    display: inline;
  }

  .header-container, .table-container, .selection-container {
    margin: 1% 1%;
    text-align: left;
  }

</style>
