import { init, h, styleModule, eventListenersModule } from 'snabbdom'
const patch = init([styleModule, eventListenersModule])
let vnode = h(
  'div#container.lee',
  {
    hook: {
      init(vnode) {
        console.log(vnode)
      },
      create(vnode1, vnode2) {
        console.log(vnode1, vnode2)
      }
    }
  },
  [
    h('p', { style: { color: 'red' } }, 'lee'),
    h(
      'h1',
      {
        on: {
          click: () => {
            console.log('click')
          }
        }
      },
      'lee'
    )
  ]
)
let app = document.getElementById('app')
let oldVnode = patch(app, vnode)
setTimeout(() => {
  patch(oldVnode, h('!'))
}, 3000)
