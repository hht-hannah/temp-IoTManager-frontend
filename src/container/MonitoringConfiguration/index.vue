<template>
  <div>
    <el-dialog title="选择导出数据时间范围" :visible.sync="showExportDeviceData">
      <el-form label-width="100px">
        <el-form-item label="属性">
          <el-select class="output-select" v-model="exportIndex" multiple placeholder="请选择属性">
            <el-option
              v-for="item in deviceData.affiliateFields"
              :key="item.id"
              :label="item.fieldName"
              :value="item.fieldId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="exportDeviceTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="数据类型">
          <span>
            <el-radio v-model="exportScale" label="hour">时数据</el-radio>
            <el-radio v-model="exportScale" label="day">日数据</el-radio>
            <el-radio v-model="exportScale" label="month">月数据</el-radio>
          </span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showExportDeviceData=false">取 消</el-button>
        <el-button type="primary" @click="exportDeviceData()">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="新建规则" :visible.sync="showAlarmRules">
      <el-form ref="alarmRulesForm" :model="alarmRules" label-width="80px">
        <el-form-item prop="name" label="规则名称" :rules="[{ required: true, message: '名称不能为空'}]">
          <el-input v-model="alarmRules.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="规则描述">
          <el-input type="textarea" v-model="alarmRules.description"></el-input>
        </el-form-item>
        <el-form-item prop="deviceGroup" label="设备" :rules="[{ required: true, message: '项目必选'}]">
          <el-select
            v-model="alarmRules.deviceGroup"
            placeholder="请选择设备"
            @change="getAffiliateField(alarmRules.deviceGroup)"
          >
            <el-option
              v-for="item in devices"
              :key="item.id"
              :label="item.deviceName"
              :value="item.hardwareDeviceID"
            ></el-option>
          </el-select>
        </el-form-item>
        <!--<template v-for="(item,index) in alarmRules.condition">-->
        <!--<h3 style="margin-left: 10px">规则{{index+1}}</h3>-->
        <!--<el-form-item :prop="'condition.' + index + '.field'" label="告警属性" :rules="[{ required: true, message: '属性名称必选'}]">-->
        <!--<el-form-item :prop="'condition.' + index + '.field'" label="告警属性" :rules="[{ required: true, message: '属性名称必选'}]">-->
        <el-form-item prop="field" label="告警属性" :rules="[{ required: true, message: '告警属性必选'}]">
          <el-select v-model="alarmRules.field" placeholder="请选择告警属性">
            <el-option
              v-for="item in fieldOptions"
              :key="item.id"
              :label="item.fieldName"
              :value="item.fieldId"
            ></el-option>
          </el-select>
          <el-button type="primary" @click="addFieldVisible = true">+</el-button>
        </el-form-item>
        <!--<el-form-item :prop="'condition['+index+'].operator'" label="运算" :rules="[{ required: true, message: '运算方式必选'}]">-->
        <el-form-item prop="Operator" label="运算" :rules="[{ required: true, message: '运算方式必选'}]">
          <el-select v-model="alarmRules.Operator" placeholder="请选择运算">
            <el-option label="=" value="equal"></el-option>
            <el-option label=">" value="greater"></el-option>
            <el-option label="<" value="less"></el-option>
          </el-select>
        </el-form-item>
        <!--<el-form-item :prop="'condition['+index+'].value'" label="报警阈值" :rules="[{ required: true, message: '报警阈值必选'}]">-->
        <el-form-item prop="value" label="报警阈值" :rules="[{ required: true, message: '报警阈值必选'}]">
          <el-input v-model="alarmRules.value"></el-input>
        </el-form-item>
        <el-form-item prop="severity" label="告警等级">
          <el-select v-model="alarmRules.severity" placeholder="请选择运算">
            <el-option
              v-for="item in severityOptions"
              :key="item.id"
              :label="item.severityName"
              :value="item.severityName"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="alarmMethod" label="告警方式">
          <el-select v-model="alarmRules.method" placeholder="请选择方式">
            <el-option label="邮件" value="邮件"></el-option>
            <el-option label="短信" value="短信"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="alarmRules.method==='邮件'" prop="alarmMethod" label="填写邮箱">
          <el-input v-model="alarmRules.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item v-if="alarmRules.method==='短信'" prop="alarmMethod" label="填写短信">
          <el-input v-model="alarmRules.name" autocomplete="off"></el-input>
        </el-form-item>
        <!--</template>-->
        <!--<el-form-item label="添加规则">-->
        <!--<el-button type="primary" @click="addCondition"><i class="el-icon-circle-plus-outline"></i></el-button>-->
        <!--</el-form-item>-->
        <!--<el-form-item label="严重等级">-->
        <!--<el-radio-group v-model="alarmRules.severityLevel">-->
        <!--<el-radio label="critical" name="critical"></el-radio>-->
        <!--<el-radio label="warning" name="warning"></el-radio>-->
        <!--<el-radio label="info" name="info"></el-radio>-->
        <!--</el-radio-group>-->
        <!--</el-form-item>-->
        <!--<el-form-item label="开启规则">-->
        <!--<el-switch v-model="alarmRules.ruleStatus"></el-switch>-->
        <!--</el-form-item>-->
        <!--<el-form-item label="邮件通知">-->
        <!--<el-switch v-model="alarmRules.email"></el-switch>-->
        <!--</el-form-item>-->
      </el-form>
      <!--<hr/>-->
      <!--<h1>总结</h1>-->
      <!--<h1 style="display: inline-block;margin-left: 10px">{{alarmRules.affectNumber}}</h1>个设备被此规则控制-->
      <div slot="footer" class="dialog-footer">
        <el-button @click="showAlarmRules = false">取 消</el-button>
        <el-button type="primary" @click="submitAlarmRules">确 定</el-button>
      </div>
    </el-dialog>

    <el-row v-if="true">
      <el-col :span="4">
        <!--<MonitoringTree></MonitoringTree>-->
        <div class="monitoring-tree-container">
          <el-tree
            v-loading="treeLoading"
            :data="treeData"
            :props="defaultProps"
            @node-click="handleNodeClick"
          ></el-tree>
        </div>
      </el-col>
      <el-col v-loading="pageLoading" :span="20">
        <el-form class="search-container header" :inline="true" :model="form">
          <el-form-item label="设备">
            <el-select
              v-model="form.device"
              @change="handleNodeClick(form.device)"
              placeholder="请选择设备"
            >
              <el-option
                v-for="item in devices"
                :key="item.id"
                :label="item.deviceName"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <!-- <el-form-item :label="GLOBAL.secondLevel" v-if="true">
            <el-select v-model="form.factory" placeholder="请选择工厂" @change="filter">
              <el-option
                v-for="item in factoryOptions"
                :key="item.value"
                :label="item.label"
                :value="item.label"
              ></el-option>
            </el-select>
          </el-form-item>-->
          <!--<el-form-item v-if="checkMonitorAuth(['MONITOR_RETRIEVE'])">-->
          <!--<el-button type="primary" @click="filter"><img src="../../assets/img/find.svg">筛选</el-button>-->
          <!--</el-form-item>-->
          <el-form-item style="float: right" v-if="true">
            <el-button type="primary" @click="showExportDeviceData=true">导出设备数据</el-button>
          </el-form-item>
          <el-form-item style="float: right" v-if="true">
            <el-button type="primary" @click="showAlarmRules=true">定义报警规则</el-button>
          </el-form-item>
        </el-form>
        <monitoring-config v-if="hasData"></monitoring-config>
        <h2 v-else>无数据</h2>
      </el-col>
    </el-row>

    <el-dialog title="新增设备属性" :visible.sync="addFieldVisible">
      <el-form :model="fieldTable" ref="fieldTable">
        <el-form-item
          label="属性名"
          prop="fieldName"
          label-width="120px"
          :rules="[{required: true, message: '属性名不能为空'}]"
        >
          <el-input v-model="fieldTable.fieldName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="属性ID"
          prop="fieldId"
          label-width="120px"
          :rules="[{required: true, message: '属性ID不能为空'}]"
        >
          <el-input v-model="fieldTable.fieldId" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="所属设备"
          prop="device"
          label-width="120px"
          :rules="[{required: true, message: '所属设备不能为空'}]"
        >
          <el-select v-model="fieldTable.device" placeholder="请选择">
            <el-option v-for="d in devices" :key="d.id" :label="d.deviceName" :value="d.deviceName"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addFieldVisible = false">取 消</el-button>
        <el-button type="primary" @click="addField('fieldTable')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import MonitoringTree from "../../components/MonitoringTree/index";
