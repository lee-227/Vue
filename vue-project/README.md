## VUE 项目中开启 TypeScript
1. 新项目 通过 vue/cli 创建带有 ts 支持的项目
2. 已有项目 使用 vue/cli 官网提供的 ts 插件
```
vue add @vue/typescript
```

## TS 介绍
### 依赖
1. vue-class-component 提供使用 Class 语法写 Vue 组件
2. vue-property-decorator 在 Class 语法基础上提供一些辅助装饰器
3. @typescript-eslint/eslint-plugin 使用 eslint 校验 typescripe 代码
4. @typescript-eslint/parser 将 ts 转为 ast 供 eslint 使用
5. @vue/cli-plugin-typescript 使用 ts + ts-loader + fork-ts-checker-webpack-plugin 进行更快的类型检查
6. @vue/eslint-config-typescript 兼容 eslint 的 ts 校验规则
7. typescript ts 的编译器 提供类型检查和转换 ts 的功能
