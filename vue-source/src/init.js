import { initState } from "./state";
import { complieToFunction } from "./compiler/index";
import { callHook, mountComponent } from "./lifecycle";
import { mergeOptions, nextTick } from "./util";

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    vm.$options = mergeOptions(vm.constructor.options, options);
    callHook(vm, "beforeCreate");
    initState(vm);
    callHook(vm, "created");
    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  };
  Vue.prototype.$nextTick = nextTick;
  Vue.prototype.$mount = function (el) {
    el = document.querySelector(el);
    const vm = this;
    vm.$el = el;
    const options = vm.$options;
    if (!options.render) {
      let template = options.template;
      if (!template && el) {
        template = el.outerHTML;
      }
      const render = complieToFunction(template);
      options.render = render;
    }
    mountComponent(vm, el);
  };
}
