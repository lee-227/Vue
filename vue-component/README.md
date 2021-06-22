## Monorepo 
- 一个代码仓库管理多个独立包的方式 例： vue3 源码 react源码
- 通过 yarn workspace 管理依赖
- 通过 Lerna 管理包的发布
  
### 目录
- 根目录下有一个文件夹（通常是 packages） 存放各自的包
- 根目录下一个 package.json 管理依赖

### yarn workspace 管理依赖
- 包之间的共同依赖会放置到根目录的node_modules中
- 包的单独依赖会防止当自己文件夹的node_modules中
- 在根目录的 package.json 中添加 "workspaces":["packages/*"] 开启工作区 "private":true 发布时禁止当前跟目录内容发布到npm
- yarn add module -D -W 给工作区根目录安装开发依赖
- yarn workspace [package.json 中的 name] add module 给某个工作区安装依赖
- yarn install 安装所有工作区的依赖 会将公用的依赖自动提升到根目录中

### Lerna 管理包的发布
- 优化使用 git 和 npm 管理包含多个包的仓库的工作流工具
- 管理具有多个包的JS项目
- 可以一键把代码提交到 git 和 npm上
- yarn global add lerna
- lerna init 初始化 
    1. 当前项目未被git管理会进行git的初始化 
    2. 在项目根目录创建 lerna.json 文件 
    3. 在package.json中添加开发依赖
- lerna publish 会发布到 git 上 同时发布到 npm 上

## StoryBook
- 可视化的组件展示平台
- 在独立的环境中创建组件
- 在隔离的环境中使用组件，以交互式的方式展示组件
- 支持的框架
  - React、React Native、Vue

## 安装测试依赖

```bash
yarn add jest @vue/test-utils vue-jest babel-jest -D -W
```

## Jest 的配置

jest.config.js

```js
module.exports = {
  "testMatch": ["**/__tests__/**/*.[jt]s?(x)"],
  "moduleFileExtensions": [
    "js",
    "json",
    // 告诉 Jest 处理 `*.vue` 文件
    "vue"
  ],
  "transform": {
    // 用 `vue-jest` 处理 `*.vue` 文件
    ".*\\.(vue)$": "vue-jest",
    // 用 `babel-jest` 处理 js
    ".*\\.(js)$": "babel-jest" 
  }
}
```

## Babel 的配置

babel.config.js

```js
module.exports = {
  presets: [
    [
      '@babel/preset-env'
    ]
  ]
}
```

## Babel 的桥接

```bash
yarn add babel-core@bridge -D -W
```

## 安装 Rollup 以及所需的插件

```bash
yarn add rollup rollup-plugin-terser rollup-plugin-vue@5.1.9 vue-template-compiler -D -W
```

## Rollup 配置文件

在 button 目录中创建 rollup.config.js

```js
import { terser } from 'rollup-plugin-terser'
import vue from 'rollup-plugin-vue'

module.exports = [
  {
    input: 'index.js',
    output: [
      {
        file: 'dist/index.js',
        format: 'es'
      }
    ],
    plugins: [
      vue({
        // Dynamically inject css as a <style> tag
        css: true, 
        // Explicitly convert template to render function
        compileTemplate: true
      }),
      terser()
    ]
  }
]
```

## 配置 build 脚本并运行

找到 button 包中的 package.json 的 scripts 配置
```js
"build": "rollup -c"
```

运行打包

```bash
yarn workspace lg-button run build
```

## 打包所有组件

### 安装依赖

```bash
yarn add @rollup/plugin-json rollup-plugin-postcss @rollup/plugin-node-resolve -D -W
```

### 配置文件

项目根目录创建 rollup.config.js

```js
import fs from 'fs'
import path from 'path'
import json from '@rollup/plugin-json'
import vue from 'rollup-plugin-vue'
import postcss from 'rollup-plugin-postcss'
import { terser } from 'rollup-plugin-terser'
import { nodeResolve } from '@rollup/plugin-node-resolve'

const isDev = process.env.NODE_ENV !== 'production'

// 公共插件配置
const plugins = [
  vue({
    // Dynamically inject css as a <style> tag
    css: true,
    // Explicitly convert template to render function
    compileTemplate: true
  }),
  json(),
  nodeResolve(),
  postcss({
    // 把 css 插入到 style 中
    // inject: true,
    // 把 css 放到和js同一目录
    extract: true
  })
]

// 如果不是开发环境，开启压缩
isDev || plugins.push(terser())

// packages 文件夹路径
const root = path.resolve(__dirname, 'packages')

module.exports = fs.readdirSync(root)
  // 过滤，只保留文件夹
  .filter(item => fs.statSync(path.resolve(root, item)).isDirectory())
  // 为每一个文件夹创建对应的配置
  .map(item => {
    const pkg = require(path.resolve(root, item, 'package.json'))
    return {
      input: path.resolve(root, item, 'index.js'),
      output: [
        {
          exports: 'auto',
          file: path.resolve(root, item, pkg.main),
          format: 'cjs'
        },
        {
          exports: 'auto',
          file: path.join(root, item, pkg.module),
          format: 'es'
        },
      ],
      plugins: plugins
    }
  })
```

### 在每一个包中设置 package.json 中的 main 和 module 字段

```js
"main": "dist/cjs/index.js",
"module": "dist/es/index.js"
```

### 根目录的 package.json 中配置 scripts

```js
"build": "rollup -c"
```