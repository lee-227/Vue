<template>
  <div class="alloc-menu">
    <el-card>
      <template #header>
        <div>
          <span>分配菜单</span>
        </div>
      </template>
      <el-tree
        ref="menu-tree"
        :data="menus"
        node-key="id"
        :props="defaultProps"
        :default-checked-keys="checkedKeys"
        show-checkbox
        default-expand-all
      ></el-tree>
      <div style="text-align: center">
        <el-button @click="resetChecked">清空</el-button>
        <el-button type="primary" @click="onSave">保存</el-button>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  getMenuNodeList,
  allocateRoleMenus,
  getRoleMenus,
} from "@/services/menu";
import { ElTree } from "element-plus";
import { getRoleById } from "@/services/role";

export default defineComponent({
  name: "AllocMenu",
  props: {
    roleId: {
      type: [String, Number],
      required: true,
    },
  },
  data() {
    return {
      menus: [],
      defaultProps: {
        children: "subMenuList",
        label: "name",
      },
      checkedKeys: [],
    };
  },

  async created() {
    await this.loadMenus();
    this.loadRoleMenus();
  },

  methods: {
    async loadRoleMenus() {
      const { data } = await getRoleMenus(this.roleId);
      this.getCheckedKeys(data.data);
    },

    getCheckedKeys(menus: any) {
      menus.forEach((menu: any) => {
        if (menu.selected) {
          // this.checkedKeys.push(menu.id as never)
          this.checkedKeys = [...this.checkedKeys, menu.id] as any;
        }
        if (menu.subMenuList) {
          this.getCheckedKeys(menu.subMenuList);
        }
      });
    },

    async loadMenus() {
      const { data } = await getMenuNodeList();
      this.menus = data.data;
    },

    async onSave() {
      const menuIdList = (
        this.$refs["menu-tree"] as typeof ElTree
      ).getCheckedKeys();
      // 拿到选中节点的数据 id 列表
      // 请求提交保存
      await allocateRoleMenus({
        roleId: this.roleId,
        menuIdList,
      });
      this.$message.success("操作成功");
      this.$router.back();
    },

    resetChecked() {
      (this.$refs["menu-tree"] as typeof ElTree).setCheckedKeys([]);
    },
  },
});
</script>

<style lang="scss" scoped></style>
