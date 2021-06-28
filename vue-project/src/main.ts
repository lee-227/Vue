import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import ElementPlus, { ElMessage, ElMessageBox } from "element-plus";
import "./styles/index.scss";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $message: typeof ElMessage;
    $store: typeof store;
    $confirm: typeof ElMessageBox.confirm;
  }
}

const app = createApp(App);
app.config.globalProperties.$store = store;
app.use(ElementPlus);
app.use(store);
app.use(router);
app.mount("#app");
