const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`) // 标签开头的正则 捕获的内容是标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`) // 匹配标签结尾的 </div>
const attribute =
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/ // 匹配属性的
const startTagClose = /^\s*(\/?)>/ // 匹配标签结束的 >

export function parseHTML(html) {
  function createASTElement(tag, attrs) {
    return {
      tag,
      type: 1,
      children: [],
      attrs,
      parent: null
    }
  }
  let root = null
  let currentParent
  let stack = []
  function start(tagName, attrs) {
    let element = createASTElement(tagName, attrs)
    if (!root) root = element
    currentParent = element // 每匹配到一个开始标签 当前的父元素标记为当前开始标签
    stack.push(element) // 使用一个栈来保存剩余未匹配元素的父节点
  }
  function chars(text) {
    // 处理文本节点 将文本标记为当前父节点的子节点
    text = text.replace(/\s/g, '')
    if (text) {
      currentParent.children.push({
        type: 3,
        text
      })
    }
  }
  function end() {
    let element = stack.pop()
    currentParent = stack[stack.length - 1]
    // 标签结束时 将当前的父节点标记为栈中最后一个节点
    if (currentParent) {
      // 添加父子依赖关系
      element.parent = currentParent
      currentParent.children.push(element)
    }
  }
  function advance(n) {
    html = html.slice(n)
  }
  function parseStartTag() {
    const start = html.match(startTagOpen)
    // 匹配到开始标签
    if (start) {
      let match = {
        tagName: start[1], // 捕获到标签名
        attrs: []
      }
      advance(start[0].length) // HTML中删除开始标签
      let end, attr
      // 循环匹配属性 直到匹配到开始标签的结束标签 >
      while (
        !(end = html.match(startTagClose)) &&
        (attr = html.match(attribute))
      ) {
        // 将匹配到的属性添加到 attrs 中
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5] || true
        })
        advance(attr[0].length) // html中删除匹配到的属性
      }
      if (end) {
        // 开始标签匹配完毕 删除剩余开始标签
        advance(end[0].length)
        return match
      }
    }
  }
  while (html) {
    let textEnd = html.indexOf('<')
    if (textEnd === 0) {
      let startTagMatch = parseStartTag()
      if (startTagMatch) {
        // 根据开始标签匹配到的标签名跟属性 生成 ast 语法书
        start(startTagMatch.tagName, startTagMatch.attrs)
        continue
      }
      let endTagMatch = html.match(endTag) // 匹配结束标签
      if (endTagMatch) {
        advance(endTagMatch[0].length) // html删除结束标签
        end(endTagMatch[1]) // 处理节点父子关系
        continue
      }
    }
    let text
    if (textEnd > 0) {
      text = html.slice(0, textEnd) // 截取文本
    }
    if (text) {
      advance(text.length) // html中删除文本
      chars(text) // 处理文本节点
    }
  }
  return root // 最终返回由 html 编译出来的一个 ast 语法书
}
