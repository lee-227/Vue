<template>
  <div>
    <h1>Home Page</h1>
    <ul>
      <li v-for="item in $store.state.home" :key="item">{{ item }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "HomePage",
  metaInfo: {
    title: "首页",
  },
  asyncData(store) {
    return store.dispatch("getHome");
  },
};
</script>

<style>
</style>
