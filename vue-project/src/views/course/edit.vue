<template>
  <div class="course-create">
    <create-or-update is-edit :course-id="courseId" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import CreateOrUpdate from "./components/CreateOrUpdate.vue";

export default defineComponent({
  name: "CourseEdit",
  props: {
    courseId: {
      type: [String, Number],
      required: true,
    },
  },
  components: {
    CreateOrUpdate,
  },
});
</script>

<style lang="scss" scoped>
</style>
