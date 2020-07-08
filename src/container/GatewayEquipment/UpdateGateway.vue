<template>
    <el-dialog title="修改网关" :visible.sync="visible">
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
            @change="getUpdateWorkshop(updateData.factory)"
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
        <el-button @click="updateFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="update('updateData')">确 定</el-button>
      </div>
    </el-dialog>
</template>

<script>
export default {
  name: "UpdateGateway",
  props: ["updateFormVisible"],
  data() {
    return {
      visible: this.updateFormVisible,
      updateFactory: [],
      updateWorkshop: [],
      department: [],
      gatewayState: [],
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
    }
  },
  async update(formName) {
    this.$refs[formName].validate(async valid => {
      if (valid) {
        try {
          const data = await updateGatewayApi(this.updateData);
          this.updateFormVisible = false;
          if (data.data.c === 200) {
            this.$message({
              message: "更新成功",
              type: "success"
            });
            this.getGateways();
          }
        } catch (e) {
          this.updateFormVisible = false;
          this.$message.error("更新网关未成功");
        }
      } else {
        console.log("error input");
        return false;
      }
    });
  }
};
</script>