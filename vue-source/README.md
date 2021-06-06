# Vue 源码学习

## 打包工具 Rollup
- Vue.js 源码的打包工具使用的是 Rollup，比 Webpack 轻量
- Webpack 把所有文件当做模块，Rollup 只处理 js 文件更适合在 Vue.js 这样的库中使用
- Rollup 打包不会生成冗余的代码

## 打包版本
- 完整版：同时包含编译器和运行时的版本。
- 编译器：用来将模板字符串编译成为 JavaScript 渲染函数的代码，体积大、效率低。
- 运行时：用来创建 Vue 实例、渲染并处理虚拟 DOM 等的代码，体积小、效率高。基本上就是除
去编译器的代码。

## Vue Cli
- 基于 Vue-CLI 创建的项目默认使用的是 vue.runtime.esm.js 运行时、ES Module版本
- 开发时的 *.vue 文件中的模板是在构建时预编译的，最终打包后的结果不需要编译器，只需要运行
时版本即可
