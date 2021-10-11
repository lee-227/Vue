<template>
  <el-form ref="formRef" :model="model" v-bind="formConfig.form">
    <el-row>
      <el-col v-for="(item, index) in formItems" :key="index" :span="item.span">
        <el-form-item
          :label="item.label"
          :prop="item.prop"
          :rules="item.rules || []"
        >
          <template v-if="item.type === 'input'">
            <el-input
              v-model="model[item.prop]"
              v-bind="item.props || {}"
              v-on="item.props || {}"
              @input="(e) => change(e, item)"
            ></el-input>
          </template>
          <template v-if="item.type === 'select'">
            <el-select
              v-model="model[item.prop]"
              v-bind="item.props || {}"
              v-on="item.props || {}"
              @change="(e) => change(e, item)"
            >
              <el-option
                v-for="item in item.options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
                :disabled="item.disabled"
              >
              </el-option>
            </el-select>
          </template>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
  toRaw,
} from "vue";

export default defineComponent({
  name: "LeeForm",
  props: {
    formConfig: {
      type: Object,
      require: true,
      default: () => ({}),
    },
  },
  setup(props) {
    const model = reactive(props.formConfig.formModel);
    const formItems = reactive(
      props.formConfig.formItems.filter((i: any, index: number) => {
        if (i.ifRender !== undefined && typeof i.ifRender !== "function") {
          i._ifRender = i.ifRender;
          return i.ifRender;
        } else if (i.ifRender && typeof i.ifRender === "function") {
          let val = i.ifRender(model);
          if (val instanceof Promise) {
            val.then((val) => {
              if (val) {
                i._ifRender = val;
                formItems.splice(index, 0, i);
              }
            });
            return false;
          } else {
            i._ifRender = val;
            return val;
          }
        } else {
          return true;
        }
      })
    );
    const change = (e: any, item: any) => {
      props.formConfig.formItems.forEach((i: any, index: number) => {
        if (i.ifRender && typeof i.ifRender === "function") {
          let val = i.ifRender(model);
          if (val instanceof Promise) {
            val.then((val) => {
              if (!i._ifRender && val) {
                formItems.splice(index, 0, i);
              }
              if (!val && i._ifRender) {
                formItems.splice(index, 1);
              }
              i._ifRender = val;
            });
          } else {
            if (!i._ifRender && val) {
              formItems.splice(index, 0, i);
            }
            if (!val && i._ifRender) {
              formItems.splice(index, 1);
            }
            i._ifRender = val;
          }
        }
      });
    };
    const formRef = ref();
    let formMethod: any = {};
    onMounted(() => {
      formMethod.validate = formRef.value.validate;
    });
    return {
      model,
      formItems,
      change,
      formRef,
      formMethod,
    };
  },
});
</script>
<style lang="scss" scoped></style>
