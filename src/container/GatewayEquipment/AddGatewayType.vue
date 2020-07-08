<template>
  <el-dialog
    title="新增网关类型"
    :visible.sync="visible"
    @close="$emit('update:typeAddVisible', false)"
    :typeAddVisible="typeAddVisible"
  >
    <el-form :model="typeTable" ref="typeTable">
      <el-form-item
        label="网关类型名"
        prop="type"
        label-width="120px"
        :rules="[{required: true, message: '网关类型不能为空'}]"
      >
        <el-input v-model="typeTable.type" autocomplete="off"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="$emit('update:typeAddVisible', false)">取 消</el-button>
      <el-button type="primary" @click="addType('typeTable')">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { createGatewayType, getGatewayType} from "../../api/api"
export default {
  name: "AddGatewayType",
  props: ["typeAddVisible"],
  data() {
    return {
      visible: this.typeAddVisible,
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
            const data = await createGatewayType(this.typeTable.type);
            this.$emit('update:typeAddVisible', false)
            if (data.data.d === "success") {
              this.$message({
                message: "添加成功",
                type: "success"
              });
              this.gatewayType = (await getGatewayType()).data.d;
            }
          } catch (e) {
            this.$emit('update:typeAddVisible', false)
            this.$message.error("网关类型添加失败");
          }
        }
      });
    }
  },
  watch: {
    typeAddVisible() {
      this.visible = this.typeAddVisible;
    }
  }
};
</script>>