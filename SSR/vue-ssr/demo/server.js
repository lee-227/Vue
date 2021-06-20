const Vue = require('vue')
const fs = require('fs')
const Render = require('vue-server-renderer').createRenderer({
  template: fs.readFileSync('./index.template.html', 'utf-8')
})
const express = require('express')
const server = express()
server.get('/', (req, res) => {
  let vue = new Vue({
    template: `
    <div id='app'>{{ message }}</div>
    `,
    data: {
      message: 'lee'
    }
  })
  Render.renderToString(
    vue,
    {
      title: 'lee',
      meta: '<meta name="description" content="lee">'
    },
    (err, html) => {
      // res.setHeader('Content-Type', 'text/html;charset=utf8')
      res.send(html)
    }
  )
})
server.listen(3000, () => {
  console.log('success')
})
