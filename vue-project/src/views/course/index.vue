<template>
  <div class="course">
    <course-list />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import CourseList from "./components/CourseList.vue";

export default defineComponent({
  name: "CourseIndex",
  components: {
    CourseList,
  },
});
</script>

<style lang="scss" scoped></style>
