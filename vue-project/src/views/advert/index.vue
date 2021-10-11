<template>
  <LeeForm
    :formModel="formModel"
    :formConfig="formConfig"
    ref="leeForm"
  ></LeeForm>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from "vue";
import LeeForm from "@/components/Form/index.vue";

export default defineComponent({
  components: {
    LeeForm,
  },
  setup() {
    const formConfig = reactive({
      form: {
        labelPosition: "left",
        labelWidth: "80px",
      },
      formItems: [
        {
          label: "姓名",
          prop: "name",
          type: "input",
          span: 8,
          ifRender: true,
          rules: [
            {
              required: true,
              message: "Please input Activity name",
              trigger: "blur",
            },
            {
              min: 3,
              max: 5,
              message: "Length should be 3 to 5",
              trigger: "blur",
            },
          ],
          props: {
            placeholder: "请选择",
            input(e: any) {
              console.log(e);

              if (e === "lee123") {
                formConfig.formModel.select = "选项1";
              } else {
                formConfig.formModel.select = "";
              }
            },
          },
        },
        {
          label: "选项",
          prop: "select",
          type: "select",
          span: 8,
          rules: [
            {
              validator: (rule: any, value: any, callback: any) => {
                if (value === "") {
                  // callback(new Error("Please input the password again"));
                } else {
                  callback();
                }
              },
              trigger: "change",
            },
          ],
          options: (data: any) => {
            return [
              {
                value: "选项1",
                label: "黄金糕",
              },
              {
                value: "选项2",
                label: "双皮奶",
              },
              {
                value: "选项3",
                label: "蚵仔煎",
              },
              {
                value: "选项4",
                label: "龙须面",
              },
              {
                value: "选项5",
                label: "北京烤鸭",
              },
            ];
          },
          props: {
            disabled: false,
            style: "color:red",
            loading: false,
            filterable: true,
            remote: true,
            change(e: any) {
              if (e === "选项1") {
                formConfig.formModel.name = "lee123";
              } else {
                formConfig.formModel.name = "";
              }
            },
          },
        },
        {
          label: "姓别",
          prop: "mele",
          type: "input",
          span: 8,
          ifRender: async (data: any) => {
            return data.name === "lee123";
          },
        },
      ],
      formModel: {
        name: "lee",
        select: "",
      },
    });
    const leeForm = ref();
    onMounted(async () => {
      try {
        console.log(leeForm.value);

        let form = await leeForm.value.formMethod.validate();
        console.log(form);
      } catch (error) {
        console.log(error);
      }
    });
    return {
      formConfig,
      leeForm,
    };
  },
});
</script>
<style lang="scss" scoped></style>
