<template>
  <div>
    <h1>About Page</h1>
    <h2>{{ name }}</h2>
  </div>
</template>

<script>
export default {
  name: "AboutPage",
  data: () => {
    return {
      name: "",
    };
  },
  metaInfo: {
    title: "关于",
  },
  asyncData(store) {},
  serverPrefetch() {
    this.name = "lee";
  },
};
</script>

<style>
</style>
