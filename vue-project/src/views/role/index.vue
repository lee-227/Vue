<template>
  <div class="role">
    <role-list />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import RoleList from "./components/List.vue";

export default defineComponent({
  name: "RoleIndex",
  components: {
    RoleList,
  },
});
</script>

<style lang="scss" scoped></style>
