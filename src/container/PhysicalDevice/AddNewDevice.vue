<template>
  <div>
    <el-dialog
      title="新增设备"
      :visible.sync="visible"
      @close="$emit('update:newFormVisible', false)"
      :newFormVisible="newFormVisible"
    >
      <el-form :model="newDeviceData" ref="newDeviceData">
        <el-form-item
          label="设备编号"
          prop="hardwareDeviceID"
          label-width="120px"
          :rules="[{required: true, message: '设备编号不能为空'}]"
        >
          <el-input v-model="newDeviceData.hardwareDeviceID" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="设备名称"
          prop="deviceName"
          label-width="120px"
          :rules="[{required: true, message: '设备名称不能为空'}]"
        >
          <el-input v-model="newDeviceData.deviceName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="设备类型"
          prop="deviceType"
          label-width="120px"
          :rules="[{required: true, message: '设备类型不能为空'}]"
        >
          <el-select v-model="newDeviceData.deviceType" placeholder="选择设备类型">
            <el-option
              v-for="dt in deviceType"
              :key="dt.id"
              :label="dt.deviceTypeName"
              :value="dt.deviceTypeName"
            ></el-option>
          </el-select>
          <el-button type="primary" @click="deviceTypeAddVisible = true">+</el-button>
        </el-form-item>
        <el-form-item
          :label="GLOBAL.firstLevel"
          prop="city"
          label-width="120px"
          :rules="[{required: true, message: GLOBAL.firstLevel+'不能为空'}]"
        >
          <el-select
            v-model="newDeviceData.city"
            @change="getNewFactory(newDeviceData.city)"
            placeholder="请选择"
          >
            <el-option v-for="c in city" :key="c.value" :label="c.label" :value="c.label"></el-option>
          </el-select>
          <el-button type="primary" @click="cityAddVisible = true">+</el-button>
        </el-form-item>
        <el-form-item
          :label="GLOBAL.secondLevel"
          prop="factory"
          label-width="120px"
          :rules="[{required: true, message: GLOBAL.secondLevel+'不能为空'}]"
        >
          <el-select
            v-model="newDeviceData.factory"
            @change="getNewWorkshop(newDeviceData.city,newDeviceData.factory)"
            placeholder="请选择"
          >
            <el-option v-for="f in factory" :key="f.value" :label="f.label" :value="f.label"></el-option>
          </el-select>
          <el-button type="primary" @click="factoryAddVisible = true">+</el-button>
        </el-form-item>
        <el-form-item
          :label="GLOBAL.thirdLevel"
          prop="workshop"
          label-width="120px"
          :rules="[{required: true, message: GLOBAL.thirdLevel+'不能为空'}]"
        >
          <el-select
            v-model="newDeviceData.workshop"
            @change="getNewGateway(newDeviceData.city,newDeviceData.factory,newDeviceData.workshop)"
            placeholder="请选择"
          >
            <el-option v-for="w in workshop" :key="w.value" :label="w.label" :value="w.label"></el-option>
          </el-select>
          <el-button type="primary" @click="workshopAddVisible = true">+</el-button>
        </el-form-item>
        <el-form-item
          label="所属网关"
          prop="gatewayId"
          label-width="120px"
          :rules="[{required: true, message: '所属网关不能为空'}]"
        >
          <el-select v-model="newDeviceData.gatewayId" placeholder="选择所属网关">
            <el-option
              v-for="dt in gateway"
              :key="dt.id"
              :label="dt.gatewayName"
              :value="dt.gatewayName"
            ></el-option>
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
        <el-button @click="$emit('update:newFormVisible', false)">取 消</el-button>
        <el-button type="primary" @click="add('newDeviceData')">确 定</el-button>
      </div>
    </el-dialog>
    <AddDeviceType
      :deviceTypeAddVisible.sync="deviceTypeAddVisible"
      :onClose="onAddDeviceTypeClose"
    ></AddDeviceType>
    <AddCity :cityAddVisible.sync="cityAddVisible" :onClose="onAddCityClose"></AddCity>
    <AddFactory :factoryAddVisible.sync="factoryAddVisible" :onClose="onAddFactoryClose"></AddFactory>
    <AddWorkshop :workshopAddVisible.sync="workshopAddVisible" :onClose="onAddWorkshopClose"></AddWorkshop>
  </div>
