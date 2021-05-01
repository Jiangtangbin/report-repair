
/// <reference path="../../interface/socket.ts" />

import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { i18n } from '@/locale/index';
import Vue from 'vue';
import { Notice } from 'view-design';
import bus from '@/utils/bus';

export type AlarmNotice = Omit<GlobalSocket.Alarm, 'ext'> & GlobalSocket.Alarm['ext'];
export interface ISocket {
    user: GlobalSocket.OnOff[];
    alarms: AlarmNotice[];
    cacheAlarms: AlarmNotice[];
    notices: [];
    checks: GlobalSocket.Check[];
    checktasks: GlobalSocket.CheckTask[];
    worktask: GlobalSocket.WorkTask[];
}

const instance = new Vue({ i18n });
const types = Object.keys({ d: 1, f: 2, o: 3, p: 4, ap: 5, mp: 6 });
const audioWhiteList = ['notice', 'modifypassword', 'forceoffline', 'openwindow'];
const fireAlarm = ['A00100001', 'A00100002', 'fire', 'gas', 'moni'];
let soundsInstance: (Vue & { isPlaying: boolean; t: string; }) | null = null;
let alarmTimer = 0;

@Module({ name: 'socket', namespaced: true })
class Socket extends VuexModule implements ISocket {
    // state 状态
    public user = ([] as ISocket['user']);
    public alarms = ([] as ISocket['alarms']); // socket 通过接口轮询获取的值
    public cacheAlarms = ([] as ISocket['alarms']); // 缓存报警信息，防止重复
    public notices = ([] as ISocket['notices']);
    public checks = ([] as ISocket['checks']);
    public checktasks = ([] as ISocket['checktasks']);
    public worktask = ([] as ISocket['worktask']);

    // 允许显示的报警类型
    get allowAlarmType(): Record<string, 1> {
        const alarmnotice = (this.context.rootState.user.user.alarmnotice || []) as API.Parameter['AlarmNotice'];
        return alarmnotice
            .reduce((prev, { code, isopen }) => {
                isopen && (prev[code] = 1);
                return prev;
            }, {} as Record<string, 1>);
    }
    // 筛选不符合显示类型的报警数据
    get filterNoticeAlarms() {
        const { alarms } = this;
        return alarms;
    }
    // 是否允许接收报警信息
    get isAcceptAlarmNotice(): boolean {
        const { allowAlarmType } = this;
        const { isLogin } = this.context.rootState.app;
        const { user: { info: { acceptalarm }}} = this.context.rootState.user;
        return isLogin && Boolean(acceptalarm) && !!Object.keys(allowAlarmType).length;
    }
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
     * 报警日志
     * @param {Object} data: 增加 socket 缓存的值
     */
    @Mutation
    addCacheAlarms(data: AlarmNotice | AlarmNotice[]) {
        Array.isArray(data)
            ? this.cacheAlarms = data
            : this.cacheAlarms.push(data);
    }
    /**
     * 报警日志
     * @param {Object} data: 报警的设备信息 {t, title, content, time, ext: {name, org_name, address, event_name, category}}
     */
    @Mutation
    deviceIsAlarm(data: AlarmNotice) {
        data.logid = Number(data.logid);
        data.isread = 0;
        this.alarms.unshift(data);
    }
    /**
     * 对提供的类型重新赋值
     * @param {String} types: 待排序的列表
     * @param {Array} data: 新的数据源
     */
    @Mutation
    resetNotices<T extends ISocket, K extends keyof T>({ types, data }: { types: K; data: T[K] }) {
        this[types as 'checks'] = data as any;
    }
    /**
     * @description: 更新通知列表中的数据
     * @param {String} types: 更改的类型
     * @param {String} unique: 待匹配的值
     * @param {Object} data: 新的数据源
     */
    @Mutation
    updateNotices<T extends ISocket, K extends keyof T>({ types, unique, data }: { types: K; unique: string | number; data: any }) {
        const source = this[types as 'checks'];
        const i = source.findIndex(v => v.unique === unique);
        if (i !== -1) {
            source.splice(i, 1, data);
        }
    }
    /**
     * 为指定类型增加信息
     * @param {Object} data: 报警的设备信息 checks: {t, title, content, time} || checktypes: {t, name, checktime, id}
     * @param {String} types: 操作的类型
     */
    @Mutation
    addCheck({ data, t }: { data: GlobalSocket.Check | GlobalSocket.CheckTask | GlobalSocket.WorkTask, t: string }) {
        data.isread = 0;
        this[t as 'checks'].unshift(data as GlobalSocket.Check);
    }

