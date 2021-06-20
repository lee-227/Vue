## Vue 初始化
1. 在 entry-runtime-with-comipiler 文件中重写 $mount 方法 为其添加模板编译的功能
   1. 判断 options中 是否存在 render 方法 存在 render 则直接使用该 render 函数
   2. 不存在 render 判断是否有 template 将 template 作为模板
   3. 再判断是否有 el 获取 el 对应的 outerHTML 作为template 模板
   4. 将 template 通过 compileToFunctions 编译为 render 函数
2. 在 runtime/index.js 中初始化 vue 的环境配置
   1. 在 Vue 构造函数 config 属性上添加一些工具函数，帮助判断标签，属性等
      1. mustUseProp 属性绑定标签的判断函数，比如 value 属性需要用在 input 等标签上
      2. isReservedTag 判断是否是浏览器原生标签
      3. isReservedAttr 判断是否是浏览器原生 dom 属性 style,class
      4. getTagNamespace 标签 tag 是 svg 标签 返回 svg 字符串 标签 tag === math 返回 math
      5. isUnknownElement 判断是不是未知标签
   2. 注册 v-model v-show 指令 赋值给 Vue.options.directives **TODO**
   3. 注册 transition transition-group 组件 赋值给 Vue.options.components **TODO**
   4. 根据运行平台为 Vue.prototype 添加 __patch__ 方法
   5. 实现 $mount 方法 实际调用了 core/instance/lifecycle 中的 mountComponent 方法 实现挂载
3. core/index.js 初始化全局API
   1. 初始化 Vue.config 静态对象
   2. 初始化 Vue.util 静态工具方法 mergeOptions defineReactive 等
      1. warn 开发环境下 打印报警日志
      2. extend 将第二个对象属性依次赋值给第一个对象
      3. mergeOptions 合并两个 option 采取了策略模式
         1. hooks 的合并是将两个 option 中的 hooks 合并成了一个数组 mounted:[parentHook,childHook]
         2. component directive filter props methods inject computed 合并的方式 是以父对象为原型创建了一个新对象 将子对象依次赋值给新对象
         3. watch 合并 类似于 hook 合并为一个数组
      4. defineReactive 定义一个响应式属性
   3. 添加 Vue.set Vue.delete Vue.nextTick 静态方法
      1. set 可以为对象或者数组添加一个响应式对象 数组使用 splice 实现响应式 对象 使用 defineReactive 定义属性 手动执行 dep.notify 通知更新
      2. del 响应式删除属性 数组属性 通过 splice 删除 对象属性 删除属性 通过对象的dep.notify 手动通知
      3. nextTick 
         1. 声明一个 pending 为 false
         2. 调用 nextTick 将传入的 cb 存入回调函数队列
         3. 判断 pending 是否为 true
         4. 为 true 说明正在调用中，不再执行后续操作
         5. 为 false 时调用 timerFunc 并将 pending 标记为 true 
         6. 根据平台 降级处理 判断使用那种异步方式清空队列
            1. 首先是 Promise.then
            2. MutationObserver
            3. setImmediate
            4. setTimeout
         7. 清空回调函数队列 并将 pending 标记为 false 等待下一次清空
   4. 添加 Vue.observable 静态方法 添加一个响应式的对象 内部调用 observe 方法进行数据劫持
   5. 添加 Vue.component Vue.directive Vue.filter 静态方法
   6. 添加 Vue.options 静态属性
      1. 给 options 添加全局 keep-alive 组件 **TODO**
      2. 初始化 components directives filters
   7. 添加 Vue.use 静态方法 加载插件 调用插件install方法或者插件本身就是一个函数 缓存插件 防止重复安装
   8. 添加 Vue.mixin 混入方法 调用 mergeOptions 将传入的对象合并到 option 中
   9. 添加 Vue.extend 返回组件构造函数方法 **TODO**
4. core/instance/index.js 实现 Vue 构造函数 调用 init 方法
   1. 调用 initMixin 为原型添加 _init 方法
   2. 调用 stateMixin 为原型添加 $data $props $set $delete $watch 方法
      1. Vue.prototype.$data 返回 vm._data
      2. Vue.prototype.$props 返回 vm._props
      3. Vue.prototype.$set 跟 Vue.set 一致
      4. Vue.prototype.$delete 跟 Vue.delete 一致
      5. Vue.prototype.$watch 
         1. 创建一个用户 watcher 该 watcher 拥有 user 标记属性
   3. 调用 eventsMixin 为原型 Vue.prototype 添加 $on $once $off $emit 事件方法
   4. 调用 lifecycleMixin 为原型添加 _update $forceUpdate $destroy
      1. _update 会调用 __patch__ 方法将虚拟dom 渲染成真实dom 首次渲染会调用，更新时也会调用
      2. $forceUpdate 调用 vm._watcher.update()
   5. 调用 renderMixin 为原型添加 $nextTick _render
      1. installRenderHelpers 添加 render 函数中将 ast 生成 Vnode 的函数 _v _s 等
      2. _render 方法会获取最终用户传入的render 或者 由模板编译来的render方法执行 生成虚拟dom
      3. 为原型添加在 render 函数中所使用的工具方法 用于生成不同的虚拟dom


