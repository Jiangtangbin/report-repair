import { Notice } from 'view-design';
import { userModule, socketModule } from '@/store/index';
import { formatDate } from '@/utils/index';
import { getCountDown } from '@/utils/utils';
import bus from '@/utils/bus';
import { i18n } from '@/locale/index';

const { hostname, protocol } = window.location;
const host = process.env.NODE_ENV === 'development' ? '122.112.176.222' : hostname;
// port 由后台传递, 如果是 wss 则取 port 则不要, 改成添加 /wss
const uri = protocol === 'https:' ? `wss://${host}/wss` : `ws://${host}:<%= port %>`;

class Socket {
    static noticeName = 'reconnected';

    instance: null | WebSocket;
    loseNum: number;
    loseTime: string;
    enableReconnect: boolean;
    reconnectionCount: number;
    timer: number;
    heartTimer: number;
    noticeInstance: boolean;

    constructor() {
        // socket 实例
        this.instance = null;
        // socket 断开次数
        this.loseNum = 1;
        // socket 断开时间
        this.loseTime = formatDate();
        // 重连 socket 次数
        this.reconnectionCount = 0;
        // 重连 timer
        this.timer = 0;
        // 心跳 timer
        this.heartTimer = 0;
        // 是否允许 socket 重连
        this.enableReconnect = true;
        // 当前是否存在离线提示
        this.noticeInstance = false;

        this.inits = this.inits.bind(this);
        this.onopen = this.onopen.bind(this);
        this.onmessage = this.onmessage.bind(this);
        this.onclose = this.onclose.bind(this);
        this.onerror = this.onerror.bind(this);
    }

    // 提示组件的名称
    get noticeName(): string {
        return `${Socket.noticeName}${this.loseNum}`;
    }

    // 初始化 socket
    inits() {
        if (this.instance) return;
        this.enableReconnect = true;
        const port = socketModule.port;
        this.instance = new WebSocket(uri.replace(/<%=\sport\s%>/g, port.toString()));
        this.instance.onopen = this.onopen;
        this.instance.onmessage = this.onmessage;
        this.instance.onclose = this.onclose;
        this.instance.onerror = this.onerror;
    }
    // 打开连接
    onopen(ev: Event) {
        const { reconnectionCount } = this;
        if (!this.instance) console.log('socket 实例未初始化');
        const { token } = socketModule;
        const initJSON = JSON.stringify({ t: 'binduid', p: { token }});
        this.instance!.send(initJSON);
        this.reconnectionCount = 0;
        this.heartStart();
        console.log('打开连接：', ev);
        if (reconnectionCount) {
            // 重连次数为真, 说明是重连的, 需要通知用户
            this.openSuccessNotice();
            this.loseNum++;
            this.noticeInstance = false;
        }
    }
    // 接收信息
    onmessage(ev: MessageEvent) {
        console.log('收到消息：', ev.data);
        try {
            const { t, p } = JSON.parse(ev.data);
            if (t !== 'binduid_return') {
                socketModule.newMessage({
                    t,
                    p,
                });
            } else {
                // 连接 socket 成功
                bus.$emit('socket-reconnect', true);
            }
        } catch (error) {
            console.log('解析错误：', error, ev);
        }
    }
    // 关闭连接
    onclose(ev: CloseEvent) {
        this.instance = null;
        console.log('关闭连接：', ev);
        this.reconnect();
    }
    // 连接产生错误
    onerror(ev: Event) {
        console.log('连接产生错误：', ev);
        this.instance && this.instance.close();
        this.instance = null;
        this.reconnect();
    }
    /**
     * @description: 发送数据
     * @param {any} data: 发送的数据
     */
    send(data: any): boolean {
        if (!this.instance) {
            console.info('socket 服务关闭，正在尝试重连');
            this.inits();
            return false;
        }
        this.instance.send(JSON.stringify(data));
        return true;
    }
    // 发送心跳
    heartStart() {
        this.heartEnd();
        this.heartTimer = window.setInterval(() => {
            if (!this.instance) return this.heartEnd();
            this.send('ping');
            console.log('ws 心跳检测');
        }, 60000);
    }
    // 停止发送心跳
    heartEnd() {
        clearInterval(this.heartTimer);
        this.heartTimer = 0;
        console.log('停止 ws 心跳检测');
    }
    // socket 重连
    reconnect() {
        const { enableReconnect, noticeInstance } = this;
        if (!enableReconnect) {
            return;
        }
        // if (this.reconnectionCount >= 5) return console.info('超出最大重连次数, websocket 已关闭');
        console.log('两秒后进行重连');
        if (!noticeInstance) {
            this.noticeInstance = true;
            this.loseTime = formatDate();
            this.openFailNotice();
        }
        this.reconnectionCount++;
        clearTimeout(this.timer);
        this.timer = window.setTimeout(this.inits, 2000);
    }
    // 打开失败提示窗口
    openFailNotice() {
        const { noticeName, loseTime, loseNum } = this;
        // @ts-ignore
        Notice.close(noticeName);
        // @ts-ignore
        Notice.warning({
            title: i18n.t('h.tips.communicationBreak') as string,
            render(h?: CreateElement) {
                return h!(
                    'div',
                    { class: 'ivu-notice-desc' },
                    [i18n.t('h.tips.reconnect'), `${i18n.t('h.tips.BreakTime')}: ${loseTime}`, `${i18n.t('h.tips.BreakNum')}: ${loseNum}`]
                        .map(str => h!('p', str as string))
                );
            },
            duration: 0,
            name: noticeName,
            onClose: () => {
                this.noticeInstance = false;
            },
        });
    }
    // 打开成功提示窗口
    openSuccessNotice() {
        const { noticeName, loseTime } = this;
        // @ts-ignore
        Notice.close(noticeName);
        // @ts-ignore
        Notice.success({
            title: i18n.t('h.tips.communicationRecovery') as string,
            render(h?: CreateElement) {
                const now = Date.now();
                const reconnectTime = getCountDown(now - new Date(loseTime).getTime());
                return h!(
                    'div',
                    { class: 'ivu-notice-desc' },
                    [
                        [i18n.t('h.tips.recovery'), `${i18n.t('h.tips.BreakTime')}: ${loseTime}`, `${i18n.t('h.tips.recoveryTime')}: ${formatDate(now)}`, `${i18n.t('h.tips.consumingTime')}: ${reconnectTime}`]
                            .map(str => h!('p', str as string)),
                    ],
                );
            },
            duration: 0,
        });
    }
    // 销毁实例
    destroy() {
        const { noticeName } = this;
        // @ts-ignore
        Notice.close(noticeName);
        this.instance && this.instance.close();
        this.heartEnd();
        // 因关闭事件中存在重连回调，所以在这里清空重连事件，timer 也需实时获取
        clearTimeout(this.timer);
        this.instance = null;
        this.loseNum = 1;
        this.loseTime = '';
        this.enableReconnect = false;
        this.noticeInstance = false;
        this.reconnectionCount = 0;
    }
}

export default new Socket();