    @Action
    newMessage({ bt, data: { st, p }}: GlobalSocket.Info) {
        // 是否允许 socket 通知
        this.openSounds({ socketType: st, code: p && p.ext && p.ext.event_code, subcat: p && p.ext && p.ext.event_subcat, logid: p && p.logid });
        switch (bt) {
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
                    // 用户小类 -> 下发结果状态
                    case 'distribute_return': {
                        bus.$emit('on-update-result', p as GlobalSocket.Distribute_return);
                        break;
                    }
                    default:
                        break;
                }
                break;
            default:
                break;
        }
    }
    /**
     * @description: 增加报警信息
     * @param {Object} data: 报警信息
     */
    @Action
    addAlarm(data: AlarmNotice) {
        const { isAcceptAlarmNotice, allowAlarmType, cacheAlarms } = this;
        if (
            isAcceptAlarmNotice &&
            allowAlarmType.hasOwnProperty(data.event_code) &&
            !cacheAlarms.find(v => Number(v.logid) === Number(data.logid))
        ) {
            // 推送到报警列表
            this.deviceIsAlarm({ ...data, isalarm: 1 });
            // 打开报警弹窗
            this.openAlarmInfo({
                id: data.logid,
                code: data.event_code,
                subcat: data.event_subcat,
            });
            // 保存到报警缓冲列表
            this.addCacheAlarms(data);
        }
    }
    /**
     * @description: 增加报警信息
     * @param {Array} data: 报警信息
     */
    @Action
    addAlarms(data: AlarmNotice[]) {
        data.every(v => {
            this.addAlarm(v);
            return true;
        });
        // 每次更新比对时，以当前数据为报警缓冲池
        this.addCacheAlarms(data);
    }
    /**
     * @description: 打开报警弹窗
     * @param {Number} id: 报警记录 id
     * @param {String} code: 报警类型
     */
    @Action
    openAlarmInfo({ id, code, subcat }: { id: number | string, code?: string, subcat?: string }) {
        if (code && (fireAlarm.includes(code) || subcat === 'videoin')) {
            clearTimeout(alarmTimer);
            alarmTimer = window.setTimeout(() => {
                instance.$getDynamicComponent('alarmInfo', () => {
                    (instance.$createAlarmInfoHandle({ id }) as any).show();
                }, { unique: true });
            }, 1000);
        }
    }
    /**
     * @description: 打开报警提示音
     * @param {Number} id: 报警记录 id
     * @param {String} code: 报警类型
     */
    @Action
    openSounds({ socketType, code, subcat, logid }: { socketType: string, code?: string, subcat?: string, logid: string | number }) {
        const { isAcceptAlarmNotice, allowAlarmType, cacheAlarms } = this;
        // 不在提示音白名单类型里或存在于缓冲报警里或正在播放报警提示音时，直接返回
        if (
            !audioWhiteList.includes(socketType) ||
                cacheAlarms.find(v => Number(v.logid) === Number(logid)) ||
                soundsInstance &&
                soundsInstance.isPlaying &&
                soundsInstance.t === 'fire'
        ) {
            return;
        }
        // 如果是报警提示音，且不允许通知或该类型不允许通知的情况下，直接返回
        if (
            code &&
                !(isAcceptAlarmNotice &&
                allowAlarmType.hasOwnProperty(code))
        ) {
            return;
        }
        const t = code && (fireAlarm.includes(code) || subcat === 'videoin') ? 'fire' : 'di';
        instance.$getDynamicComponent('sounds', () => {
            soundsInstance = (instance.$createSoundsHandle({ t, loop: t === 'fire' }) as any).show();
        }, { unique: true });
    }
}

export default Socket;