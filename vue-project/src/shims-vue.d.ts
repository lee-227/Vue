declare module "*.vue" {
  import Vue from "vue";
  export default Vue;
}
// ts 无法识别以 .vue 结尾的模块
// 该文件为 .vue 结尾的模块做生命，声明他的类型为 Vue
