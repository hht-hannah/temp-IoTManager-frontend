<template>
  <div>
    <el-dialog
      title="新增网关"
      :visible.sync="visible"
      @close="$emit('update:newFormVisible', false)"
      :newFormVisible="newFormVisible"
    >
      <el-form :model="newGatewayData" ref="newGatewayData">
        <el-form-item
          label="网关编号"
          prop="hardwareGatewayID"
          label-width="120px"
          :rules="[{required: true, message: '网关编号不能为空'}]"
        >
          <el-input v-model="newGatewayData.hardwareGatewayID" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="网关名称"
          prop="gatewayName"
          label-width="120px"
          :rules="[{required: true, message: '网关名称不能为空'}]"
        >
          <el-input v-model="newGatewayData.gatewayName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="网关类型"
          prop="gatewayType"
          label-width="120px"
          :rules="[{required: true, message: '网关类型不能为空'}]"
        >
          <el-select v-model="newGatewayData.gatewayType" placeholder="选择网关类型">
            <el-option
              v-for="gt in gatewayType"
              :key="gt.gatewayTypeName"
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
            v-model="newGatewayData.city"
            @change="getNewFactory(newGatewayData.city)"
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
            v-model="newGatewayData.factory"
            @change="getNewWorkshop(newGatewayData.city,newGatewayData.factory)"
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
          <el-select v-model="newGatewayData.workshop" placeholder="请选择">
            <el-option v-for="w in workshop" :key="w.value" :label="w.label" :value="w.label"></el-option>
          </el-select>
          <el-button type="primary" @click="workshopAddVisible = true">+</el-button>
        </el-form-item>
        <el-form-item label="描述" label-width="120px">
          <el-input v-model="newGatewayData.remark" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="$emit('update:newFormVisible', false)">取 消</el-button>
        <el-button type="primary" @click="add('newGatewayData')">确 定</el-button>
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
  getCity,
  getFactory,
  getCityOptions,
  getGatewayType,
  getFactoryOptions,
  listWorkshopName,
  getGatewayIdExist,
  addGatewayApi
} from "../../api/api";
import AddGatewayType from "../../components/Dialogues/AddGatewayType";
import AddCity from "../../components/Dialogues/AddCity";
import AddFactory from "../../components/Dialogues/AddFactory";
import AddWorkshop from "../../components/Dialogues/AddWorkshop";

export default {
  name: "AddNewGateway",
  components: { AddCity, AddGatewayType, AddFactory, AddWorkshop },
  props: ["newFormVisible", "getDeviceOptions"],
  data() {
    return {
      visible: this.newFormVisible,
      cityAddVisible: false,
      factoryAddVisible: false,
      workshopAddVisible: false,
      typeAddVisible: false,
      city: [],
      gatewayType: [],
      factory: [],
      workshop: [],
      newCityList: [],
      newFactoryList: [],
      newGatewayData: {
        hardwareGatewayID: "",
        gatewayName: "",
        gatewayType: "",
        city: "",
        factory: "",
        workshop: "",
        gatewayState: "",
        imageUrl: "",
        remark: "",
        department: "",

        // 标签
        inputVisible: false,
        inputValue: "",
        dynamicTags: ["标签一", "标签二", "标签三"]
      }
    };
  },
  methods: {
    async getNewFactory(city) {
      if (city != "") {
        this.factory = (await getFactoryOptions(city)).data.d;
      }
      if (this.factory[0] != null) {
        this.newGatewayData.factory = this.factory[0].value;
        this.getNewWorkshop(
          this.newGatewayData.city,
          this.newGatewayData.factory
        );
      } else {
        this.newGatewayData.factory = "";
        this.newGatewayData.workshop = "";
        this.factory = [];
        this.workshop = [];
      }
    },
    async getNewWorkshop(city, factory) {
      if (city != "" && factory != "") {
        this.workshop = (await listWorkshopName(city, factory)).data.d;
      }
      if (this.workshop != null) {
        this.newGatewayData.workshop = this.workshop[0].value;
        console.log(this.newGatewayData.workshop);
      } else {
        console.log("实验室为空！");
        this.newGatewayData.workshop = "";
        this.workshop = [];
      }
    },
    add(formName) {
      console.log(formName);
      this.$refs[formName].validate(async valid => {
        if (valid) {
          const gatewayIdExist = (await getGatewayIdExist(
            this.newGatewayData.hardwareGatewayID
          )).data.d;
          if (gatewayIdExist === 0) {
            try {
              console.log(this.gatewayState);
              const data = await addGatewayApi(this.newGatewayData);
              this.$emit("update:newFormVisible", false);
              if (data.data.c === 200) {
                this.$message({
                  message: "添加成功",
                  type: "success"
                });
                this.newGatewayData = {
                  hardwareGatewayID: "",
                  gatewayName: "",
                  gatewayType: "",
                  city: "",
                  factory: "",
                  workshop: "",
                  gatewayState: "",
                  imageUrl: "",
                  remark: "",
                  department: "",
                  // 标签
                  inputVisible: false,
                  inputValue: "",
                  dynamicTags: ["标签一", "标签二", "标签三"]
                };
              }
              this.$emit("getGateways");
            } catch (e) {
              this.$emit("update:newFormVisible", false);
              this.$message.error("添加网关未成功");
            }
          } else {
            this.$emit("update:newFormVisible", false);
            this.$message.error("网关ID重复");
          }
        } else {
          console.log("error submit");
          return false;
        }
      });
    },
    async onAddCityClose() {
      this.city = (await getCityOptions()).data.d;
      this.getDeviceOptions();
    },
    async onAddGatewayTypeClose() {
      this.gatewayType = (await getGatewayType()).data.d;
    },
    async onAddFactoryClose() {
      this.getNewFactory(this.newGatewayData.city);
      this.getDeviceOptions();
    },
    async onAddWorkshopClose() {
      this.getNewWorkshop(this.newGatewayData.city, this.newGatewayData.factory);
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
    this.gatewayType = (await getGatewayType()).data.d;
    //newCityList and newFactoryList is because when creating new factory/new workshop, the id of the city and factory is needed, hence complete information is stored in these two arrays.
    // this.newCityList = (await getCity(1, "id", "asc", 0)).data.d;
    // this.newFactoryList = (await getFactory(1, "id", "asc", 0)).data.d;
  }
};
</script>