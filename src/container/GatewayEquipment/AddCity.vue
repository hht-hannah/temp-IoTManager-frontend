<template>
  <el-dialog
    :title="'新增'+GLOBAL.firstLevel"
    :visible.sync="visible"
    @close="$emit('update:cityAddVisible', false)"
    :cityAddVisible="cityAddVisible"
  >
    <el-form :model="cityTable" ref="cityTable">
      <el-form-item
        :label="GLOBAL.firstLevel+'名'"
        prop="cityName"
        label-width="120px"
        :rules="[{required: true, message: GLOBAL.firstLevel+'不能为空'}]"
      >
        <el-input v-model="cityTable.cityName" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="备注" label-width="120px">
        <el-input v-model="cityTable.remark" autocomplete="off"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="$emit('update:cityAddVisible', false)">取 消</el-button>
      <el-button type="primary" @click="addCity('cityTable')">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {addCity} from "../../api/api"
export default {
  name: "AddCity",
  props: ["cityAddVisible"],
  data() {
    return {
      visible: this.cityAddVisible,
      cityTable: {
        cityName: "",
        remark: ""
      }
    };
  },
  methods: {
    async addCity(formTable) {
      this.$refs[formTable].validate(async valid => {
        if (valid) {
          try {
            const data = await addCity(this.cityTable);
            this.$emit("update:cityAddVisible", false);
            if (data.data.d === "success") {
              this.$message({
                message: "添加成功",
                type: "success"
              });
              this.getDeviceOptions();
            }
          } catch (e) {
            this.$emit("update:cityAddVisible", false);
            this.$message.error("城市添加失败");
          }
        }
      });
    }
  },
  watch: {
    cityAddVisible() {
      this.visible = this.cityAddVisible;
    }
  }
};
</script>