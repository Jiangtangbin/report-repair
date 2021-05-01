import Vue from 'vue';
import SvgIcon from '@/components/svg-icon/index.vue';

// 全局注册
Vue.component('svg-icon', SvgIcon);

const req: __WebpackModuleApi.RequireContext = require.context('./svg', false, /\.svg$/);
const req2: __WebpackModuleApi.RequireContext = require.context('./colours-svg', false, /\.svg$/);
const requireAll = (requireContext: __WebpackModuleApi.RequireContext) => requireContext.keys().map(requireContext);
requireAll(req);
requireAll(req2);