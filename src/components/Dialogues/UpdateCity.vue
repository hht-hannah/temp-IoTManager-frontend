<template>
  <el-dialog
    :title="'修改'+GLOBAL.firstLevel"
    :visible.sync="visible"
    @close="$emit('update:cityUpdateVisible', false)"
    :cityUpdateVisible="cityUpdateVisible"
  >
    <el-form :model="updateCityData" ref="updateCityData">
      <el-form-item
        :label="GLOBAL.firstLevel"
        prop="cityName"
        label-width="120px"
        :rules="[{required: true, message:GLOBAL.firstLevel+ '不能为空'}]"
      >
        <el-input v-model="updateCityData.cityName" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="经度" label-width="120px" :rules="[{required: true, message: '经度不能为空'}]">
        <el-input v-model="updateCityData.longitude" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="纬度" label-width="120px" :rules="[{required: true, message: '纬度不能为空'}]">
        <el-input v-model="updateCityData.latitude" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="备注" label-width="120px">
        <el-input v-model="updateCityData.remark" autocomplete="off"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="$emit('update:cityUpdateVisible', false)">取 消</el-button>
      <el-button type="primary" @click="updateCity('updateCityData')">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { updateCityApi } from "../../api/api";
export default {
  name: "UpdateCity",
  props: ["cityUpdateVisible", "onClose", "defaultData"],
  data() {
    return {
      visible: this.cityUpdateVisible,
      updateCityData: {
        cityName: "",
        remark: "",
        createTime: "",
        updateTime: "",
        longitude: "",
        latitude: ""
      }
    };
  },
  methods: {
    async updateCity(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          try {
            const data = await updateCityApi(
              this.updateCityData.id,
              this.updateCityData
            );
            this.$emit("update:cityUpdateVisible", false);
            if (data.data.c === 200) {
              this.$message({
                message: "更新成功",
                type: "success"
              });
              //再获取一次所有城市信息
              this.onClose();
            }
          } catch (e) {
            this.$emit("update:cityUpdateVisible", false);
            this.$message.error("更新城市未成功");
          }
        }
      });
    }
  },
  watch: {
    cityUpdateVisible() {
      this.visible = this.cityUpdateVisible;
      this.updateCityData = JSON.parse(JSON.stringify(this.$props.defaultData));
    }
  }
};
</script>