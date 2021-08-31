import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export const createStore = () => {
  return new Vuex.Store({
    state: () => ({
      posts: [],
      home: [],
    }),

    mutations: {
      setPosts(state, data) {
        state.posts = data
      },
      setHome(state, data) {
        state.home = data
      },
    },

    actions: {
      // 在服务端渲染期间务必让 action 返回一个 Promise
      async getPosts({ commit }) {
        // return new Promise()
        const { data } = await axios.get('https://cnodejs.org/api/v1/topics')
        commit('setPosts', data.data)
      },
      async getHome({ commit }) {
        await new Promise((reslove) => {
          setTimeout(() => {
            commit('setHome', [1, 2, 3, 4, 5])
            reslove()
          }, 2000)
        })
      },
    },
  })
}
