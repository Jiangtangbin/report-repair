
/// <reference path="../../interface/socket.ts" />

import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { i18n } from '@/locale/index';
import Vue from 'vue';

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
        switch (t) {
            // 用户大类
            case 'user':
                switch (st) {
                    // 用户小类 -> 上下线通知
                    case 'onoff':
                        break;
                    // 用户小类 -> 通知提醒
                    case 'notice': {
                        switch (p!.t) {
                            // 用户小类 -> 通知提醒 -> 报警提醒
                            case 'alarm': {
                                break;
                            }
                            // 用户小类 -> 通知提醒 -> 消警
                            case 'unalarm': {
                                break;
                            }
                            // 用户小类 -> 通知提醒 -> 巡检报警
                            case 'check': {
                                break;
                            }
                            // 用户小类 -> 通知提醒 -> 个人任务通知
                            case 'checktask': {
                                break;
                            }
                            // 用户小类 -> 通知提醒 -> 个人任务通知
                            case 'worktask': {
                                break;
                            }
                            default:
                                break;
                        }
                        break;
                    }
                    // 用户小类 -> 密码被修改
                    // 用户小类 -> 强制上下线提醒
                    case 'modifypassword':
                    case 'forceoffline':
                        if (process.env.NODE_ENV !== 'development') {
                            this.context.commit('app/alterState', { key: 'isLogin', value: false }, { root: true });
                            this.context.commit('user/alterState', { key: 'token', value: '' }, { root: true });
                            instance.$Modal.info({
                                title: st === 'forceoffline' ? i18n.t('h.tips.accountAlreadyLogin') as string : i18n.t('h.tips.accountPasswordModified') as string,
                                content: i18n.t('h.tips.reLogin') as string,
                                onOk: () => this.context.dispatch('sign/resetState', '', { root: true }).then(() => window.location.reload()),
                            });
                        }
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }
    }
}

export default Socket;