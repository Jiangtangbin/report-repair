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
        // 视频传感报警通知
        | SocketFormat<'user', 'openwindow', OpenWindow>
        // 报警提醒通知
        | SocketFormat<'user', 'notice', Alarm>
        // 巡检提醒通知
        | SocketFormat<'user', 'notice', Check>
        // 巡检任务提醒通知
        | SocketFormat<'user', 'notice', CheckTask>
        // 工单任务提醒通知
        | SocketFormat<'user', 'notice', WorkTask>
        // 微信成功绑定通知
        | SocketFormat<'user', 'scan', Scan>
        // 关于 p2p 的信息
        | SocketFormat<'user', 'trans', Trans>
        // 下发结果的信息
        | SocketFormat<'user', 'distribute_return', Distribute_return>
    const a: Info[keyof Info];
    // 上下线格式
    type OnOff = { uuid: string; t: 'on' | 'off' };
    // 视频传感报警格式
    type OpenWindow = { t: 'video' | 'sense', devicename: string, flag: string, uuid: string, time: string; datat: string; yz: string; };
    // 报警提醒格式
    type Alarm = {
        t: 'alarm' | 'unalarm';
        title: string;
        type: number;
        unique: string;
        content: string;
        org_id: number;
        time: string;
        logid: string | number;
        isalarm: number;
        isread: number;
        ext?: AlarmExt,
    }
    type AlarmExt = {
        name: string;
        address: string;
        org_name: string;
        time: string;
        event_name: string;
        event_code: string;
        event_subcat: string;
        category: string;
    }
    // 巡检提醒格式
    type Check = {
        t: 'check',
        address: string;
        distance: number;
        img: string;
        point: string;
        tag: string;
        time: string;
        user: string;
        [index: string]: string | number;
    }
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
    // 关于 p2p 的信息
    type Trans = {
        info: string;
        from: string;
    }
    // 下发结果的信息
    type Distribute_return = {
        device: number | string;
        distribute_id: number | string;
        result: string;
        msg: string;
        time: string;
    }
}