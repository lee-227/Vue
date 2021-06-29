<template>
  <div class="resource">
    <resource-list />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ResourceList from "./components/List.vue";

export default defineComponent({
  name: "ResourceIndex",
  components: {
    ResourceList,
  },
});
</script>

<style lang="scss" scoped></style>
