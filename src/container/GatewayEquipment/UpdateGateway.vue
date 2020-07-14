<template>
  <div>
    <el-dialog
      title="修改网关"
      :visible.sync="visible"
      @close="$emit('update:updateFormVisible', false)"
      :updateFormVisible="updateFormVisible"
    >
      <el-form :model="updateData" ref="updateData">
        <el-form-item label="网关编号" label-width="120px">
          <el-input v-model="updateData.hardwareGatewayID" autocomplete="off" disabled></el-input>
        </el-form-item>
        <el-form-item
          label="网关名称"
          prop="gatewayName"
          label-width="120px"
          :rules="[{required: true, message: '网关名称不能为空'}]"
        >
          <el-input v-model="updateData.gatewayName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="网关类型"
          prop="gatewayType"
          label-width="120px"
          :rules="[{required: true, message: '网关类型不能为空'}]"
        >
          <el-select v-model="updateData.gatewayType" placeholder="选择网关类型">
            <el-option
              v-for="gt in gatewayType"
              :key="gt.id"
              :label="gt.gatewayTypeName"
              :value="gt.gatewayTypeName"
            ></el-option>
          </el-select>
          <el-button type="primary" @click="typeAddVisible = true">+</el-button>
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
            placeholder="选择城市"
          >
            <el-option v-for="c in updateCity" :key="c.value" :label="c.label" :value="c.label"></el-option>
          </el-select>
          <el-button type="primary" @click="cityAddVisible = true">+</el-button>
        </el-form-item>
        <el-form-item
          :label="GLOBAL.secondLevel+'名称'"
          prop="factory"
          label-width="120px"
          :rules="[{required: true, message: GLOBAL.secondLevel+'不能为空'}]"
        >
          <el-select
            v-model="updateData.factory"
            @change="getUpdateWorkshop(updateData.city, updateData.factory)"
            placeholder="选择工厂"
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
          <el-select v-model="updateData.workshop" placeholder="选择车间">
            <el-option v-for="w in updateWorkshop" :key="w.value" :label="w.label" :value="w.label"></el-option>
          </el-select>
          <el-button type="primary" @click="workshopAddVisible = true">+</el-button>
        </el-form-item>
        <!--<el-form-item label="网关状态" label-width="120px">-->
        <!--<el-select v-model="updateData.gatewayState" placeholder="选择网关类型">-->
        <!--<el-option-->
        <!--v-for="gs in gatewayState"-->
        <!--:key="gs.id"-->
        <!--:label="gs.stateName"-->
        <!--:value="gs.stateName">-->
        <!--</el-option>-->
        <!--</el-select>-->
        <!--</el-form-item>-->
        <!--<el-form-item label="网关图像链接" label-width="120px">
          <el-input v-model="updateData.imageUrl" autocomplete="off"></el-input>
        </el-form-item>-->
        <el-form-item label="描述" label-width="120px">
          <el-input v-model="updateData.remark" autocomplete="off"></el-input>
        </el-form-item>
        <!--<el-form-item label="部门" label-width="120px">-->
        <!--<el-select v-model="updateData.department" placeholder="选择网关类型">-->
        <!--<el-option-->
        <!--v-for="d in department"-->
        <!--:key="d.id"-->
        <!--:label="d.departmentName"-->
        <!--:value="d.departmentName">-->
        <!--</el-option>-->
        <!--</el-select>-->
        <!--</el-form-item>-->
        <!--<el-form-item>
          <UploadImg></UploadImg>
        </el-form-item>-->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="$emit('update:updateFormVisible', false)">取 消</el-button>
        <el-button type="primary" @click="updateGateway('updateData')">确 定</el-button>
      </div>
    </el-dialog>
    <AddGatewayType :typeAddVisible.sync="typeAddVisible" :onClose="onAddGatewayTypeClose"></AddGatewayType>
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
  getGatewayType,
  updateGatewayApi
} from "../../api/api";
import AddGatewayType from "../../components/Dialogues/AddGatewayType";
import AddCity from "../../components/Dialogues/AddCity";
import AddFactory from "../../components/Dialogues/AddFactory";
import AddWorkshop from "../../components/Dialogues/AddWorkshop";

export default {
  name: "UpdateGateway",
  props: ["updateFormVisible", "defaultData", "getDeviceOptions"],
  components: { AddCity, AddGatewayType, AddFactory, AddWorkshop },
  data() {
    return {
      visible: this.updateFormVisible,
      cityAddVisible: false,
      factoryAddVisible: false,
      workshopAddVisible: false,
      typeAddVisible: false,
      updateCity: [],
      updateFactory: [],
      updateWorkshop: [],
      gatewayType: [],
      updateData: {
        hardwareGatewayID: "",
        gatewayName: "",
        gatewayType: "",
        city: "",
        factory: "",
        workshop: "",
        gatewayState: "",
        imageUrl: "",
        remark: "",
        department: ""
      }
    };
  },

  methods: {
    async getUpdateFactory(city) {
      this.updateFactory = (await getFactoryOptions(city)).data.d;
      if (this.updateFactory[0] != null) {
        this.updateData.factory = this.updateFactory[0].value;
        this.getUpdateWorkshop(city, this.updateData.factory);
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
    async updateGateway(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          try {
            const data = await updateGatewayApi(this.updateData);
            this.$emit("update:updateFormVisible", false);
            if (data.data.c === 200) {
              this.$message({
                message: "更新成功",
                type: "success"
              });
              this.$emit("getGateways");
            }
          } catch (e) {
            this.$emit("update:updateFormVisible", false);
            this.$message.error("更新网关未成功");
          }
        } else {
          console.log("error input");
          return false;
        }
      });
    },
    async onAddCityClose() {
      this.updateCity = (await getCityOptions()).data.d;
      this.getDeviceOptions();
    },
    async onAddGatewayTypeClose() {
      this.gatewayType = (await getGatewayType()).data.d;
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
    }
  },
  async mounted() {
    this.updateCity = (await getCityOptions()).data.d;
    this.gatewayType = (await getGatewayType()).data.d;
    //newCityList and newFactoryList is because when creating new factory/new workshop, the id of the city and factory is needed, hence complete information is stored in these two arrays.
    // this.newCityList = (await getCity(1, "id", "asc", 0)).data.d;
    // this.newFactoryList = (await getFactory(1, "id", "asc", 0)).data.d;
  }
};
</script>