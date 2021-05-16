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