<template>
  <div id="app">
    <h3>{{message}}</h3>
    <input v-model="message" />
    <button @click="onClick"></button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: "lee"
    };
  },
  methods: {
    onClick() {
      console.log(1);
    }
  }
};
</script>

<style scoped>
</style>
