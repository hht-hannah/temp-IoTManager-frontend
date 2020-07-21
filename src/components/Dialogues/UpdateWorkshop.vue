<template>
  <el-dialog
    :title="'修改'+GLOBAL.thirdLevel"
    :visible.sync="visible"
    @close="$emit('update:workshopUpdateVisible', false)"
    :workshopUpdateVisible="workshopUpdateVisible"
  >
    <el-form :model="updateWorkshopData" ref="updateWorkshopData">
      <el-form-item
        :label="'所属'+GLOBAL.firstLevel"
        prop="city"
        label-width="120px"
        :rules="[{required: true, message: GLOBAL.firstLevel+'不能为空'}]"
      >
        <el-select
          v-model="updateWorkshopData.city"
          :placeholder="'选择'+GLOBAL.firstLevel"
          @change="getUpdateFactoryList(updateWorkshopData.city)"
        >
          <el-option v-for="c in updateCityList" :key="c.id" :label="c.cityName" :value="c.cityName"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        :label="'所属'+GLOBAL.secondLevel"
        prop="factory"
        label-width="120px"
        :rules="[{required: true, message: GLOBAL.secondLevel+'不能为空'}]"
      >
        <el-select v-model="updateWorkshopData.factory" :placeholder="'选择'+GLOBAL.secondLevel">
          <el-option v-for="c in updateFactoryList" :key="c.key" :label="c.value" :value="c.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        :label="GLOBAL.thirdLevel"
        prop="workshopName"
        label-width="120px"
        :rules="[{required: true, message: GLOBAL.thirdLevel+'不能为空'}]"
      >
        <el-input v-model="updateWorkshopData.workshopName" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="电话" label-width="120px">
        <el-input v-model="updateWorkshopData.workshopPhoneNumber" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="地址" label-width="120px">
        <el-input v-model="updateWorkshopData.workshopAddress" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="备注" label-width="120px">
        <el-input v-model="updateWorkshopData.remark" autocomplete="off"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="$emit('update:workshopUpdateVisible', false)">取 消</el-button>
      <el-button type="primary" @click="updateWorkshop('updateWorkshopData')">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getCity, getFactoryOptions, updateWorkshop } from "../../api/api";
export default {
  name: "UpdateWorkshop",
  props: ["workshopUpdateVisible", "onClose", "defaultData"],
  data() {
    return {
      updateCityList: [],
      updateFactoryList: [],
      visible: this.workshopUpdateVisible,
      updateWorkshopData: {
        workshopName: "",
        workshopPhoneNumber: "",
        workshopAddress: "",
        factory: "",
        city: "",
        remark: ""
      }
    };
  },
  methods: {
    async updateWorkshop(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          try {
            const data = await updateWorkshop(
              this.updateWorkshopData.id,
              this.updateWorkshopData
            );
            this.$emit("update:workshopUpdateVisible", false);
            if (data.data.c === 200) {
              this.$message({
                message: "更新成功",
                type: "success"
              });
              //再获取一次所有实验室信息
              this.onClose();
            }
          } catch (e) {
              console.log(e)
            this.$emit("update:workshopUpdateVisible", false);
            this.$message.error("更新实验室未成功");
          }
        }
      });
    },
    async getUpdateFactoryList(city) {
      if (city != "") {
        this.updateFactoryList = (await getFactoryOptions(city)).data.d;
      }
      if (this.updateFactoryList[0] != null) {
        this.updateWorkshopData.factory = this.updateFactoryList[0].value;
      } else {
        this.updateWorkshopData.factory = "";
        this.updateFactoryList = [];
      }
    }
  },
  watch: {
    workshopUpdateVisible() {
      this.visible = this.workshopUpdateVisible;
      this.updateWorkshopData = JSON.parse(
        JSON.stringify(this.$props.defaultData)
      );
    }
  },
  async mounted() {
    this.updateCityList = (await getCity(1, "id", "asc", 0)).data.d;
    this.updateFactoryList =  (await getFactoryOptions(this.updateCityList[0].cityName)).data.d
  }
};
</script>