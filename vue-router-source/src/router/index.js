import Vue from 'vue'
import VueRouter from '@/vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/about',
    name: 'About',
    component: () =>
      import(/* webpackChunkName: "about" */ '../views/About.vue'),
    children: [
      {
        path: 'a',
        component: {
          // runtime-only / render方法
          render(h) {
            // js + html的语法
            return <h1>hello a</h1>
            //  return h('h1',null,'hello a')
          },
        },
      },
      {
        path: 'b',
        component: {
          render(h) {
            return <h1>hello b</h1>
          },
        },
      },
    ],
  },
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes,
})
router.beforeEach((from, to, next) => {
  console.log(from, to)
  next()
})
export default router
