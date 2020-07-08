<template>
  <div>
     <h2 class="page-title"> 物理设备 </h2>
    <div class="search-container">
      <el-form :inline="true" :model="searchDevice" class="header">
        <el-form-item v-if="checkDeviceAuth(['DEVICE_RETRIEVE'])">
          <el-cascader
            v-model="cascaderValue"
            :placeholder="'选择' + GLOBAL.firstLevel + '/' + GLOBAL.secondLevel + '/' + GLOBAL.thirdLevel "
            :options="cascaderOptions"
            @change="searchCascader">
          </el-cascader>
        </el-form-item>
        <el-form-item  class="export-excel-button" v-if="checkDeviceAuth(['DEVICE_EXPORT_EXCEL'])">
          <el-button type="primary" @click="exportExcel">导出Excel</el-button>
        </el-form-item>
        <el-form-item  class="upload-excel-button" v-if="checkDeviceAuth(['DEVICE_IMPORT_EXCEL'])">
          <el-upload
            ref="upload"
            action="https://jsonplaceholder.typicode.com/posts/"
            :show-file-list="false"
            :on-success="readExcel"
            :on-error="uploadFailed">
            <el-button slot="trigger"
                       type="primary">导入excel
            </el-button>
          </el-upload>
        </el-form-item>
      </el-form>
    </div>
    <div class="addbutton-container" v-if="checkDeviceAuth(['DEVICE_CREATE'])">
      <el-button type="primary" @click="newFormVisible = true">新增设备</el-button>
      <el-button type="primary" @click="multipleDelete" v-if="checkDeviceAuth(['DEVICE_DELETE'])">批量删除</el-button>
    </div>
    <div class="table-container" v-if="checkDeviceAuth(['DEVICE_RETRIEVE'])">
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @sort-change="sortChange"
        id="physical-device-out-table">
        <el-table-column
          type="selection" v-if="checkDeviceAuth(['DEVICE_DELETE'])">
        </el-table-column>
        <el-table-column
          prop="hardwareDeviceID"
          label="设备编号"
          width="120px"
          sortable="custom">
        </el-table-column>
        <el-table-column
          prop="deviceName"
          label="设备名称"
          width="120px"
          sortable="custom">
        </el-table-column>
        <el-table-column
          prop="deviceType"
          label="设备类型">
        </el-table-column>
        <el-table-column
          prop="city"
          :label="GLOBAL.firstLevel">
        </el-table-column>
        <el-table-column
          prop="factory"
          :label="GLOBAL.secondLevel">
        </el-table-column>
        <el-table-column
          prop="workshop"
          :label="GLOBAL.thirdLevel">
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="创建时间"
          width="120"
          sortable="custom">
        </el-table-column>
        <el-table-column
          prop="updateTime"
          label="更新时间"
          width="120"
          sortable="custom">
        </el-table-column>
        <el-table-column
          prop="gatewayId"
          label="所属网关">
        </el-table-column>
        <el-table-column
          prop="mac"
          label="Mac地址">
        </el-table-column>
        <el-table-column
          prop="remark"
          label="描述">
        </el-table-column>
        <el-table-column
          label="标签">
          <template slot-scope="scope">
            <div slot="reference" class="name-wrapper">
              <el-tag v-for="t in scope.row.tags" v-bind:key="t">
                {{ t }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          width="120"
          label="操作" v-if="checkDeviceAuth(['DEVICE_UPDATE', 'DEVICE_DELETE'])">
          <template slot-scope="scope">
            <el-button @click="openUpdateForm(scope.row)" type="text" size="small"
                       v-if="checkDeviceAuth(['DEVICE_UPDATE'])">修改
            </el-button>
            <el-button @click="deleteDevice(scope.row)" type="text" size="small"
                       v-if="checkDeviceAuth(['DEVICE_DELETE'])">删除
            </el-button>
            <el-button @click="editTag(scope.row)" type="text" size="small">标签编辑</el-button>
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
    <el-dialog title="修改设备" :visible.sync="updateFormVisible">
      <el-form :model="updateData" ref="updateData">
        <el-form-item label="设备编号" label-width="120px">
          <el-input v-model="updateData.hardwareDeviceID" autocomplete="off" disabled></el-input>
        </el-form-item>
        <el-form-item label="设备名称" prop="deviceName" label-width="120px"
                      :rules="[{required: true, message: '设备名称不能为空'}]">
          <el-input v-model="updateData.deviceName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="设备类型" prop="deviceType" label-width="120px"
                      :rules="[{required: true, message: '设备类型不能为空'}]">
          <el-select v-model="updateData.deviceType" placeholder="选择设备类型">
            <el-option
              v-for="dt in deviceType"
              :key="dt.id"
              :label="dt.deviceTypeName"
              :value="dt.deviceTypeName">
            </el-option>
          </el-select>
          <el-button type="primary" @click="typeAddVisible = true">+</el-button>
        </el-form-item>
        <el-form-item :label="GLOBAL.firstLevel" prop="city" label-width="120px"
                      :rules="[{required: true, message: GLOBAL.firstLevel+'不能为空'}]">
          <el-select v-model="updateData.city" @change="getUpdateFactory(updateData.city)" placeholder="请选择">
            <el-option
              v-for="c in updateCity"
              :key="c.value"
              :label="c.label"
              :value="c.label">
            </el-option>
          </el-select>
          <el-button type="primary" @click="cityAddVisible = true">+</el-button>
        </el-form-item>
        <el-form-item :label="GLOBAL.secondLevel" prop="factory" label-width="120px"
                      :rules="[{required: true, message: GLOBAL.secondLevel+'不能为空'}]">
          <el-select v-model="updateData.factory" @change="getUpdateWorkshop(updateData.factory)" placeholder="请选择">
            <el-option
              v-for="f in updateFactory"
              :key="f.value"
              :label="f.label"
              :value="f.label">
            </el-option>
          </el-select>
          <el-button type="primary" @click="factoryAddVisible = true">+</el-button>
        </el-form-item>
        <el-form-item :label="GLOBAL.thirdLevel" prop="workshop" label-width="120px"
                      :rules="[{required: true, message: GLOBAL.thirdLevel+'不能为空'}]">
          <el-select v-model="updateData.workshop" placeholder="请选择">
            <el-option
              v-for="w in updateWorkshop"
              :key="w.value"
              :label="w.label"
              :value="w.label">
            </el-option>
          </el-select>
          <el-button type="primary" @click="workshopAddVisible = true">+</el-button>
        </el-form-item>
        <el-form-item label="所属网关" prop="gatewayId" label-width="120px"
                      :rules="[{required: true, message: '所属网关不能为空'}]">
          <el-select v-model="updateData.gatewayId" placeholder="选择所属网关">
            <el-option
              v-for="dt in gateway"
              :key="dt.id"
              :label="dt.gatewayName"
              :value="dt.gatewayName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="MAC地址" label-width="120px">
          <el-input v-model="updateData.mac" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="描述" label-width="120px">
          <el-input v-model="updateData.remark" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="updateFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="update('updateData')">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="新增设备" :visible.sync="newFormVisible">
      <el-form :model="newDeviceData" ref="newDeviceData">
        <el-form-item label="设备编号" prop="hardwareDeviceID" label-width="120px"
                      :rules="[{required: true, message: '设备编号不能为空'}]">
          <el-input v-model="newDeviceData.hardwareDeviceID" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="设备名称" prop="deviceName" label-width="120px"
                      :rules="[{required: true, message: '设备名称不能为空'}]">
          <el-input v-model="newDeviceData.deviceName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="设备类型" prop="deviceType" label-width="120px"
                      :rules="[{required: true, message: '设备类型不能为空'}]">
          <el-select v-model="newDeviceData.deviceType" placeholder="选择设备类型">
            <el-option
              v-for="dt in deviceType"
              :key="dt.id"
              :label="dt.deviceTypeName"
              :value="dt.deviceTypeName">
            </el-option>
          </el-select>
          <el-button type="primary" @click="typeAddVisible = true">+</el-button>
        </el-form-item>
        <el-form-item :label="GLOBAL.firstLevel" prop="city" label-width="120px"
                      :rules="[{required: true, message: GLOBAL.firstLevel+'不能为空'}]">
          <el-select v-model="newDeviceData.city" @change="getNewFactory(newDeviceData.city)" placeholder="请选择">
            <el-option
              v-for="c in city"
              :key="c.value"
              :label="c.label"
              :value="c.label">
            </el-option>
          </el-select>
          <el-button type="primary" @click="cityAddVisible = true">+</el-button>
        </el-form-item>
        <el-form-item :label="GLOBAL.secondLevel" prop="factory" label-width="120px"
                      :rules="[{required: true, message: GLOBAL.secondLevel+'不能为空'}]">
          <el-select v-model="newDeviceData.factory" @change="getNewWorkshop(newDeviceData.city,newDeviceData.factory)" placeholder="请选择">
            <el-option
              v-for="f in factory"
              :key="f.value"
              :label="f.label"
              :value="f.label">
            </el-option>
          </el-select>
          <el-button type="primary" @click="factoryAddVisible = true">+</el-button>
        </el-form-item>
        <el-form-item :label="GLOBAL.thirdLevel" prop="workshop" label-width="120px"
                      :rules="[{required: true, message: GLOBAL.thirdLevel+'不能为空'}]">
          <el-select v-model="newDeviceData.workshop" @change="getNewGateway(newDeviceData.city,newDeviceData.factory,newDeviceData.workshop)" placeholder="请选择">
            <el-option
              v-for="w in workshop"
              :key="w.value"
              :label="w.label"
              :value="w.label">
            </el-option>
          </el-select>
          <el-button type="primary" @click="workshopAddVisible = true">+</el-button>
        </el-form-item>
        <el-form-item label="所属网关" prop="gatewayId" label-width="120px"
                      :rules="[{required: true, message: '所属网关不能为空'}]">
          <el-select v-model="newDeviceData.gatewayId" placeholder="选择所属网关">
            <el-option
              v-for="dt in gateway"
              :key="dt.id"
              :label="dt.gatewayName"
              :value="dt.gatewayName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="MAC地址" label-width="120px">
          <el-input v-model="newDeviceData.mac" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="描述" label-width="120px">
          <el-input v-model="newDeviceData.remark" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="newFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="add('newDeviceData')">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="标签编辑" :visible.sync="tagEditVisible">
      <div>
        <p>当前标签</p>
        <el-tag v-for="t in curTag" v-bind:key="t">{{t}}</el-tag>
      </div>
      <el-divider></el-divider>
      <div>
        <p>请选择标签</p>
        <el-select v-model="curTag" multiple placeholder="请选择标签">
          <el-option
            v-for="t in allTags"
            :key="t"
            :label="t"
            :value="t">
          </el-option>
        </el-select>
        <el-button type="primary" @click="newTagVisible = true">+</el-button>
      </div>
      <el-divider></el-divider>
      <div>
        <el-button @click="tagEditVisible = false">取消</el-button>
        <el-button type="primary" @click="setDeviceTags">确认修改</el-button>
      </div>
    </el-dialog>
    <el-dialog title="新增标签" :visible.sync="newTagVisible">
      <div>
        <p>新标签名</p>
        <el-input v-model="newTagName" placeholder="请输入新标签名"></el-input>
      </div>
      <el-divider></el-divider>
      <div>
        <el-button @click="newTagVisible = false">取消</el-button>
        <el-button type="primary" @click="addTag">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="新增设备类型" :visible.sync="typeAddVisible">
      <el-form :model="typeTable" ref="typeTable">
        <el-form-item label="设备类型名" prop="type" label-width="120px"
                      :rules="[{required: true, message: '设备类型不能为空'}]">
          <el-input v-model="typeTable.type" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="typeAddVisible = false">取 消</el-button>
        <el-button type="primary" @click="addType('typeTable')">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="'新增'+GLOBAL.firstLevel" :visible.sync="cityAddVisible">
      <el-form :model="cityTable" ref="cityTable">
        <el-form-item :label="GLOBAL.firstLevel+'名'" prop="cityName" label-width="120px"
                      :rules="[{required: true, message: GLOBAL.firstLevel+'不能为空'}]">
          <el-input v-model="cityTable.cityName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="备注" label-width="120px">
          <el-input v-model="cityTable.remark" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cityAddVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCity('cityTable')">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="'新增'+GLOBAL.secondLevel" :visible.sync="factoryAddVisible">
      <el-form :model="factoryTable" ref="factoryTable">
        <el-form-item :label="GLOBAL.secondLevel+'名'" prop="factoryName" label-width="120px"
                      :rules="[{required: true, message: GLOBAL.secondLevel+'不能为空'}]">
          <el-input v-model="factoryTable.factoryName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item :label="GLOBAL.secondLevel+'电话'" label-width="120px">
          <el-input v-model="factoryTable.factoryPhoneNumber" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item :label="GLOBAL.secondLevel+'地址'" label-width="120px">
          <el-input v-model="factoryTable.factoryAddress" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item :label="'所属'+GLOBAL.firstLevel" prop="city" label-width="120px"
                      :rules="[{required: true, message: '所属'+GLOBAL.firstLevel+'不能为空'}]">
          <el-select v-model="factoryTable.city" placeholder="请选择">
            <el-option
              v-for="c in newCityList"
              :key="c.id"
              :label="c.cityName"
              :value="c.cityName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" label-width="120px">
          <el-input v-model="factoryTable.remark" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="factoryAddVisible = false">取 消</el-button>
        <el-button type="primary" @click="addFactory('factoryTable')">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="'新增'+GLOBAL.thirdLevel" :visible.sync="workshopAddVisible">
      <el-form :model="workshopTable" ref="workshopTable">
        <el-form-item :label="GLOBAL.thirdLevel+'名'" prop="workshopName" label-width="120px"
                      :rules="[{required: true, message: GLOBAL.thirdLevel+'名不能为空'}]">
          <el-input v-model="workshopTable.workshopName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item :label="GLOBAL.thirdLevel+'电话'" label-width="120px">
          <el-input v-model="workshopTable.workshopPhoneNumber" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item :label="GLOBAL.thirdLevel+'地址'" label-width="120px">
          <el-input v-model="workshopTable.workshopAddress" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item :label="'所属'+GLOBAL.secondLevel+'名'" prop="factory" label-width="120px"
                      :rules="[{required: true, message: '所属'+GLOBAL.secondLevel+'名不能为空'}]">
          <el-select v-model="workshopTable.factory" placeholder="请选择">
            <el-option
              v-for="f in newFactoryList"
              :key="f.id"
              :label="f.factoryName"
              :value="f.factoryName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" label-width="120px">
          <el-input v-model="workshopTable.remark" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="workshopAddVisible = false">取 消</el-button>
        <el-button type="primary" @click="addWorkshop('workshopTable')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {
    addCity,
    addDeviceApi,
    addFactory, addTag,
    addWorkshop,
    createDeviceType,
    deleteDeviceApi,
    deleteMultipleDeviceApi,
    getAllDepartments, getAllTags,
    getCity,
    getCityCascaderOptions,
    getCityOptions,
    getDeviceAffiliateAlarmInfo,
    getDeviceAffiliateData, getDeviceAffiliateThreshold,
    getDeviceByWorkshop, getDeviceIdExist,
    getDeviceNumber,
    getDevicesApi,
    getDeviceState, getDeviceTag,
    getDeviceType,
    getFactory,
    getFactoryOptions,
    getGatewaysApi,
    getLocation,
    getWorkshop,
    getWorkshopOptions,
    searchDevicesByDeviceIdApi,
    searchDevicesByDeviceNameApi, setDeviceTags,
    updateDeviceApi,
    getGatewayByWorkshop
  } from '../../api/api';
  import UploadImg from "../../components/UploadImg/index";
  import FileSaver from 'file-saver'
  import XLSX from 'xlsx'
  import {checkAuth} from "../../common/util";

  export default {
    name: "PhysicalDevice",
    components: {UploadImg},
    data() {
      return {
        loading: false,
        totalPage: 0,
        curSortColumn: '',
        curOrder: '',
        curTagEdit: 0,
        newTagName: '',
        cascaderValue: [],
        cascaderOptions: [],
        typeAddVisible: false,
        cityAddVisible: false,
        factoryAddVisible: false,
        workshopAddVisible: false,
        updateFormVisible: false,
        newFormVisible: false,
        tagEditVisible: false,
        newTagVisible: false,
        allTags: [],
        curTag: [],
        deviceState: [],
        newCityList: [],
        newFactoryList: [],
        city: [],
        factory: [],
        workshop: [],
        updateCity: [],
        updateFactory: [],
        updateWorkshop: [],
        deviceType: [],
        department: [],
        affiliateGateways: [],
        tableData: [{
          "id": "",
          "hardwareDeviceID": "",
          "deviceName": "",
          "city": "",
          "factory": "",
          "workshop": "",
          "deviceState": "",
          "lastConnectionTime": "",
          "imageUrl": "",
          "gatewayID": "",
          "mac": "",
          "deviceType": "",
          "createTime": "",
          "updateTime": "",
          "remark": "",
          "department": "",
        }],
        typeTable: {
          type: ''
        },
        cityTable: {
          cityName: "",
          remark: ""
        },
        factoryTable: {
          factoryName: "",
          factoryPhoneNumber: "",
          factoryAddress: "",
          remark: "",
          city: ""
        },
        workshopTable: {
          workshopName: "",
          workshopPhoneNumber: "",
          workshopAddress: "",
          remark: "",
          factory: ""
        },
        multipleSelection: [],
        updateData: {
          hardwareDeviceID: '',
          deviceName: '',
          city: '',
          factory: '',
          workshop: '',
          deviceState: '',
          imageUrl: '',
          gatewayId: '',
          mac: '',
          deviceType: '',
          remark: '',
          // department: '',
        },
        newDeviceData: {
          // 标签
          hardwareDeviceID: '',
          deviceName: '',
          city: '',
          factory: '',
          workshop: '',
          deviceState: '',
          imageUrl: '',
          gatewayId: '',
          mac: '',
          deviceType: '',
          remark: '',
          // department: '',

          inputVisible: false,
          inputValue: '',
          dynamicTags: ['标签一', '标签二', '标签三'],
        },
        searchDevice: {
          city: 'all',
          factory: 'all',
          workshop: 'all',
        },
        cityOptions: [],
        factoryOptions: [],
        workshopOptions: [],
        searchData: {
          deviceID: '',
          deviceName: ''
        },
        deleteData: {
          number: []
        },
        curPage: 1,

        gateway:[]
      }
    },

    methods: {
      checkDeviceAuth(auth) {
        return checkAuth(auth);
      },
      uploadFailed() {
        this.$message.error('导入失败');
      },
      readExcel(res, file) {
        let vm = this;
        const fileReader = new FileReader();
        fileReader.onload = (ev) => {
          try {
            const data = ev.target.result;
            const workbook = XLSX.read(data, {
              type: 'binary'
            });
            let sheetArray;
            for (let sheet in workbook.Sheets) {
              sheetArray = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
            }
            let dictionary = {
              "设备编号": "hardwareDeviceID",
              "设备名称": "deviceName",
              "设备类型": "deviceType",
              "城市": "city",
              "实验楼": "factory",
              "实验室": "workshop",
              "设备图像链接": "imageUrl",
              "所属网关": "gatewayId",
              "Mac地址": "mac",
              "设备状态": "deviceState",
              "上次连接时间": "lastConnectionTime",
              "创建时间": "createTime",
              "更新时间": "updateTime",
              "描述": "remark",
              "部门": "department",
            };
            let newData = sheetArray.map((item) => {
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
              if (data === 'success') {
                this.getDevices();
              }
            });
            this.$message({
              message: '导入成功',
              type: 'success'
            });
          } catch
            (e) {
            this.$message.warning('文件类型不正确！');
            return false;
          }
        };
        fileReader.readAsBinaryString(file.raw);
      },
      exportExcel() {
        var fix = document.querySelector('.el-table__fixed-right');
        var wb;
        if (fix) {
          wb = XLSX.utils.table_to_book(document.querySelector('#physical-device-out-table').removeChild(fix));
          console.log("test");
          document.querySelector('#physical-device-out-table').appendChild(fix);
        } else {
          wb = XLSX.utils.table_to_book(document.querySelector('#physical-device-out-table'));
        }
        /* get binary string as output */
        var wbout = XLSX.write(wb, {
          bookType: 'xlsx',
          bookSST: true,
          type: 'array'
        });
        try {
          FileSaver.saveAs(
            new Blob([wbout], {
              type: 'application/octet-stream'
            }),
            '物理设备.xlsx'
          );
        } catch (e) {
          if (typeof console !== 'undefined') console.log(e, wbout);
        }
        return wbout;
      },
      addImage(file) {
        this.newDeviceData.img = file;
      },
      async searchDeviceByName() {
        console.log(this.searchDeviceName);
        const data = await searchDevicesByDeviceNameApi(this.searchDeviceName.deviceName);
        this.tableData = data.data.d;
      },
      async searchDeviceById() {
        const data = await searchDevicesByDeviceIdApi(this.searchDeviceId.deviceId);
        this.tableData = data.data.d;
      },
      async add(formName) {
        this.$refs[formName].validate( async (valid) => {
          if (valid) {
            const deviceIdExist = (await getDeviceIdExist(this.newDeviceData.hardwareDeviceID)).data.d;
            if (deviceIdExist === 0) {
              try {
                const data = await addDeviceApi(this.newDeviceData);
                this.newFormVisible = false;
                if (data.data.c === 200) {
                  this.$message({
                    message: '添加成功',
                    type: 'success'
                  });
                  this.newDeviceData = {
                    // 标签
                    hardwareDeviceID: '',
                    deviceName: '',
                    city: '',
                    factory: '',
                    workshop: '',
                    deviceState: '',
                    imageUrl: '',
                    gatewayId: '',
                    mac: '',
                    deviceType: '',
                    remark: '',
                    // department: '',

                    inputVisible: false,
                    inputValue: '',
                    dynamicTags: ['标签一', '标签二', '标签三'],
                  };
                  this.getDevices();
                }
              } catch (e) {
                this.newFormVisible = false;
                this.$message.error('添加设备未成功');
              }
            } else {
              this.newFormVisible = false;
              this.$message.error('设备ID重复');
            }
          }
        });
      },
      async addType(formName) {
        this.$refs[formName].validate(async (valid) => {
          if (valid) {
            try {
              const data = await createDeviceType(this.typeTable.type);
              this.typeAddVisible = false;
              if (data.data.d === "success") {
                this.$message({
                  message: '添加成功',
                  type: 'success'
                });
                this.deviceType = (await getDeviceType()).data.d;
              }
            } catch (e) {
              this.typeAddVisible = false;
              this.$message.error('设备类型添加失败');
            }
          }
        });
      },
      async addCity(formName) {
        this.$refs[formName].validate(async (valid) => {
          if (valid) {
            try {
              const data = await addCity(this.cityTable);
              this.cityAddVisible = false;
              if (data.data.d === "success") {
                this.$message({
                  message: '添加成功',
                  type: 'success'
                });
                this.city = (await getCityOptions()).data.d;
                this.newCityList = (await getCity(1, 'id', 'asc', 0)).data.d;
                this.cityOptions = (await getCityOptions()).data.d;
                this.getDeviceOptions();
              }
            } catch (e) {
              this.cityAddVisible = false;
              this.$message.error('城市添加失败');
            }
          }
        });
      },
      async addFactory(formName) {
        this.$refs[formName].validate(async (valid) => {
          if (valid) {
            try {
              const data = await addFactory(this.factoryTable);
              this.factoryAddVisible = false;
              if (data.data.d === "success") {
                this.$message({
                  message: '添加成功',
                  type: 'success'
                });
                this.factory = (await getFactoryOptions(this.factoryTable.city)).data.d;
                this.newFactoryList = (await getFactory(1, 'id', 'asc', 0)).data.d;
                this.getDeviceOptions();
              }
            } catch (e) {
              this.factoryAddVisible = false;
              this.$message.error('添加失败');
            }
          }
        });
      },
      async addWorkshop(formName) {
        this.$refs[formName].validate(async (valid) => {
          if (valid) {
            try {
              const data = await addWorkshop(this.workshopTable);
              this.workshopAddVisible = false;
              if (data.data.d === "success") {
                this.$message({
                  message: '添加成功',
                  type: 'success'
                });
                this.workshop = (await getWorkshopOptions(this.workshopTable.factory)).data.d;
                this.getDeviceOptions();
              }
            } catch (e) {
              this.workshopAddVisible = false;
              this.$message.error('添加失败');
            }
          }
        });
      },
      async getUpdateFactory(city) {
        this.updateFactory = (await getFactoryOptions(city)).data.d;
        if (this.updateFactory[0] != null) {
          this.updateData.factory = this.updateFactory[0].value;
          this.getUpdateWorkshop(this.updateData.factory);
        } else {
          this.updateData.factory = "";
          this.updateData.workshop = "";
          this.updateFactory = [];
        }
      },
      async getUpdateWorkshop(factory) {
        this.updateWorkshop = (await getWorkshopOptions(factory)).data.d;
        if (this.updateWorkshop[0] != null) {
          this.updateData.workshop = this.updateWorkshop[0].value;
        } else {
          this.updateData.workshop = "";
        }
      },
      async getNewFactory(city) {
        this.factory = (await getFactoryOptions(city)).data.d;
        if (this.factory[0] != null) {
          this.newDeviceData.factory = this.factory[0].value;
          this.getNewWorkshop(city,this.newDeviceData.factory);
        } else {
          this.newDeviceData.factory = "";
          this.newDeviceData.workshop = "";
          this.factory = [];
        }
      },
      async getNewWorkshop(city,factory) {
        console.log("getNewWorkshop run");
        this.workshop = (await getWorkshopOptions(city,factory)).data.d;
        if (this.workshop[0] != null) {
          this.newDeviceData.workshop = this.workshop[0].value;
          this.getNewGateway(this.newDeviceData.city,this.newDeviceData.factory,this.newDeviceData.workshop);
        } else {
          this.newDeviceData.workshop = "";
        }
      },
      async getNewGateway(city,factory,workshop){
        console.log("getNewGateway run");
        this.gateway=(await getGatewayByWorkshop(city,factory,workshop)).data.d;
        if (this.gateway[0]!=null){
          this.newDeviceData.gatewayId=this.gateway[0].gatewayName;
        }else{
          this.newDeviceData.gatewayId="";
        }
      },
      async update(formName) {
        this.$refs[formName].validate( async (valid) => {
          if (valid) {
            try {
              const data = await updateDeviceApi(this.updateData);
              this.updateFormVisible = false;
              if (data.data.c === 200) {
                this.$message({
                  message: '更新成功',
                  type: 'success'
                });
                this.getDevices();
              }
            } catch (e) {
              this.updateFormVisible = false;
              this.$message.error('更新设备未成功');
            }
          }
        });
      },
      async setDeviceTags() {
        try {
          const data = await setDeviceTags(this.curTagEdit, this.curTag);
          this.tagEditVisible = false;
          if (data.data.c === 200) {
            this.$message({
              message: '更新成功',
              type: 'success'
            });
            this.getDevices();
          }
        } catch (e) {
          this.tagEditVisible = false;
          this.$message.error('标签更新未成功');
        }
      },
      async addTag() {
        if (this.allTags.indexOf(this.newTagName) === -1) {
          try {
            const data = await addTag(this.newTagName);
            this.newTagVisible = false;
            if (data.data.c === 200) {
              this.$message({
                message: '更新成功',
                type: 'success'
              });
              this.newTagName = '';
              this.allTags = (await getAllTags()).data.d;
            }
          } catch (e) {
            this.newTagVisible = false;
            this.newTagName = '';
            this.$message.error('添加标签失败');
          }
        } else {
          this.newTagVisible = false;
          this.newTagName = '';
          this.$message.error('标签名重复');
        }
      },
      async editTag(row) {
        this.curTag = (await getDeviceTag(row.id)).data.d;
        this.curTagEdit = row.id;
        this.tagEditVisible = true;
      },
      async openUpdateForm(row) {//打开更新表单
        this.updateData = row;
        this.updateFactory = (await getFactoryOptions(row.city)).data.d;
        this.updateWorkshop = (await getWorkshopOptions(row.cityName,row.factory)).data.d;
        this.updateFormVisible = true;
      },
      async deleteDevice(row) {
        const affiliateData = (await getDeviceAffiliateData(row.hardwareDeviceID)).data.d;
        const affiliateAlarmInfo = (await getDeviceAffiliateAlarmInfo(row.hardwareDeviceID)).data.d;
        const affiliateThreshold = (await getDeviceAffiliateThreshold(row.hardwareDeviceID)).data.d;
        if (affiliateData === 0 && affiliateAlarmInfo === 0 && affiliateThreshold === 0) {
          try {
            this.$confirm('确认删除？')
              .then(async _ => {
                console.log(row);
                console.log(row.id);
                const data = await deleteDeviceApi(row.id);
                if (data.data.c === 200) {
                  this.$message({
                    message: '删除成功',
                    type: 'success'
                  });
                  //再获取一次所有网关信息
                  this.getDevices();
                }
              })
              .catch(_ => {
              });
          } catch (e) {
            console.log(e)
          }
        } else {
          this.$msgbox('该设备有' + affiliateData + '条数据, ' + affiliateAlarmInfo + '条告警记录, ' + affiliateThreshold + '个相关规则, 无法被删除')
        }
      },
      async getDevices() {
        this.loading = true;
        const orderMap = {ascending: 'asc', descending: 'desc'};
        const searchColumn = this.curSortColumn === '' ? "id" : this.curSortColumn;
        const searchOrder = this.curOrder === '' ? "asc" : orderMap[this.curOrder];
        const searchCity = this.searchDevice.city === '全部' ? "all" : this.searchDevice.city;
        const searchFactory = this.searchDevice.factory === '全部' ? "all" : this.searchDevice.factory;
        const searchWorkshop = this.searchDevice.workshop === '全部' ? "all" : this.searchDevice.workshop;
        const data = await getDevicesApi('search', this.curPage, searchColumn, searchOrder, searchCity, searchFactory, searchWorkshop);
        this.tableData = data.data.d;
        this.getTotalPage('search', searchCity, searchFactory, searchWorkshop);
        this.loading = false;
      },
      handleSelectionChange(val) {
        console.log('change', this.multipleSelection);
        this.multipleSelection = val;
      },
      async multipleDelete() {
        try {
          this.$confirm('确认删除？')
            .then(async _ => {
              this.deleteData.number = this.multipleSelection.map(el => el.id);
              const data = await deleteMultipleDeviceApi(this.deleteData);
              if (data.data.c === 200) {
                this.$message({
                  message: '删除成功',
                  type: 'success'
                });
                //再获取一次所有网关信息
                this.getDevices();
              }
            })
            .catch(_ => {
            });
        } catch (e) {
          console.log(e)
        }
      },
      // 标签处理函数
      handleClose(tag) {
        this.newDeviceData.dynamicTags.splice(this.newDeviceData.dynamicTags.indexOf(tag), 1);
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
        this.newDeviceData.inputValue = '';
      },
      async filter(city, factory, workshop) {
        if (city !== '全部') {
          const data = await getDeviceByWorkshop(city, factory, workshop);
          this.tableData = data.data.d;
        } else {
          this.getDevices();
        }
        //调接口，传searchDevice参数
      },
      getCityList() {
        // 调获取城市接口
      },
      async getFactoryList(city) {
        if (city !== '全部') {
          this.factoryOptions = (await getFactoryOptions(city)).data.d;
          if (this.factoryOptions[0] != null) {
            this.searchDevice.factory = this.factoryOptions[0].value;
            this.getWorkshopList(city,this.searchDevice.factory);
          } else {
            this.searchDevice.factory = "";
            this.searchDevice.workshop = "";
            this.workshopOptions = [];
          }
        } else {
          this.factoryOptions = [];
          this.workshopOptions = [];
          this.searchDevice.factory = "全部";
          this.searchDevice.workshop = "全部";
        }
        // 调获取工厂接口，searchDevice.city参数
      },
      async getWorkshopList(city,factory) {
        this.workshopOptions = (await getWorkshopOptions(city,factory)).data.d;
        if (this.workshopOptions[0] != null) {
          this.searchDevice.workshop = this.workshopOptions[0].value;
        } else {
          this.searchDevice.workshop = "";
        }
        // 调获取车间接口，searchDevice.city，searchDevice.factory参数
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
      async getTotalPage(searchType, city = 'all', factory = 'all', workshop = 'all') {
        if (searchType === 'all') {
          this.totalPage = (await getDeviceNumber('all')).data.d;
        } else if (searchType === 'search') {
          const c = city === '全部' ? 'all' : city;
          const f = factory === '全部' ? 'all' : factory;
          const w = workshop === '全部' ? 'all' : workshop;
          this.totalPage = (await getDeviceNumber('search', c, f, w)).data.d;
        }
      }
    },
    async mounted() {
      this.getTotalPage('all');
      this.getDeviceOptions();
      //获取所有设备信息
      this.getDevices();
      this.cityOptions = (await getCityOptions()).data.d;
      this.city = (await getCityOptions()).data.d;
      this.updateCity = (await getCityOptions()).data.d;
      this.newCityList = (await getCity(1, 'id', 'asc', 0)).data.d;
      this.newFactoryList = (await getFactory(1, 'id', 'asc', 0)).data.d;
      //this.affiliateGateways = (await getGatewaysApi('all')).data.d;
      // this.factory = (await getFactory()).data.d;
      // this.workshop = (await getWorkshop()).data.d;
      this.deviceState = (await getDeviceState()).data.d;
      this.deviceType = (await getDeviceType()).data.d;
      this.department = (await getAllDepartments()).data.d;
      this.allTags = (await getAllTags()).data.d;
    }
  }
</script>

<style scoped>
@import "../../assets/scss/variaties.scss";
 .addbutton-container, .table-container {
    margin: 1% 1%;
    text-align: left;
  }

  .el-form {
  margin: 10px 0 -10px 10px;
}
.export-excel-button, .upload-excel-button {
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
