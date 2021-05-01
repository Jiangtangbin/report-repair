import Vue from 'vue';
import { i18n } from '@/locale/index';

/**
 * @description: bus 事件
 * on-details: 查看详情
 * on-update-result: 下发结果
 * on-alarm: 报警通知 -> websocket 触发
 * on-unalarm: 消警通知 -> websocket 触发
 * on-check: 巡检报警通知 -> websocket 触发
 * on-bind-wx: 微信绑定通知 -> websocket 触发
 * close-sound: 关闭火警提示音
 * socket-reconnect: socket 连接成功
 */
export default new Vue({
    i18n,
});