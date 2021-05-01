import Vue from 'vue';
import store from './store/index';
import router from './router/index';

import axios from './axios/index';
import { Message, Notice, Modal } from 'view-design';
import { i18n } from '@/locale/index';

import * as ClickOutside from 'v-click-outside-x'; // 自定义指令
import vuePhotoview from 'vue-photo-preview'; // 图片预览组件.
import 'vue-photo-preview/dist/skin.css'; // 图片预览组件样式.
import vContextmenu from 'v-contextmenu'; // 右键点击菜单实现树.

import MyButton from '@/components/common/button.vue';
import MyModal from '@/components/common/modal.vue';
import Loading from '@/components/common/loading.vue';
import Scroll from '@/components/scroll/index.vue';
import App from './App.vue';

import './router/permission';
import './assets/icons/index';
import './components/register-dynamic/index';

import 'animate.css';
import 'view-design/dist/styles/iview.css';
import './assets/scss/common.scss';

const failImg = require('@/assets/images/load-fail.png');

Vue.config.productionTip = false;

Vue.prototype.$ajax = (api: string, params: any, args: any = {}) => axios(api, { params, ...args });
Vue.prototype.$Message = Message;
Vue.prototype.$Notice = Notice;
Vue.prototype.$Modal = Modal;
Vue.prototype.$IVIEW = {
    transfer: true,
    select: {},
    tree: {},
    cascader: {},
    cell: {},
    menu: {},
    colorPicker: {},
    datePicker: {},
    timePicker: {},
    tabs: {},
    modal: {
        maskClosable: true,
    },
};
// 图片加载失败后的方法
Vue.prototype.globalImgFail = function globalImgFail(event: Event) {
    event.target && ((event.target as HTMLImageElement).src = failImg);
};

Vue.component('MyButton', MyButton);
Vue.component('MyModal', MyModal);
Vue.component('Loading', Loading);
Vue.component('Scroll', Scroll);

Vue.use(ClickOutside);
Vue.use(vuePhotoview);
Vue.use(vContextmenu);

new Vue({
    i18n,
    router,
    store,
    render: h => h(App),
}).$mount('#app');