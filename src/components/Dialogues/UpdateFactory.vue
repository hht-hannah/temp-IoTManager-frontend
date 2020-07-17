<template>
  <el-dialog
    :title="'修改'+GLOBAL.secondLevel"
    :visible.sync="visible"
    @close="$emit('update:factoryUpdateVisible', false)"
    :factoryUpdateVisible="factoryUpdateVisible"
  >
    <el-form :model="updateFactoryData" ref="updateFactoryData">
      <el-form-item
        :label="'所属'+GLOBAL.firstLevel"
        prop="city"
        label-width="120px"
        :rules="[{required: true, message: GLOBAL.firstLevel+'不能为空'}]"
      >
        <el-select v-model="updateFactoryData.city" :placeholder="'选择'+GLOBAL.firstLevel">
          <el-option v-for="c in updateCityList" :key="c.id" :label="c.cityName" :value="c.cityName"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        :label="GLOBAL.secondLevel"
        prop="factoryName"
        label-width="120px"
        :rules="[{required: true, message: GLOBAL.secondLevel+'不能为空'}]"
      >
        <el-input v-model="updateFactoryData.factoryName" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="电话" label-width="120px">
        <el-input v-model="updateFactoryData.factoryPhoneNumber" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="地址" label-width="120px">
        <el-input v-model="updateFactoryData.factoryAddress" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="备注" label-width="120px">
        <el-input v-model="updateFactoryData.remark" autocomplete="off"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="$emit('update:factoryUpdateVisible', false)">取 消</el-button>
      <el-button type="primary" @click="updateFactory('updateFactoryData')">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getCity, updateFactory } from "../../api/api";
export default {
  name: "UpdateFactory",
  props: ["factoryUpdateVisible", "onClose", "defaultData"],
  data() {
    return {
      updateCityList: [],
      visible: this.factoryUpdateVisible,
      updateFactoryData: {
        factoryName: "",
        factoryPhoneNumber: "",
        factoryAddress: "",
        city: "",
        remark: ""
      }
    };
  },
  methods: {
    async updateFactory(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          try {
            const data = await updateFactory(
              this.updateFactoryData.id,
              this.updateFactoryData
            );
            this.$emit('update:factoryUpdateVisible', false)
            if (data.data.c === 200) {
              this.$message({
                message: "更新成功",
                type: "success"
              });
              //再获取一次所有实验楼信息
              this.onClose();
            }
          } catch (e) {
            this.$emit('update:factoryUpdateVisible', false)
            this.$message.error("更新实验楼未成功");
          }
        }
      });
    }
  },
  watch: {
    factoryUpdateVisible() {
      this.visible = this.factoryUpdateVisible;
      this.updateFactoryData = JSON.parse(JSON.stringify(this.$props.defaultData));
    }
  },
  async mounted() {
    this.updateCityList = (await getCity(1, "id", "asc", 0)).data.d;
  }
};
</script>