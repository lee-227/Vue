/**
 * 已登录禁止访问登录页中间件
 */
export default ({ store, redirect }) => {
  if (store.state.user) {
    return redirect('/')
  }
}
