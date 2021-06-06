import { parseHTML } from './parse'
import { generate } from './generate'

export function complieToFunction(template) {
  let ast = parseHTML(template) // 将 template 编译为 ast 语法树
  let code = generate(ast) // 根据 ast 语法书 生成 render 函数字符串
  let render = `with(this){return ${code}}`
  return new Function(render) // 生成最终 render 函数
}
