<template>
  <el-dialog
    :title="'新增' + GLOBAL.secondLevel"
    :visible.sync="visible"
    @close="$emit('update:factoryAddVisible', false)"
    :factoryAddVisible="factoryAddVisible"
  >
    <el-form :model="factoryTable" ref="factoryTable">
      <el-form-item
        :label="GLOBAL.secondLevel+'名'"
        prop="factoryName"
        label-width="120px"
        :rules="[{required: true, message: GLOBAL.secondLevel+'名不能为空'}]"
      >
        <el-input v-model="factoryTable.factoryName" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item :label="GLOBAL.secondLevel+'电话'" label-width="120px">
        <el-input v-model="factoryTable.factoryPhoneNumber" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item :label="GLOBAL.secondLevel+'地址'" label-width="120px">
        <el-input v-model="factoryTable.factoryAddress" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item
        :label="'所属'+GLOBAL.firstLevel"
        prop="city"
        label-width="120px"
        :rules="[{required: true, message: '所属'+GLOBAL.firstLevel+'不能为空'}]"
      >
        <el-select v-model="factoryTable.city" placeholder="请选择">
          <el-option v-for="c in newCityList" :key="c.id" :label="c.cityName" :value="c.cityName"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="备注" label-width="120px">
        <el-input v-model="factoryTable.remark" autocomplete="off"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="$emit('update:factoryAddVisible', false)">取 消</el-button>
      <el-button type="primary" @click="addFactory('factoryTable')">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
//use this line to add the dialogue to the page： 
//<AddFactory :factoryAddVisible.sync="factoryAddVisible" :onClose="onChangeFactoryClose"></AddFactory>
import { addFactory, getCity } from "../../api/api";
export default {
  name: "AddFactory",
  props: ["factoryAddVisible", "onClose"],
  data() {
    return {
      newCityList: [],
      visible: this.factoryAddVisible,
      factoryTable: {
        factoryName: "",
        factoryPhoneNumber: "",
        factoryAddress: "",
        remark: "",
        city: ""
      }
    };
  },
  methods: {
    async addFactory(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          try {
            const data = await addFactory(this.factoryTable);
            this.$emit("update:factoryAddVisible", false);
            if (data.data.d === "success") {
              this.$message({
                message: "添加成功",
                type: "success"
              });
            }
            this.newCityList = (await getCity(1, "id", "asc", 0)).data.d;
            this.$props.onClose();
          } catch (e) {
            this.$emit("update:factoryAddVisible", false);
            this.$message.error("添加失败");
          }
        }
      });
    }
  },
  watch: {
    factoryAddVisible() {
      this.visible = this.factoryAddVisible;
    }
  },
  async mounted() {
    this.newCityList = (await getCity(1, "id", "asc", 0)).data.d;
  }
};
</script>