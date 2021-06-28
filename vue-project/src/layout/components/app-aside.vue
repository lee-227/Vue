<template>
  <div class="aside">
    <el-menu
      default-active="4"
      @open="handleOpen"
      @close="handleClose"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
      router
    >
      <el-submenu index="1">
        <template #title>
          <i class="el-icon-location"></i>
          <span>权限管理</span>
        </template>
        <el-menu-item index="/role">
          <i class="el-icon-setting"></i>
          <template #title>角色管理</template>
        </el-menu-item>
        <el-menu-item index="/menu">
          <i class="el-icon-setting"></i>
          <template #title>菜单管理</template>
        </el-menu-item>
        <el-menu-item index="/resource">
          <i class="el-icon-setting"></i>
          <template #title>资源管理</template>
        </el-menu-item>
      </el-submenu>
      <el-menu-item index="/course">
        <i class="el-icon-menu"></i>
        <template #title>课程管理</template>
      </el-menu-item>
      <el-menu-item index="/user">
        <i class="el-icon-document"></i>
        <template #title>用户管理</template>
      </el-menu-item>
      <el-submenu index="4">
        <template #title>
          <i class="el-icon-location"></i>
          <span>广告管理</span>
        </template>
        <el-menu-item index="/advert">
          <i class="el-icon-setting"></i>
          <template #title>广告列表</template>
        </el-menu-item>
        <el-menu-item index="/advert-space">
          <i class="el-icon-setting"></i>
          <template #title>广告位列</template>
        </el-menu-item>
      </el-submenu>
    </el-menu>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "AppAside",
  methods: {
    handleOpen(key: string, keyPath: string): void {
      console.log(key, keyPath);
    },

    handleClose(key: string, keyPath: string): void {
      console.log(key, keyPath);
    },
  },
});
</script>

<style lang="scss" scoped>
.aside {
  .el-menu {
    min-height: 100vh;
  }
}
</style>
