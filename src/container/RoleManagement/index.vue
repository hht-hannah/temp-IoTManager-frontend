<template>
  <div class="role-management-container">
    <h2>{{$t('message.roleManagement')}}</h2>
    <div class="search-container" v-if="checkUserAuth(['USER_RETRIEVE'])">
        <el-input v-model="username" :placeholder="$t('message.allUser')"></el-input>
        <el-button type="primary" @click="searchUser">{{$t('message.searchDeviceByName')}}</el-button>

      <el-button
        type="primary"
        class="float-right"
        @click="createNewDialogFormVisible=true"
        v-if="checkUserAuth(['USER_CREATE'])"
      >创建新用户</el-button>
    </div>
    <!--<hr>-->
    <div class="table" v-if="checkUserAuth(['USER_RETRIEVE'])">
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="id" :label="$t('message.userID')"></el-table-column>
        <el-table-column prop="userName" label="用户名"></el-table-column>
        <el-table-column prop="displayName" label="昵称"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="phoneNumber" label="电话"></el-table-column>
        <!--<el-table-column-->
        <!--prop="department"-->
        <!--label="部门">-->
        <!--</el-table-column>-->
        <!--TODO:权限  -->
        <el-table-column label="操作" v-if="checkUserAuth(['USER_DELETE', 'USER_UPDATE'])">
          <template slot-scope="scope">
            <el-button
              @click="editAuthority(scope.row)"
              type="primary"
              size="small"
              v-if="checkUserAuth(['USER_UPDATE'])"
            >修改</el-button>
            <!--<el-button @click="resetPassword(scope.row)" type="warning" size="small">重置随机密码</el-button>-->
            <el-button
              @click="deleteUser(scope.row)"
              type="danger"
              size="small"
              v-if="checkUserAuth(['USER_DELETE']) && scope.row.role !== 2"
            >删除</el-button>
            <el-button
              v-if="scope.row.role !== 2"
              @click="openAuthChangeForm(scope.row)"
              type="success"
              size="small"
            >权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog title="修改用户" :visible.sync="dialogFormVisible">
      <!--<el-tag-->
      <!--:key="tag"-->
      <!--v-for="tag in dynamicTags"-->
      <!--closable-->
      <!--:disable-transitions="false"-->
      <!--@close="handleClose(tag)">-->
      <!--{{tag}}-->
      <!--</el-tag>-->
      <!--<el-select v-model="inputValue"-->
      <!--v-if="inputVisible"-->
      <!--ref="saveTagInput"-->
      <!--@keyup.enter.native="handleInputConfirm"-->
      <!--placeholder="请选择">-->
      <!--<el-option-->
      <!--v-for="item in options"-->
      <!--:key="item.value"-->
      <!--:label="item.label"-->
      <!--:value="item.label">-->
      <!--</el-option>-->
      <!--</el-select>-->
      <!--<el-button v-else class="button-new-tag" size="small" @click="showInput">+ New Tag</el-button>-->
      <el-form :model="editedUser">
        <el-form-item label="用户名">
          <el-input v-model="editedUser.userName"></el-input>
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="editedUser.displayName"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editedUser.email"></el-input>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="editedUser.phoneNumber"></el-input>
        </el-form-item>
        <!--<el-form-item label="部门">-->
        <!--<el-select v-model="editedUser.department" placeholder="请选择部门">-->
        <!--<el-option-->
        <!--v-for="item in departmentOptions"-->
        <!--:key="item.id"-->
        <!--:label="item.departmentName"-->
        <!--:value="item.departmentName">-->
        <!--</el-option>-->
        <!--</el-select>-->
        <!--</el-form-item>-->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmEdit(currentID)">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="变更权限" :visible.sync="authChangeVisible">
      <table border="1" cellspacing="0">
        <thead>
          <tr>
            <td>页面</td>
            <td>子页面</td>
            <td>权限</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>仪表板</td>
            <td>无</td>
            <td>
              <el-checkbox v-model="authList.DASHBOARD_RETRIEVE" label="查看"></el-checkbox>
            </td>
          </tr>
          <tr>
            <td rowspan="3">设备管理</td>
            <td>网关设备</td>
            <td>
              <el-checkbox v-model="authList.GATEWAY_RETRIEVE" label="查看"></el-checkbox>
              <el-checkbox v-model="authList.GATEWAY_EXPORT_EXCEL" label="导出Excel"></el-checkbox>
              <el-checkbox v-model="authList.GATEWAY_IMPORT_EXCEL" label="导入Excel"></el-checkbox>
              <el-checkbox v-model="authList.GATEWAY_CREATE" label="新增"></el-checkbox>
              <el-checkbox v-model="authList.GATEWAY_DELETE" label="删除、批量删除"></el-checkbox>
              <el-checkbox v-model="authList.GATEWAY_UPDATE" label="修改"></el-checkbox>
            </td>
          </tr>
          <tr>
            <td>物理设备</td>
            <td>
              <el-checkbox v-model="authList.DEVICE_RETRIEVE" label="查看"></el-checkbox>
              <el-checkbox v-model="authList.DEVICE_EXPORT_EXCEL" label="导出Excel"></el-checkbox>
              <el-checkbox v-model="authList.DEVICE_IMPORT_EXCEL" label="导入Excel"></el-checkbox>
              <el-checkbox v-model="authList.DEVICE_CREATE" label="新增"></el-checkbox>
              <el-checkbox v-model="authList.DEVICE_DELETE" label="删除、批量删除"></el-checkbox>
              <el-checkbox v-model="authList.DEVICE_UPDATE" label="修改"></el-checkbox>
            </td>
          </tr>
          <tr>
            <td>设备数据</td>
            <td>
              <el-checkbox v-model="authList.DEVICEDATA_RETRIEVE" label="查看"></el-checkbox>
              <el-checkbox v-model="authList.DEVICEDATA_EXPORT_EXCEL" label="导出Excel"></el-checkbox>
              <el-checkbox v-model="authList.DEVICEDATA_DELETE" label="删除、批量删除"></el-checkbox>
              <el-checkbox v-model="authList.DEVICEDATA_UPDATE" label="修改"></el-checkbox>
            </td>
          </tr>
          <tr>
            <td rowspan="3">监控告警</td>
            <td>监控配置</td>
            <td>
              <el-checkbox v-model="authList.MONITOR_RETRIEVE" label="查看"></el-checkbox>
              <el-checkbox v-model="authList.MONITOR_DEFINE_THRESHOLD" label="定义报警规则"></el-checkbox>
              <el-checkbox v-model="authList.MONITOR_EXPORT_DEVICEDATA" label="导出设备数据"></el-checkbox>
            </td>
          </tr>
          <tr>
            <td>告警规则</td>
            <td>
              <el-checkbox v-model="authList.ALARMRULE_RETRIEVE" label="查看"></el-checkbox>
              <el-checkbox v-model="authList.ALARMRULE_DELETE" label="删除、批量删除"></el-checkbox>
              <el-checkbox v-model="authList.ALARMRULE_UPDATE" label="修改"></el-checkbox>
            </td>
          </tr>
          <tr>
            <td>告警信息</td>
            <td>
              <el-checkbox v-model="authList.ALARMINFO_RETRIEVE" label="查看"></el-checkbox>
              <el-checkbox v-model="authList.ALARMINFO_DELETE" label="删除、批量删除"></el-checkbox>
              <el-checkbox v-model="authList.ALARMINFO_UPDATE" label="修改"></el-checkbox>
            </td>
          </tr>
          <tr>
            <td rowspan="4">报表中心</td>
            <td>时间维度</td>
            <td>
              <el-checkbox v-model="authList.REPORT_TIME_RETRIEVE" label="查看"></el-checkbox>
            </td>
          </tr>
          <tr>
            <td>地域维度</td>
            <td>
              <el-checkbox v-model="authList.REPORT_REGION_RETRIEVE" label="查看"></el-checkbox>
            </td>
          </tr>
          <tr>
            <td>设备类型</td>
            <td>
              <el-checkbox v-model="authList.REPORT_DEVICETYPE_RETRIEVE" label="查看"></el-checkbox>
            </td>
          </tr>
          <tr>
            <td>标签维度</td>
            <td>
              <el-checkbox v-model="authList.REPORT_TAG_RETRIEVE" label="查看"></el-checkbox>
            </td>
          </tr>
          <tr>
            <td>用户管理</td>
            <td>无</td>
            <td>
              <el-checkbox v-model="authList.USER_RETRIEVE" label="查看"></el-checkbox>
              <el-checkbox v-model="authList.USER_CREATE" label="新增"></el-checkbox>
              <el-checkbox v-model="authList.USER_DELETE" label="删除、批量删除"></el-checkbox>
              <el-checkbox v-model="authList.USER_UPDATE" label="修改"></el-checkbox>
              <el-checkbox v-model="authList.USER_AUTH" label="权限"></el-checkbox>
            </td>
          </tr>
          <tr>
            <td rowspan="2">配置管理</td>
            <td>地域配置</td>
            <td>
              <el-checkbox v-model="authList.CONFIGURE_REGION_RETRIEVE" label="查看"></el-checkbox>
              <el-checkbox v-model="authList.CONFIGURE_REGION_CREATE" label="新增"></el-checkbox>
              <el-checkbox v-model="authList.CONFIGURE_REGION_DELETE" label="删除、批量删除"></el-checkbox>
              <el-checkbox v-model="authList.CONFIGURE_REGION_UPDATE" label="修改"></el-checkbox>
            </td>
          </tr>
          <tr>
            <td>系统配置</td>
            <td>
              <el-checkbox v-model="authList.CONFIGURE_SYSTEM_RETRIEVE" label="查看"></el-checkbox>
              <el-checkbox v-model="authList.CONFIGURE_SYSTEM_CREATE" label="新增"></el-checkbox>
              <el-checkbox v-model="authList.CONFIGURE_SYSTEM_DELETE" label="删除、批量删除"></el-checkbox>
              <el-checkbox v-model="authList.CONFIGURE_SYSTEM_UPDATE" label="修改"></el-checkbox>
            </td>
          </tr>
        </tbody>
      </table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="authChangeVisible = false">取 消</el-button>
        <el-button @click="updateAuth" type="primary">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="添加用户" :visible.sync="createNewDialogFormVisible">
      <el-form :rules="rules" ref="newUser" :model="newUser">
        <el-form-item label="用户名" prop="userName" label-width="120px">
          <el-input v-model="newUser.userName"></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="displayName" label-width="120px">
          <el-input v-model="newUser.displayName"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" label-width="120px">
          <el-input v-model="newUser.password"></el-input>
        </el-form-item>
        <!--<el-form-item label="确认密码" prop="passwordConfirm" label-width="120px">-->
        <!--<el-input type="password" v-model="newUser.passwordConfirm"></el-input>-->
        <!--</el-form-item>-->
        <el-form-item label="邮箱" prop="email" label-width="120px">
          <el-input v-model="newUser.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="phoneNumber" label-width="120px">
          <el-input v-model="newUser.phoneNumber"></el-input>
        </el-form-item>
        <!--<el-form-item label="部门" prop="department" label-width="120px">-->
        <!--<el-select v-model="newUser.department" placeholder="请选择部门">-->
        <!--<el-option-->
        <!--v-for="item in departmentOptions"-->
        <!--:key="item.id"-->
        <!--:label="item.departmentName"-->
        <!--:value="item.departmentName">-->
        <!--</el-option>-->
        <!--</el-select>-->
        <!--</el-form-item>-->
        <!--<el-form-item label="权限" label-width="120px">-->
        <!--<el-tag-->
        <!--:key="tag"-->
        <!--v-for="tag in newUser.authorities"-->
        <!--closable-->
        <!--:disable-transitions="false"-->
        <!--@close="handleClose2(tag)">-->
        <!--{{tag}}-->
        <!--</el-tag>-->
        <!--<el-select v-model="inputValue"-->
        <!--v-if="inputVisible"-->
        <!--ref="saveTagInput"-->
        <!--@keyup.enter.native="handleInputConfirm2"-->
        <!--placeholder="请选择">-->
        <!--<el-option-->
        <!--v-for="item in options"-->
        <!--:key="item.value"-->
        <!--:label="item.label"-->
        <!--:value="item.label">-->
        <!--</el-option>-->
        <!--</el-select>-->
        <!--<el-button v-else class="button-new-tag" size="small" @click="showInput">+ New Tag</el-button>-->
        <!--</el-form-item>-->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="createNewDialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmCreateNew">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  createNewUser,
  deleteUser,
  editUser,
  getAllAuthorities,
  getAuthByUid,
  getUserById,
  getUserTable,
  searchUsers,
  updateUserAuth
} from "../../api/api";
import { isvalidPhone } from "../../common/validate";
import { checkAuth } from "../../common/util";

