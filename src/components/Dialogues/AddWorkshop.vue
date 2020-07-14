<template>
  <el-dialog
    :title="'新增'+GLOBAL.thirdLevel"
    :visible.sync="visible"
    @close="$emit('update:workshopAddVisible', false)"
    :workshopAddVisible="workshopAddVisible"
  >
    <el-form :model="workshopTable" ref="workshopTable">
      <el-form-item
        :label="GLOBAL.thirdLevel+'名'"
        prop="workshopName"
        label-width="120px"
        :rules="[{required: true, message: GLOBAL.thirdLevel+'名不能为空'}]"
      >
        <el-input v-model="workshopTable.workshopName" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item :label="GLOBAL.thirdLevel+'电话'" label-width="120px">
        <el-input v-model="workshopTable.workshopPhoneNumber" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item :label="GLOBAL.thirdLevel+'地址'" label-width="120px">
        <el-input v-model="workshopTable.workshopAddress" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item
        :label="'所属'+GLOBAL.firstLevel+'名'"
        prop="city"
        label-width="120px"
        :rules="[{required: true, message: '所属'+ GLOBAL.firstLevel +'名不能为空'}]"
      >
        <el-select
          v-model="workshopTable.city"
          placeholder="请选择"
          @change="getNewFactory(workshopTable.city)"
        >
          <el-option v-for="c in newCityList" :key="c.id" :label="c.cityName" :value="c.cityName"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        :label="'所属'+GLOBAL.secondLevel+'名'"
        prop="factory"
        label-width="120px"
        :rules="[{required: true, message: '所属'+ GLOBAL.secondLevel +'名不能为空'}]"
      >
        <el-select v-model="workshopTable.factory" placeholder="请选择">
          <el-option
            v-for="f in newFactoryList"
            :key="f.value"
            :label="f.label"
            :value="f.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="备注" label-width="120px">
        <el-input v-model="workshopTable.remark" autocomplete="off"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="$emit('update:workshopAddVisible')">取 消</el-button>
      <el-button type="primary" @click="addWorkshop('workshopTable')">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { addWorkshop, getCity, getFactoryOptions } from "../../api/api";
export default {
  name: "AddWorkshop",
  props: ["workshopAddVisible", "onClose"],
  data() {
    return {
      visible: this.workshopAddVisible,
      newCityList: [],
      newFactoryList: [],
      workshopTable: {
        workshopName: "",
        workshopPhoneNumber: "",
        workshopAddress: "",
        remark: "",
        factory: "",
        city: ""
      }
    };
  },
  methods: {
    async addWorkshop(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          try {
            const data = await addWorkshop(this.workshopTable);
            this.$emit("update:workshopAddVisible", false);
            if (data.data.d === "success") {
              this.$message({
                message: "添加成功",
                type: "success"
              });
              this.$props.onClose();
            }
          } catch (e) {
            this.$emit("update:workshopAddVisible", false);
            this.$message.error("添加失败");
          }
        }
      });
    },
    async getNewFactory(city) {
      if (city != "") {
        this.newFactoryList = (await getFactoryOptions(city)).data.d;
        console.log(this.newFactoryList)
      }
      if (this.newFactoryList[0] != null) {
        this.workshopTable.factory = this.newFactoryList[0].value;
      } else {
        this.workshopTable.factory = "";
        this.newFactoryList = [];
      }
    }
  },
  watch: {
    workshopAddVisible() {
      this.visible = this.workshopAddVisible;
    }
  },
  async mounted() {
    this.newCityList = (await getCity(1, "id", "asc", 0)).data.d;
  }
};
</script>