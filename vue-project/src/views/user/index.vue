<template>
  <div class="user">
    <user-list />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import UserList from "./components/UserList.vue";

export default defineComponent({
  name: "UserIndex",
  components: {
    UserList,
  },
});
</script>

<style lang="scss" scoped></style>