var validPhone = (rule, value, callback) => {
  if (!value) {
    callback(new Error("请输入电话号码"));
  } else if (!isvalidPhone(value)) {
    callback(new Error("请输入正确的11位手机号码"));
  } else {
    callback();
  }
};
var validatePass2 = (rule, value, callback) => {
  if (value === "") {
    callback(new Error("请再次输入密码"));
  } else if (value !== this.newUser.password) {
    callback(new Error("两次输入密码不一致!"));
  } else {
    callback();
  }
};

export default {
  name: "RoleManagement",
  data() {
    return {
      rules: {
        userName: [{ required: true, message: "名称必填", trigger: "blur" }],
        displayName: [{ required: true, message: "昵称必填", trigger: "blur" }],
        password: [{ required: true, message: "密码必填", trigger: "blur" }],
        passwordConfirm: [
          { required: true, validator: validatePass2, trigger: "blur" }
        ],
        email: [
          { required: true, message: "请输入邮箱地址", trigger: "blur" },
          {
            type: "email",
            message: "请输入正确的邮箱地址",
            trigger: ["blur", "change"]
          }
        ],
        phoneNumber: [
          { required: true, trigger: "blur", validator: validPhone }
        ],
        department: [{ required: true, message: "请填写部门", trigger: "blur" }]
      },
      username: "",
      departmentOptions: [],
      department: "",
      tableData: [],
      currentID: "",
      updateAuthUserId: 0,
      authList: {
        DASHBOARD_RETRIEVE: false,

        GATEWAY_RETRIEVE: false,
        GATEWAY_EXPORT_EXCEL: false,
        GATEWAY_IMPORT_EXCEL: false,
        GATEWAY_CREATE: false,
        GATEWAY_DELETE: false,
        GATEWAY_UPDATE: false,

        DEVICE_RETRIEVE: false,
        DEVICE_EXPORT_EXCEL: false,
        DEVICE_IMPORT_EXCEL: false,
        DEVICE_CREATE: false,
        DEVICE_DELETE: false,
        DEVICE_UPDATE: false,

        DEVICEDATA_RETRIEVE: false,
        DEVICEDATA_EXPORT_EXCEL: false,
        DEVICEDATA_DELETE: false,
        DEVICEDATA_UPDATE: false,

        REPORT_TIME_RETRIEVE: false,
        REPORT_REGION_RETRIEVE: false,
        REPORT_DEVICETYPE_RETRIEVE: false,
        REPORT_TAG_RETRIEVE: false,

        MONITOR_RETRIEVE: false,
        MONITOR_DEFINE_THRESHOLD: false,
        MONITOR_EXPORT_DEVICEDATA: false,

        ALARMRULE_RETRIEVE: false,
        ALARMRULE_DELETE: false,
        ALARMRULE_UPDATE: false,

        ALARMINFO_RETRIEVE: false,
        ALARMINFO_UPDATE: false,
        ALARMINFO_DELETE: false,

        USER_RETRIEVE: false,
        USER_CREATE: false,
        USER_DELETE: false,
        USER_UPDATE: false,
        USER_AUTH: false,

        CONFIGURE_REGION_RETRIEVE: false,
        CONFIGURE_REGION_CREATE: false,
        CONFIGURE_REGION_DELETE: false,
        CONFIGURE_REGION_UPDATE: false,

        CONFIGURE_SYSTEM_RETRIEVE: false,
        CONFIGURE_SYSTEM_CREATE: false,
        CONFIGURE_SYSTEM_DELETE: false,
        CONFIGURE_SYSTEM_UPDATE: false
      },
      authChangeVisible: false,
      dialogFormVisible: false,
      createNewDialogFormVisible: false,
      dynamicTags: [],
      inputVisible: false,
      inputValue: "",
      options: [],
      newUser: {
        userName: "",
        displayName: "",
        password: "",
        passwordConfirm: "",
        email: "",
        phoneNumber: "",
        department: ""
        // authorities:[]
      },
      editedUser: {
        userName: "",
        displayName: "",
        password: "",
        email: "",
        phoneNumber: "",
        department: ""
      }
    };
  },
  methods: {
    checkUserAuth(auth) {
      return checkAuth(auth);
    },
    async searchDeviceByName() {
      let result = await getUserTable(this.username, this.department);
      if (result.data.c === 200) {
        this.$message({
          message: "查找成功",
          type: "success"
        });
        this.tableData = result.data.d;
      } else {
        this.$message.error("查找失败");
      }
    },
    async editAuthority(row) {
      this.dialogFormVisible = true;
      this.currentID = row.id;
      this.editedUser = (await getUserById(this.currentID)).data.d;
      //this.dynamicTags = (await getAuthorities(row.id)).data.d;
    },
    async resetPassword(row) {},
    async deleteUser(row) {
      try {
        this.$confirm("确认删除？")
          .then(async _ => {
            if ((await deleteUser(row.id)).data.c === 200) {
              this.$message({
                message: "删除成功",
                type: "success"
              });
              this.tableData = (await getUserTable()).data.d;
            } else {
              this.$message.error("删除失败");
            }
          })
          .catch(_ => {});
      } catch (e) {
        console.log(e);
      }
    },
    handleClose(tag) {
      this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1);
    },
    handleClose2(tag) {
      this.newUser.authorities.splice(this.newUser.authorities.indexOf(tag), 1);
    },
    showInput() {
      this.inputVisible = true;
    },
    async confirmEdit(row) {
      if ((await editUser(this.currentID, this.editedUser)).data.c === 200) {
        this.$message({
          message: "更新成功",
          type: "success"
        });
        this.tableData = (await getUserTable()).data.d;
      } else {
        this.$message.error("更新失败");
      }
      this.dialogFormVisible = false;
    },
    async confirmCreateNew() {
      console.log(this.newUser);
      if ((await createNewUser(this.newUser)).data.c === 200) {
        this.$message({
          message: "添加成功",
          type: "success"
        });
        //更新下面表格数据
        this.tableData = (await getUserTable()).data.d;
      } else {
        this.$message.error("添加失败");
      }
      this.createNewDialogFormVisible = false;
    },
    //工具函数
    handleInputConfirm() {
      let inputValue = this.inputValue;
      if (inputValue) {
        this.dynamicTags.push(inputValue);
      }
      this.inputVisible = false;
      this.inputValue = "";
    },
    handleInputConfirm2() {
      let inputValue = this.inputValue;
      if (inputValue) {
        this.newUser.authorities.push(inputValue);
      }
      this.inputVisible = false;
      this.inputValue = "";
    },
    async searchUser() {
      console.log(this.username);
      if (this.username !== "") {
        this.tableData = (await searchUsers(this.username)).data.d;
      } else {
        this.tableData = (await getUserTable()).data.d;
      }
    },
    async openAuthChangeForm(row) {
      this.updateAuthUserId = row.id;
      Object.keys(this.authList).forEach(e => {
        this.authList[e] = false;
      });
      const userAuth = (await getAuthByUid(row.id)).data.d;
      userAuth.forEach(e => {
        this.authList[e] = true;
      });
      this.authChangeVisible = true;
    },
    async updateAuth() {
      try {
        let auths = [];
        Object.keys(this.authList).forEach(e => {
          if (this.authList[e] === true) {
            auths.push(e);
          }
        });
        const data = await updateUserAuth(this.updateAuthUserId, {
          str: auths
        });
        this.authChangeVisible = false;
        if (data.data.c === 200) {
          this.$message({
            message: "更新权限成功, 请通知相关用户重新登录",
            type: "success"
          });
        }
      } catch (e) {
        this.authChangeVisible = false;
        this.$message.error("更新权限未成功");
      }
    }
  },
  async mounted() {
    // 获取所有部门和所有用户信息
    // this.departmentOptions = (await getAllDepartments()).data.d;
    this.tableData = (await getUserTable()).data.d;
    // this.options = (await getAllAuthorities()).data.d;
    // this.tableData = (await getUserTable(this.username, this.department)).data.d;
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/scss/variaties.scss";
.role-management-container {
  margin: 10px;
  .top-header {
    margin: 15px 0;

    .float-right {
      float: right;
    }
  }

  .el-input {
    width: 200px;
  }

  .table {
    margin: 15px 0;
  }
}
</style>
