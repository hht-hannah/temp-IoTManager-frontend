<template>
  <div>
    <br />
    <h3>清理数据库</h3>
    <div class="container">
    <el-form :inline="true" :model="setTime1" class="header">
      <el-form-item>
        <span>定时</span>
      </el-form-item>
      <el-form-item label="时间">
        <el-select v-model="setTime1" placeholder="请选择" @change="timeSet1">
          <el-option
            v-for="item in timeList1"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    </div>
    <div class="container">
      <el-form :inline="true" :model="setTime2" class="header">
        <el-form-item>
          <span>定期</span>
        </el-form-item>
        <el-form-item label="时间">
          <el-select v-model="setTime2" placeholder="请选择" @change="timeSet2">
            <el-option
              v-for="item in timeList2"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      </div>
    <br />

    <h3>压缩存储</h3>

  </div>
</template>

<script>
    export default {
      name: "DatabaseConfig",
      data() {
        return {
          setTime1: '',
          timeList1: [{
            value: '选项1',
            label: '无'
          }, {
            value: '选项2',
            label: '一个月'
          }, {
            value: '选项3',
            label: '三个月'
          }, {
            value: '选项4',
            label: '六个月'
          }, {
            value: '选项5',
            label: '一年'
          }],
          setTime2: '',
          timeList2: [{
            value: '选项1',
            label: '无'
          }, {
            value: '选项2',
            label: '月底'
          }, {
            value: '选项3',
            label: '季度底'
          }, {
            value: '选项4',
            label: '年底'
          }],

        }
      },
      methods: {
        async timeSet1(){

        },
        async timeSet2(){

        },

      },
      async mounted() {

      }
    }
</script>

<style scoped>
  h3{
    margin: 1% 1%;
    text-align: left;
  }
  .container {
    margin: 1% 5%;
    text-align: left;
  }

</style>