import MonitoringConfig from "../../components/MonitoringConfig/index";
import {
  addRule,
  createNewField,
  getAffiliateFields,
  getCityOptions,
  getDayAggregateData,
  getDeviceApi,
  getDevicesApi,
  getDeviceTreeApi,
  getFactoryOptions,
  getFields,
  getSeverity
} from "../../api/api";
import { checkAuth } from "../../common/util";

export default {
  name: "MonitoringConfiguration",
  data() {
    return {
      deviceId: "Pangu001",
      hasData: true,
      exportScale: "",
      deviceData: {
        affiliateFields: [],
        hardwareDeviceID: ""
      },
      exportIndex: [],
      pageLoading: false,
      treeLoading: false,
      cityOptions: [],
      factoryOptions: [],
      fieldOptions: [],
      severityOptions: [],
      devices: [],

      form: {
        device: ""
      },
      // 弹框
      showExportDeviceData: false,
      exportDeviceTime: [],
      showAlarmRules: false,
      addFieldVisible: false,
      fieldTable: {
        fieldName: "",
        fieldId: "",
        device: ""
      },
      alarmRules: {
        name: "",
        description: "",
        deviceGroup: "",
        // condition: [{
        //   field: '',
        //   operator: '',
        //   value: '',
        //   severityLevel: '',
        //   ruleStatus: ''
        // }],
        field: "",
        Operator: "",
        value: "",
        severity: ""
        // affectNumber: 0
      },
      treeData: [],
      defaultProps: [
        {
          label: "label"
        }
      ],
      deviceGroupOptions: [
        {
          value: "0",
          label: "全部设备"
        },
        {
          value: "1",
          label: "温度传感器"
        }
      ]
    };
  },
  methods: {
    checkMonitorAuth(auth) {
      return checkAuth(auth);
    },
    async getAffiliateField(deviceName) {
      this.fieldOptions = (await getAffiliateFields(deviceName)).data.d;
    },
    async filter() {
      this.treeLoading = true;
      // if (this.form.city !== "" && this.form.factory !== "") {
      //   this.treeData = (
      //     await getDeviceTreeApi(this.form.city, this.form.factory)
      //   ).data.d;
      //   if (this.treeData.length === 0) {
      //     this.hasData = false;
      //     alert("无设备");
      //   } else {
      //     this.hasData = false;
      //     if (this.treeData[0]["children"].length > 0) {
      //       this.hasData = true;
      //       this.handleNodeClick(this.treeData[0]["children"][0]);
      //     }
      //   }
      // } else {
      //   this.treeData = [];
      // }
      this.treeData = [
        {
          label: "上海",
          children: [
            {
              label: "一号楼",
              children: [
                {
                  label: "天平实验室"
                },
                {
                  label: "盘古实验室"
                },
                {
                  label: "温度实验室"
                },
                {
                  label: "01气象站"
                }
              ]
            },
            {
              label: "2号楼"
            },
            {
              label: "TEST-实验楼",
              children: [
                {
                  label: "TEST-实验楼"
                },
                {
                  label: "1号实验楼"
                }
              ]
            },
            {
              label: "维信电子",
              children: [
                {
                  label: "1号车间"
                }
              ]
            }
          ]
        },
        {
          label: "北京"
        },
        {
          label: "南京"
        },
        {
          label: "苏州"
        }
      ];
      this.treeLoading = false;
      //调接口，传form参数
    },
    async getCityList() {
      this.cityOptions = (await getCityOptions()).data.d;
      console.log(this.cityOptions);
      if (this.cityOptions[0] != null) {
        this.form.city = this.cityOptions[0].valueTuple;
        this.getFactoryList(this.cityOptions[0].valueTuple);
      } else {
        this.form.city = "";
        this.form.factory = "";
        this.cityOptions = [];
        this.factoryOptions = [];
      }
      // 调获取城市接口
    },
    async getFactoryList(city) {
      this.factoryOptions = (await getFactoryOptions(city)).data.d;
      if (this.factoryOptions[0] != null) {
        this.hasData = true;
        this.form.factory = this.factoryOptions[0].value;
      } else {
        this.hasData = false;
        this.form.factory = "";
      }
      // 调获取工厂接口，传form.city参数
      this.filter();
    },
    async addField(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          try {
            const data = await createNewField(this.fieldTable);
            this.addFieldVisible = false;
            if (data.data.d === "success") {
              this.$message({
                message: "添加成功",
                type: "success"
              });
              this.getAffiliateField(this.alarmRules.deviceGroup);
            }
          } catch (e) {
            this.addFieldVisible = false;
            this.$message.error("设备属性添加失败");
          }
        }
      });
    },
    async handleNodeClick(data) {
      this.pageLoading = true;
      var currentDevice = null;
      this.devices.forEach(device => {
        if (device.id === data) {
          currentDevice = device;
        }
      });
      if (currentDevice) {
        //data.label是设备名称
        this.$store.dispatch(
          "device/setCurrentDeviceData",
          currentDevice.deviceName
        );
        this.deviceData.hardwareDeviceID = currentDevice.id;
        this.deviceData.affiliateFields = (
          await getAffiliateFields(currentDevice.id)
        ).data.d;
      }
      this.pageLoading = false;
    },
    async exportDeviceData() {
      //导出设备数据接口，传入exportDeviceTime参数，返回内容格式如jsondata
      console.log(this.exportIndex);
      let total_result = [];
      for (let i = 0; i < this.exportIndex.length; i++) {
        let result = (
          await getDayAggregateData(
            this.deviceData.hardwareDeviceID,
            this.exportIndex[i],
            {
              startTime: this.exportDeviceTime[0],
              endTime: this.exportDeviceTime[1]
            },
            this.exportScale
          )
        ).data.d;
        console.log(result);
        let exportData = [];
        for (let j = 0; j < result.length; j++) {
          exportData[j] = {
            time: result[j].time,
            index: result[j].index,
            max: result[j].max,
            min: result[j].min,
            avg: result[j].avg
          };
        }
        total_result = total_result.concat(exportData);
      }

      console.log(total_result);

      let jsonData = total_result;
      //列标题，逗号隔开，每一个逗号就是隔开一个单元格
      let str = `日期,属性ID,最大值,最小值,平均值\n`;
      //增加\t为了不让表格显示科学计数法或者其他格式
      for (let i = 0; i < jsonData.length; i++) {
        for (let item in jsonData[i]) {
          str += `${jsonData[i][item] + "\t"},`;
        }
        str += "\n";
      }
      // console.log(str);
      //encodeURIComponent解决中文乱码
      let uri = "data:text/csv;charset=utf-8,\ufeff" + encodeURIComponent(str);
      //通过创建a标签实现
      let link = document.createElement("a");
      link.href = uri;
      //对下载的文件命名
      link.download = "json数据表.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    submitForm(formName) {
      // console.log(this.$refs[formName]);
      this.$refs[formName].validate(async valid => {
        if (valid) {
          console.log(this.alarmRules);
          let res = await addRule(this.alarmRules);
          this.showAlarmRules = false;
          if (res.data.d === "success") {
            this.$message.success("新增规则成功");
          }
          return true;
        } else {
          return false;
        }
      });
    },
    submitAlarmRules() {
      this.submitForm("alarmRulesForm");
      // 调用提交规则接口，参数alarmRules。
    },
    addCondition() {
      this.alarmRules.condition.push({
        field: "",
        operator: "",
        value: "",
        severityLevel: "",
        ruleStatus: ""
      });
    },
    getAffectNumber() {
      // 接口，获取受影响的设备数，传入alarmRules.deviceGroup,获取的结果返回
      // let result = 13; //要被替换
      // this.alarmRules.affectNumber=result;
    },
    async getField() {
      this.fieldOptions = (await getFields()).data.d;
    },
    async getDevices() {
      this.devices = (await getDevicesApi()).data.d;
    }
  },
  async mounted() {
    await this.getCityList();
    await this.getDevices();

    this.$store.dispatch(
      "device/setCurrentDeviceData",
      this.devices[0].deviceName
    );
    this.devices[0].hardwareDeviceID = devices[0].id;
    this.devices[0].affiliateFields = (
      await getAffiliateFields(devices[0].id)
    ).data.d;
    this.severityOptions = (await getSeverity()).data.d;
    // this.treeData = (await getDeviceTreeApi(this.form.city, this.form.factory)).data.d;
  },
  components: { MonitoringConfig, MonitoringTree }
};
</script>

<style scoped>
@import "../../assets/scss/variaties.scss";
.header {
  padding: 10px;
  /* background-color: rgba(64, 158, 255, 0.05); */
}

.output-select {
  margin-bottom: 20px;
}

.el-tree {
  /* border: 1px solid #DCDFE6; */
  /* font-size: 14px; */
  padding-top: 10px;
  height: 500px;
  background-color: transparent;
}
</style>
