<template>
  <div>
    <el-dialog
      title="修改设备"
      :visible.sync="visible"
      @close="$emit('update:updateFormVisible', false)"
      :updateFormVisible="updateFormVisible"
    >
      <el-form :model="updateData" ref="updateData">
        <el-form-item label="设备编号" label-width="120px">
          <el-input v-model="updateData.hardwareDeviceID" autocomplete="off" disabled></el-input>
        </el-form-item>
        <el-form-item
          label="设备名称"
          prop="deviceName"
          label-width="120px"
          :rules="[{required: true, message: '设备名称不能为空'}]"
        >
          <el-input v-model="updateData.deviceName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="设备类型"
          prop="deviceType"
          label-width="120px"
          :rules="[{required: true, message: '设备类型不能为空'}]"
        >
          <el-select v-model="updateData.deviceType" placeholder="选择设备类型">
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
            v-model="updateData.city"
            @change="getUpdateFactory(updateData.city)"
            placeholder="请选择"
          >
            <el-option v-for="c in updateCity" :key="c.value" :label="c.label" :value="c.label"></el-option>
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
            v-model="updateData.factory"
            @change="getUpdateWorkshop(updateData.city, updateData.factory)"
            placeholder="请选择"
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
          <el-select
            v-model="updateData.workshop"
            @change="getUpdateGateway(updateData.city, updateData.factory, updateData.workshop)"
            placeholder="请选择"
          >
            <el-option v-for="w in updateWorkshop" :key="w.value" :label="w.label" :value="w.label"></el-option>
          </el-select>
          <el-button type="primary" @click="workshopAddVisible = true">+</el-button>
        </el-form-item>
        <el-form-item
          label="所属网关"
          prop="gatewayId"
          label-width="120px"
          :rules="[{required: true, message: '所属网关不能为空'}]"
        >
          <el-select v-model="updateData.gatewayId" placeholder="选择所属网关">
            <el-option
              v-for="dt in updateGateway"
              :key="dt.id"
              :label="dt.gatewayName"
              :value="dt.gatewayName"
            ></el-option>
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
        <el-button @click="$emit('update:updateFormVisible', false)">取 消</el-button>
        <el-button type="primary" @click="update('updateData')">确 定</el-button>
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
  getCityOptions,
  getFactoryOptions,
  getWorkshopOptions,
  getDeviceType,
  updateDeviceApi,
  getGatewayByWorkshop
} from "../../api/api";
import AddDeviceType from "../../components/Dialogues/AddDeviceType";
import AddCity from "../../components/Dialogues/AddCity";
import AddFactory from "../../components/Dialogues/AddFactory";
import AddWorkshop from "../../components/Dialogues/AddWorkshop";

export default {
  name: "UpdateDevice",
  props: ["updateFormVisible", "defaultData", "getDeviceOptions"],
  components: { AddCity, AddDeviceType, AddFactory, AddWorkshop },
  data() {
    return {
      visible: this.updateFormVisible,
      cityAddVisible: false,
      factoryAddVisible: false,
      workshopAddVisible: false,
      deviceTypeAddVisible: false,
      updateCity: [],
      updateFactory: [],
      updateWorkshop: [],
      updateGateway: [],
      deviceType: [],
      updateData: {
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
        remark: ""
        // department: '',
      }
    };
  },

  methods: {
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
    async getUpdateWorkshop(city, factory) {
      this.updateWorkshop = (await getWorkshopOptions(city, factory)).data.d;
      if (this.updateWorkshop[0] != null) {
        this.updateData.workshop = this.updateWorkshop[0].value;
      } else {
        this.updateData.workshop = "";
      }
    },
    async getUpdateGateway(city, factory, workshop) {
      this.updateGateway = (await getGatewayByWorkshop(
        city,
        factory,
        workshop
      )).data.d;
      if (this.updateGateway[0] != null) {
        this.updateData.gatewayId = this.updateGateway[0].gatewayName;
      } else {
        this.updateData.gatewayId = "";
      }
    },
    async update(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          try {
            const data = await updateDeviceApi(this.updateData);
            this.$emit("update:updateFormVisible", false);
            console.log(data);
            if (data.data.c === 200) {
              this.$message({
                message: "更新成功",
                type: "success"
              });
              this.$emit("getDevices");
            }
          } catch (e) {
            console.log(e);
            this.$emit("update:updateFormVisible", false);
            this.$message.error("更新设备未成功");
          }
        }
      });
    },
    async onAddCityClose() {
      this.city = (await getCityOptions()).data.d;
      this.getDeviceOptions();
    },
    async onAddDeviceTypeClose() {
      this.deviceType = (await getDeviceType()).data.d;
    },
    async onAddFactoryClose() {
      this.getUpdateFactory(this.updateData.city);
      this.getDeviceOptions();
    },
    async onAddWorkshopClose() {
      this.getUpdateWorkshop(this.updateData.city, this.updateData.factory);
      this.getDeviceOptions();
    }
  },
  watch: {
    async updateFormVisible() {
      this.visible = this.updateFormVisible;
      this.updateData = JSON.parse(JSON.stringify(this.$props.defaultData));
      this.updateFactory = (await getFactoryOptions(
        this.updateData.city
      )).data.d;
      this.updateWorkshop = (await getWorkshopOptions(
        this.updateData.city,
        this.updateData.factory
      )).data.d;
      this.updateGateway = (await getGatewayByWorkshop(
        this.updateData.city,
        this.updateData.factory,
        this.updateData.workshop
      )).data.d;
    }
  },
  async mounted() {
    this.updateCity = (await getCityOptions()).data.d;
    this.deviceType = (await getDeviceType()).data.d;
  }
};
</script>