</template>


<script>
import {
  addGatewayApi,
  getCityOptions,
  getDeviceType,
  getFactoryOptions,
  getWorkshopOptions,
  getGatewayByWorkshop,
  getDeviceIdExist,
  addDeviceApi
} from "../../api/api";
import AddDeviceType from "../../components/Dialogues/AddDeviceType";
import AddCity from "../../components/Dialogues/AddCity";
import AddFactory from "../../components/Dialogues/AddFactory";
import AddWorkshop from "../../components/Dialogues/AddWorkshop";

export default {
  name: "AddNewDevice",
  components: { AddCity, AddDeviceType, AddFactory, AddWorkshop },
  props: ["newFormVisible"],
  data() {
    return {
      visible: this.newFormVisible,
      cityAddVisible: false,
      factoryAddVisible: false,
      workshopAddVisible: false,
      deviceTypeAddVisible: false,
      city: [],
      deviceType: [],
      gateway: [],
      factory: [],
      workshop: [],
      newDeviceData: {
        // 标签
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
        remark: "",
        // department: '',

        inputVisible: false,
        inputValue: "",
        dynamicTags: ["标签一", "标签二", "标签三"]
      }
    };
  },
  methods: {
    async add(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          const deviceIdExist = (await getDeviceIdExist(
            this.newDeviceData.hardwareDeviceID
          )).data.d;
          if (deviceIdExist === 0) {
            try {
              const data = await addDeviceApi(this.newDeviceData);
              this.$emit("update:newFormVisible", false);
              console.log(data)
              if (data.data.c === 200) {
                this.$message({
                  message: "添加成功",
                  type: "success"
                });
                this.newDeviceData = {
                  // 标签
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
                  remark: "",
                  // department: '',

                  inputVisible: false,
                  inputValue: "",
                  dynamicTags: ["标签一", "标签二", "标签三"]
                };
              this.$emit("getDevices");
              }
            } catch (e) {
              console.log(e)
              this.$emit("update:newFormVisible", false);
              this.$message.error("添加设备未成功");
            }
          } else {
            this.$emit("update:newFormVisible", false);
            this.$message.error("设备ID重复");
          }
        }
      });
    },
    async getNewFactory(city) {
      this.factory = (await getFactoryOptions(city)).data.d;
      if (this.factory[0] != null) {
        this.newDeviceData.factory = this.factory[0].value;
        this.getNewWorkshop(city, this.newDeviceData.factory);
      } else {
        this.newDeviceData.factory = "";
        this.newDeviceData.workshop = "";
        this.factory = [];
      }
    },
    async getNewWorkshop(city, factory) {
      this.workshop = (await getWorkshopOptions(city, factory)).data.d;
      if (this.workshop[0] != null) {
        this.newDeviceData.workshop = this.workshop[0].value;
        this.getNewGateway(
          this.newDeviceData.city,
          this.newDeviceData.factory,
          this.newDeviceData.workshop
        );
      } else {
        this.newDeviceData.workshop = "";
      }
    },
    async getNewGateway(city, factory, workshop) {
      this.gateway = (await getGatewayByWorkshop(
        city,
        factory,
        workshop
      )).data.d;
      if (this.gateway[0] != null) {
        this.newDeviceData.gatewayId = this.gateway[0].gatewayName;
      } else {
        this.newDeviceData.gatewayId = "";
      }
    },
    async onAddCityClose() {
      this.city = (await getCityOptions()).data.d;
      this.getDeviceOptions();
    },
    async onAddDeviceTypeClose() {
      this.deviceType = (await getDeviceType()).data.d;
    },
    async onAddFactoryClose() {
      this.getNewFactory(this.newDeviceData.city);
      this.getDeviceOptions();
    },
    async onAddWorkshopClose() {
      this.getNewWorkshop(this.newDeviceData.city, this.newDeviceData.factory);
      this.getDeviceOptions();
    }
  },
  watch: {
    newFormVisible() {
      this.visible = this.newFormVisible;
    }
  },
  async mounted() {
    this.city = (await getCityOptions()).data.d;
    this.deviceType = (await getDeviceType()).data.d;
  }
};
</script>