<template>
  <div>
    <div>
      <h2>设备标签</h2>
    </div>
    <div v-if="checkTagAuth(['CONFIGURE_SYSTEM_RETRIEVE'])">
      <el-tag
        v-if="checkTagAuth(['CONFIGURE_SYSTEM_RETRIEVE'])"
        class="tag-container"
        v-for="tag in tags"
        :key="tag"
        closable
        @close="closeTag(tag)">
        {{tag}}
      </el-tag>
      <el-input
        class="input-new-tag"
        v-if="inputVisible"
        v-model="inputValue"
        ref="saveTagInput"
        size="small"
        @keyup.enter.native="addTag"
        @blur="addTag">
      </el-input>
      <el-button v-else class="button-new-tag" size="small" @click="showInput">+新标签</el-button>
    </div>
  </div>
</template>

<script>
  import {addTag, deleteTag, findTagAffiliation, getAllTags} from "../../api/api";
  import {checkAuth} from "../../common/util";

  export default {
    name: "TagConfig",
    data() {
      return {
        tags: [],
        inputVisible: false,
        inputValue: '',
      }
    },
    methods: {
      checkTagAuth(auth) {
        return checkAuth(auth);
      },
      async getTags() {
        this.tags = (await getAllTags()).data.d;
      },
      async addTag() {
        if (this.tags.indexOf(this.inputValue) === -1) {
          try {
            const data = await addTag(this.inputValue);
            this.inputVisible = false;
            if (data.data.c === 200) {
              this.$message({
                message: '更新成功',
                type: 'success'
              });
              this.inputValue = '';
              this.tags = (await getAllTags()).data.d;
            }
          } catch (e) {
            this.inputVisible = false;
            this.inputValue = '';
            this.$message.error('添加标签失败');
          }
        } else {
          this.inputVisible = false;
          this.inputValue = '';
          this.$message.error('标签名重复');
        }
      },
      async closeTag(tag) {
        const affiliation = (await findTagAffiliation(tag)).data.d;
        if (affiliation === 0) {
          try {
            this.$confirm('确认删除？')
              .then(async _ => {
                const data = await deleteTag(tag);
                if (data.data.c === 200) {
                  this.$message({
                    message: '删除成功',
                    type: 'success'
                  });
                  this.tags = (await getAllTags()).data.d;
                }
              });
          } catch (e) {
            console.log(e);
          }
        } else {
          this.$msgbox('该标签有' + affiliation + '个下属设备，无法被删除');
        }
      },
      showInput() {
        this.inputVisible = true;
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      }
    },
    async mounted() {
      this.getTags();
    }
  }
</script>

<style scoped>
  .tag-container {
    margin: 1% 1%;
    text-align: left;
  }

  .button-new-tag {
    margin: 1% 1%;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }

  .input-new-tag {
    width: 90px;
    margin: 1% 1%;
    vertical-align: bottom;
  }
</style>
