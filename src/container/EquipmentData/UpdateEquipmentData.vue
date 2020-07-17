<template>
  <el-dialog
    title="修改数据"
    :visible.sync="visible"
    @close="$emit('update:updateFormVisible', false)"
    :updateFormVisible="updateFormVisible"
  >
    <el-form :model="updateData">
      <el-form-item label="设备ID" label-width="120px">
        <el-input v-model="updateData.deviceId" disabled autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="属性名称" label-width="120px">
        <el-input v-model="updateData.indexName" disabled autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="属性ID" label-width="120px">
        <el-input v-model="updateData.indexId" disabled autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="属性类型" label-width="120px">
        <el-input v-model="updateData.indexType" disabled autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="值" label-width="120px">
        <el-input v-model="updateData.indexValue" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="单位" label-width="120px">
        <el-input v-model="updateData.indexUnit" disabled autocomplete="off"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="$emit('update:updateFormVisible', false)">取 消</el-button>
      <el-button type="primary" @click="update">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import {updateDeviceData} from "../../api/api"
export default {
  name: "UpdateEquipmentData",
  props: ["defaultData", "onClose", "updateFormVisible"],
  data() {
    return {
      visible: this.updateFormVisible,
      updateData: {
        deviceId: "",
        indexName: "",
        indexId: "",
        indexType: "",
        indexValue: "",
        indexUnit: ""
      }
    };
  },
  methods: {
    async update() {
      try {
        const data = await updateDeviceData(
          this.updateData.id,
          this.updateData
        );
        this.$emit('update:updateFormVisible', false)
        if (data.data.c === 200) {
          this.$message({
            message: "更新成功",
            type: "success"
          });
          this.onClose();
        }
      } catch (e) {
        this.$emit('update:updateFormVisible', false)
        this.$message.error("更新数据未成功");
      }
    }
  },
  watch: {
    updateFormVisible() {
      this.visible = this.updateFormVisible;
      this.updateData = JSON.parse(JSON.stringify(this.$props.defaultData));
    }
  }
};
</script>