// socket 的基础格式
type SocketFormat<Bt, St, P> = {
    bt: Bt;
    data: {
        st: St;
        p: P;
    };
}

declare namespace GlobalSocket {
    // socket 可能的值
    type Info =
        // 用户上下线通知
        SocketFormat<'user', 'onoff', OnOff>
        // 被挤下线通知
        | SocketFormat<'user', 'forceoffline', any>
        // 密码修改通知
        | SocketFormat<'user', 'modifypassword', any>
    // 上下线格式
    type OnOff = { uuid: string; t: 'on' | 'off' };
    // 巡检任务提醒格式
    type CheckTask = { t: 'checktask'; content: string; time: string; id: number; [index: string]: string | number; }
    // 工单任务提醒格式
    type WorkTask = { t: 'worktask'; content: string; time: string; id: number; [index: string]: string | number; }
    // 微信成功绑定格式
    type Scan = {
        t: string,
        subscribe: string;
        openid: string;
        nickname: string;
        sex: string;
        language: string;
        city: string;
        province: string;
        country: string;
        headimgurl: string;
        subscribe_time: string;
        remark: string;
        groupid: string;
        subscribe_scene: string;
        qr_scene: string;
        qr_scene_str: string;
    }
}