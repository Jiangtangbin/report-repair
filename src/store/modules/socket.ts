
/// <reference path="../../interface/socket.ts" />

import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { i18n } from '@/locale/index';
import Vue from 'vue';
import bus from '@/utils/bus';

export interface ISocket {
    port: number;
    token: string;
    notices: [];
    checktasks: GlobalSocket.CheckTask[];
    worktask: GlobalSocket.WorkTask[];
}

const instance = new Vue({ i18n });

@Module({ name: 'socket', namespaced: true })
class Socket extends VuexModule implements ISocket {
    // state 状态
    public port = 0;
    public token = "";
    public notices = ([] as ISocket['notices']);
    public checktasks = ([] as ISocket['checktasks']);
    public worktask = ([] as ISocket['worktask']);

    /**
     * @description: 修改 state 属性
     * @param {Object} IRoot: 参考 IRoot 声明
     */
    @Mutation
    alterState<K extends keyof ISocket>({ key, value }: IAlterState<ISocket, K>) {
        if (this.hasOwnProperty(key)) {
            (this[key] as ISocket[K]) = value;
        }
    }
    /**
     * @description: 用户上下线
     * @param {Object} data: 上下线的设备信息 {uuid, t}
     */
    @Mutation
    userIsOnline(data: { uuid: string; t: 'on' | 'off' }) {
        data || console.log(data);
    }
    /**
     * 接收到新通知
     * @param {Object} data: 新的通知信息{t, title, content, time}
     */
    @Mutation
    newNotice(data: { t: string, title: string; content: string; time: string; }) {
        console.log('接收到新通知', this.notices, data);
    }
    /**
     * 为指定类型增加信息
     * @param {Object} data: 报警的设备信息 checks: {t, title, content, time} || checktypes: {t, name, checktime, id}
     * @param {String} types: 操作的类型
     */
    @Mutation
    addCheck({ data, t }: { data: GlobalSocket.CheckTask | GlobalSocket.WorkTask, t: string }) {
        data.isread = 0;
        this[t as 'checktasks'].unshift(data as GlobalSocket.CheckTask);
    }

    @Action
    newMessage({ t, p }: GlobalSocket.Info) {
        console.log(t, p);
        // 用户大类
        switch (t) {
            case 'account_disable':
            case 'org_delete':
            case 'password_modify':
                // 账号停用，收到该消息，提示您的账号已被停用，然后断开 socket，返回登录页面
                // 客户删除，收到该消息，提示您所属客户已被删除，然后断开 socket，返回登录页面
                t === 'account_disable' && console.log('收到账号停用消息', t, p);
                t === 'org_delete' && console.log('收到客户删除消息', t, p);
                t === 'password_modify' && console.log('收到密码修改消息', t, p);
                this.context.commit('app/alterState', { key: 'isLogin', value: false }, { root: true });
                this.context.commit('user/alterState', { key: 'token', value: '' }, { root: true });
                instance.$Modal.info({
                    title: t === 'account_disable' ? i18n.t('h.tips.accountAlreadyStopusing') as string : t === 'password_modify' ? i18n.t('h.tips.accountPasswordModified') as string : i18n.t('h.tips.customersDelete') as string,
                    onOk: () => this.context.dispatch('sign/resetState', '', { root: true }).then(() => window.location.reload()),
                });
                break;
            case 'bindwx_reply':
                console.log('收到绑定微信结果消息', t, p);
                const { openid } = p as GlobalSocket.Scan;
                bus.$emit('on-bind-wx', openid);
                // 绑定微信结果，这里做失败的提示
                // p: {
                //     status: true 或 false,
                //     msg: 失败原因,
                //     data: {
                //         // 绑定的微信账号信息
                //     }
                // }
                break;
            case 'new_notice':
                console.log('收到新通知公告消息', t, p);
                // 新通知公告
                // p: {
                //     id: id,
                //     title: 公告标题
                // }
                break;
            case 'new_work':
                console.log('收到新通知工单消息', t, p);
                instance.$getDynamicComponent('workNewNotice', () => {
                    (instance.$createWorkNewNoticeHandle({
                        stepType: t,
                        data: p,
                        $events: {
                            success: 'refresh',
                        },
                    }) as any).show();
                });
                // 新通知工单
                // p: {
                //     id: 工单 id,
                //     step: 步骤,
                //     work_code: 工单号,
                //     org_name: 所属客户,
                //     link_man: 联系人,
                //     link_mobile: 联系电话,
                //     work_type_name: 工单类型,
                //     service_type_name: 服务/故障类型,
                //     work_level_name: SLA级别
                // }
                break;
            case 'accept_work':
                console.log('收到接单通知消息', t, p);
                instance.$getDynamicComponent('workNewNotice', () => {
                    (instance.$createWorkNewNoticeHandle({
                        stepType: t,
                        data: p,
                        $events: {
                            success: 'refresh',
                        },
                    }) as any).show();
                });
                // 接单通知，发送给客户的，提示他，他的工单已经接单了
                // p: {
                //     id: 工单 id,
                //     step: 步骤,
                //     work_code: 工单号,
                //     accepter_name: 维修人员,
                //     accepter_mobile: 联系电话
                // }
                break;
            case 'finish_work':
                console.log('收到完工通知消息', t, p);
                instance.$getDynamicComponent('workNewNotice', () => {
                    (instance.$createWorkNewNoticeHandle({
                        stepType: t,
                        data: p,
                        $events: {
                            success: 'refresh',
                        },
                    }) as any).show();
                });
                // 完工通知，发送给客户的，提示他，他的工单已完成，请及时评价
                // p: {
                //     id: 工单 id,
                //     step: 步骤,
                //     work_code: 工单号,
                //     accepter_name: 维修人员,
                //     accepter_mobile: 联系电话
                // }
                break;
            case 'pj_work':
                console.log('收到评价通知消息', t, p);
                instance.$getDynamicComponent('workNewNotice', () => {
                    (instance.$createWorkNewNoticeHandle({
                        stepType: t,
                        data: p,
                        $events: {
                            success: 'refresh',
                        },
                    }) as any).show();
                });
                // 评价通知，发送给 yw 维修人员的，提示他，您的工单客户已评价
                // p: {
                //     id: 工单 id,
                //     step: 步骤,
                //     work_code: 工单号,
                //     score: 分值,
                //     pj: 评价内容
                // }
                break;
            default:
                break;
        }
    }
}

export default Socket;