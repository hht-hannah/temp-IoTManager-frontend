<template>
  <el-dialog
    title="新增设备类型"
    :visible.sync="visible"
    @close="$emit('update:deviceTypeAddVisible', false)"
    :deviceTypeAddVisible="deviceTypeAddVisible"
  >
    <el-form :model="typeTable" ref="typeTable">
      <el-form-item
        label="设备类型名"
        prop="type"
        label-width="120px"
        :rules="[{required: true, message: '设备类型不能为空'}]"
      >
        <el-input v-model="typeTable.type" autocomplete="off"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="$emit('update:deviceTypeAddVisible', false)">取 消</el-button>
      <el-button type="primary" @click="addType('typeTable')">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { createDeviceType } from "../../api/api";
export default {
  name: "AddDeviceType",
  props: ["deviceTypeAddVisible", "onClose"],
  data() {
    return {
      visible: this.deviceTypeAddVisible,
      typeTable: {
        type: ""
      }
    };
  },
  methods: {
    async addType(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          try {
            const data = await createDeviceType(this.typeTable.type);
            this.$emit("update:deviceTypeAddVisible", false);
            if (data.data.d === "success") {
              this.$message({
                message: "添加成功",
                type: "success"
              });
            }
            this.$props.onClose();
          } catch (e) {
            this.$emit("update:deviceTypeAddVisible", false);
            this.$message.error("设备类型添加失败");
          }
        }
      });
    }
  },
  watch: {
    deviceTypeAddVisible() {
      this.visible = this.deviceTypeAddVisible;
    }
  }
};
</script>