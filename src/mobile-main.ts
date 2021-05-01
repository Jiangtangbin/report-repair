import Vue from 'vue';
import router from './router/mobile';

import './axios/index';
import './assets/icons/index';
import { Message } from 'view-design';
import { i18n } from '@/locale/index';

import vuePhotoview from 'vue-photo-preview'; // 图片预览组件.
import 'vue-photo-preview/dist/skin.css'; // 图片预览组件样式.

import MyButton from '@/components/common/button.vue';
import Loading from '@/components/common/loading.vue';
import MobileApp from './MobileApp.vue';

import 'view-design/dist/styles/iview.css';
import './assets/scss/common.scss';

const failImg = require('@/assets/images/load-fail.png');

Vue.config.productionTip = false;
Vue.prototype.$Message = Message;
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
Vue.component('Loading', Loading);

Vue.use(vuePhotoview);

new Vue({
    i18n,
    router,
    render: h => h(MobileApp),
}).$mount('#app');