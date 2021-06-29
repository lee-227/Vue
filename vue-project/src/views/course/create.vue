<template>
  <div class="course-create">
    <create-or-update />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import CreateOrUpdate from "./components/CreateOrUpdate.vue";

export default defineComponent({
  name: "CourseCreate",
  components: {
    CreateOrUpdate,
  },
});
</script>

<style lang="scss" scoped>
</style>
