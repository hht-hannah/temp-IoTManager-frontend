<template>
  <div>
    <el-dialog
      title="标签编辑"
      :visible.sync="visible"
      @close="$emit('update:tagEditVisible', false)"
      :tagEditVisible="tagEditVisible"
    >
      <div>
        <p>当前标签</p>
        <el-tag v-for="t in curTag" v-bind:key="t">{{t}}</el-tag>
      </div>
      <el-divider></el-divider>
      <div>
        <p>请选择标签</p>
        <el-select v-model="curTag" multiple placeholder="请选择标签">
          <el-option v-for="t in allTags" :key="t" :label="t" :value="t"></el-option>
        </el-select>
        <el-button type="primary" @click="newTagVisible = true">+</el-button>
      </div>
      <el-divider></el-divider>
      <div>
        <el-button @click="$emit('update:tagEditVisible', false)">取消</el-button>
        <el-button type="primary" @click="setDeviceTags">确认修改</el-button>
      </div>
    </el-dialog>
    <AddNewTag :newTagVisible.sync="newTagVisible" :onClose="onAddTagClose" :allTags="allTags"></AddNewTag>
  </div>
</template>

<script>
import { setDeviceTags, getAllTags, getDeviceTag } from "../../api/api";
import AddNewTag from "./AddNewTag";
export default {
  name: "EditTag",
  components: { AddNewTag },
  props: ["tagEditVisible", "curTagEdit"],
  data() {
    return {
      visible: this.tagEditVisible,
      newTagVisible: false,
      allTags: [],
      curTag: []
    };
  },
  methods: {
    async setDeviceTags() {
      try {
        const data = await setDeviceTags(this.curTagEdit, this.curTag);
        this.$emit("update:tagEditVisible", false);
        if (data.data.c === 200) {
          this.$message({
            message: "更新成功",
            type: "success"
          });
          this.$emit("getDevices");
        }
      } catch (e) {
        this.$emit("update:tagEditVisible", false);
        this.$message.error("标签更新未成功");
      }
    },
    async onAddTagClose() {
      this.allTags = (await getAllTags()).data.d;
    }
  },
  watch: {
    tagEditVisible() {
      this.visible = this.tagEditVisible;
    }
  },
  async mounted() {
    this.allTags = (await getAllTags()).data.d;
    this.curTag = (await getDeviceTag(this.curTagEdit)).data.d;
    console.log(this.curTag);
  }
};
</script>