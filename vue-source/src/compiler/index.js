import { parseHTML } from './parse'
import { generate } from './generate'

export function complieToFunction(template) {
  let ast = parseHTML(template)
  let code = generate(ast)
  let render = `with(this){return ${code}}`
  return new Function(render)
}