## Vue 首次渲染的过程
1. new Vue 时会调用 _init 方法初始化实例
   1. 将初始化的 options 跟传入的 options 进行合并
   2. initLifecycle 初始化 $children/$parent/$root/$refs 变量
      1. 建立组件间的父子依赖图
      2. 设置标记属性作为某个阶段的标识
   3. initEvents 初始化 _events 变量 将父组件传递的函数绑定到该组件的$on上
   4. 调用 initRender 方法 初始化 
      1. 初始化 $slots $scopedSlots 
      2. _c 处理编译生成的 render 函数 $createElement 处理手写的 render 函数 
      3. 定义 $attrs $listeners 属性
   5. 触发 beforeCreate 钩子
   6. 调用 initInjections 将 inject 注入的属性响应式的添加到 vm 上
   7. 调用 initState 初始化 props methods data computed watch
      1. initProps 将传入的 prop 依次响应式的定义到 vm._props 上 将每个prop 代理到 vm._props 上取值
      2. initMethods 将每个 method 定义到 vm 上 并通过 bind 重新绑定 this 为当前 vm 实例
      3. initData 数据劫持
      4. initComputed 初始化 vm._computedWatchers 用于保存该实例的所有计算属性watcher 遍历每个属性创建watcher 在 vm 上添加改属性 ，取值时在_computedWatchers获取对应的watcher 获取对应的值
      5. initWatch 遍历每个watch 依次调用 vm.$watch 方法
   8. 调用 initProvide 将 provide 存储到 vm._provided 上供子组件使用
   9.  触发 created 钩子
   10. 判断是否有 vm.$options.el 有的话调用 vm.$mount(vm.$options.el) 进行挂载 实际调用 mountComponent 方法
   11. 触发 beforeMount 钩子 开始挂载
   12. 创建 updateComponent 回调函数 
   13. 创建渲染 Watcher 传入 updateComponent 方法
   14. 调用 updateComponent 该函数会先执行 render 生成虚拟dom 然后调用 _update 将虚拟dom 生成真实dom
   15. render 执行流程
       1. render 函数 内部是许多的工具函数调用 _c _s _v等 用于生产虚拟 dom
   16. _update 实际调用 patch 方法进行 dom diff 生产真实节点
   17. 触发 mounted 钩子 渲染结束

## Vue 响应式原理
- Dep 构造函数 该函数功能为负责收集依赖 通知各个依赖更新

1. 数据劫持 在 initState 时 会对我们传入的 data 进行数据劫持
   1. 将 data 赋值给实例的 _data 属性，为 data 中的每个属性做代理，在 vm 中取值时会到 _data 上取
   2. 调用 observe 对 data 进行拦截
   3. 判断传入的 data 是否为对象 不是对象不做任何处理
   4. 是对象则 new Observer 拦截
   5. 为实例创建 dep 对象 收集该对象的依赖 给 set 方法还有数组使用
   6. 定义 __ob__ 属性 值为该对象自己 标记为已经做过拦截的对象
   7. 如果是数组 重写数组的原型对象 遍历元素 对元素调用 observe 进行拦截
      1. 重写了 push pop shift unshift reverse splice sort 这7个方法，该方法会改变原数组。
      2. 拦截 push unshift splice 添加的数据，对这些数据进行拦截
      3. 触发该数组的 __ob__ 对象的 dep 的 notify 发送通知
   8. 如果是对象，调用 walk 方法遍历对象，对对象的每个属性进行劫持
   9. 调用 defineReactive 为每个属性创建 dep 收集属性依赖同时拦截属性的 get set 操作
   10. 内部调用 Object.defineProperty 方法
   11. get 取值时 该属性跟该对象的 dep 会将 Dep.target (当前取值的 watcher) 作为依赖收集 如果此时的值是数组 遍历数组 让数组中的对象收集依赖
   12. set 修改值时 会调用该属性的 dep 的 notify 方法通知 watcher 更新 同时调用 observe 将新赋值的对象进行数据劫持操作


2. Watcher 分为 渲染watcher 用户watcher 技术属性watcher 三种
   1. wacther 会进行取值操作，取值之前会将 Dep.target 赋值为自己
   2. 然后进行取值，触发 get 该属性的 dep 会收集该依赖，当该属性被修改时会通知该 watcher 进行更新

## Vue 中模板编译的过程
1. vue 通过 compileToFunctions 该函数编译模板 生成 render 函数
2. compileToFunctions 由 createCompiler 函数生成 该函数是高阶函数 此时会传入 baseOptions 与平台相关的一些工具方法
3. createCompiler 由 createCompilerCreator 函数生成 该函数是高阶函数 此时会传入 baseCompile 核心编译方法
4. 当我们调用 createCompiler 时 会通过传入的 baseOptions 跟 baseCompile 生成最终的 compileToFunctions 函数
5. 调用 compileToFunctions 进行编译时 核心过程
   1. 先将传入的 template 转换成抽象语法树 原理不断截取 template 字符串 匹配标签头，标签中的属性，生成父子依赖，最终生成一颗表示html的抽象语法树
   2. 优化生成的抽象语法树 主要是标记静态节点 既不会发生变化的节点，进行更新时 domdiff 会跳过这些节点 提高性能。
   3. 将优化后的抽象语法树 生成字符串形式的代码 
      1. 递归 ast 语法树 根据不同的节点使用不同的函数进行包裹生成一段一段字符串代码，将字符串拼接
      2. 最终生成的字符串代码在使用 with 进行包裹 传入 this 对象生成最终的字符串代码
   4. 使用 new Function 传入字符串代码 生成最终的 render 函数


## 组件的渲染流程
1. 在生成虚拟dom时会通过判断tag是否浏览器原生标签，不是当做组件处理，调用createComponent
2. 通过 tag 在 components 中找到对应的组件定义
3. 通过 Vue.extend方法创造一个子组件的构造函数
4. 在该组件添加 init 钩子函数
5. 生成组件的虚拟dom
6. 在调用 patch 将虚拟 dom 生成真实dom时
7. 在组件的虚拟 dom 中获取到 init 钩子函数并调用
   1. init 函数会调用该组件的构造函数生成组件实例并挂载到改Vnode上
   2. 调用实例的 $mount 方法 生成真实dom 此时不进行挂载
8. 将生成的真实dom插入到父元素中