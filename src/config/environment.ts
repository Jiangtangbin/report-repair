// 当前环境变量
export const mode = process.env.VUE_APP_MODE || 'production';

// 项目名称 -> 中文
export const title = 'h.other.advertisingMachinePlatform';

// 是否显示语言切换组件
export const showLanguage = process.env.NODE_ENV === 'development';

// 获取免登录协议
export const getExemptionLoginAgreement = window.location.href.split('ak=')[1] ? window.location.href.split('ak=')[1].split('&')[0] : '';

// 是否自适应地图
export const autoViewport = [''].includes(mode);

// 百度地图版本
export const mapVersion = [''].includes(mode) ? '3.0' : '2.0';