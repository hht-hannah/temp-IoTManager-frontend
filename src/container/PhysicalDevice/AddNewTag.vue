<template>
  <div>
    <el-dialog
      title="新增标签"
      :visible.sync="visible"
      @close="$emit('update:newTagVisible', false)"
      :newTagVisible="newTagVisible"
    >
      <div>
        <p>新标签名</p>
        <el-input v-model="newTagName" placeholder="请输入新标签名"></el-input>
      </div>
      <el-divider></el-divider>
      <div>
        <el-button @click="$emit('update:newTagVisible', false)">取消</el-button>
        <el-button type="primary" @click="addTag">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { addTag } from "../../api/api";
export default {
  name: "AddNewTag",
  props: ["newTagVisible", "allTags", "onClose"],
  data() {
    return {
      visible: this.newTagVisible,
      newTagName: ""
    };
  },
  methods: {
    async addTag() {
      if (this.allTags.indexOf(this.newTagName) === -1) {
        try {
          const data = await addTag(this.newTagName);
          this.$emit('update:newTagVisible', false)
          if (data.data.c === 200) {
            this.$message({
              message: "更新成功",
              type: "success"
            });
            this.newTagName = "";
            this.$props.onClose();
          }
        } catch (e) {
          this.$emit('update:newTagVisible', false)
          this.newTagName = "";
          this.$message.error("添加标签失败");
        }
      } else {
        this.$emit('update:newTagVisible', false)
        this.newTagName = "";
        this.$message.error("标签名重复");
      }
    }
  },
  watch: {
    newTagVisible() {
      this.visible = this.newTagVisible;
    }
  }
};
</script>