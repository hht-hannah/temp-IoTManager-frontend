<template>
  <el-dialog :title="'新增'+GLOBAL.thirdLevel" :visible.sync="workshopAddVisible">
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
        :label="'所属'+GLOBAL.secondLevel+'名'"
        prop="factory"
        label-width="120px"
        :rules="[{required: true, message: '所属'+ GLOBAL.secondLevel +'名不能为空'}]"
      >
        <el-select v-model="workshopTable.factory" placeholder="请选择">
          <el-option
            v-for="f in newFactoryList"
            :key="f.id"
            :label="f.factoryName"
            :value="f.factoryName"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="备注" label-width="120px">
        <el-input v-model="workshopTable.remark" autocomplete="off"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="workshopAddVisible = false">取 消</el-button>
      <el-button type="primary" @click="addWorkshop('workshopTable')">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "AddWorkshop",
  data() {
    return {
      workshopTable: {
        workshopName: "",
        workshopPhoneNumber: "",
        workshopAddress: "",
        remark: "",
        factory: ""
      }
    };
  },
  methods: {
    async addWorkshop(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          try {
            const data = await addWorkshop(this.workshopTable);
            this.workshopAddVisible = false;
            if (data.data.d === "success") {
              this.$message({
                message: "添加成功",
                type: "success"
              });
              this.workshop = (await getWorkshopOptions(
                this.workshopTable.city,
                this.workshopTable.factory
              )).data.d;
              this.getDeviceOptions();
            }
          } catch (e) {
            this.workshopAddVisible = false;
            this.$message.error("添加失败");
          }
        }
      });
    }
  }
};
</script>