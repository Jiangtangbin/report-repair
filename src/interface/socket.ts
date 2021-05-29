// socket 的基础格式
type SocketFormat<t,  P> = {
    t: t;
    p: P;
}

declare namespace GlobalSocket {
    // socket 可能的值
    type Info =
        // 账号停用
        SocketFormat<'account_disable', {}>
        // 客户删除
        | SocketFormat<'org_delete', {}>
        // 修改密码
        | SocketFormat<'password_modify', {}>
        // 绑定微信结果
        | SocketFormat<'bindwx_reply', BindWXReply>
        // 新通知公告
        | SocketFormat<'new_notice', NewNotice>
        // 新通知工单
        | SocketFormat<'new_work', NewWork>
        // 接单通知
        | SocketFormat<'accept_work', AcceptWork>
        // 完工通知
        | SocketFormat<'finish_work', FinishWork>
        // 评价通知
        | SocketFormat<'pj_work', PJWork>
    // 绑定微信结果
    type BindWXReply = {
		status: boolean;
		msg: string;
		data: any;
	}
    // 新通知公告
    type NewNotice = {
        id: string;
        title: string;
    }
    // 新通知工单
    type NewWork = {
		id: number;
		step: string;
		work_code: string;
		org_name: string;
		link_man: string;
		link_mobile: string;
		work_type_name: string;
		service_type_name: string;
		work_level_name: string;
	}
    // 接单通知
    type AcceptWork = {
        id: number;
        step: string;
        work_code: string;
        accepter_name: string;
        accepter_mobile: string
    }
    // 完工通知
    type FinishWork =  {
        id: number;
        step: string;
        work_code: string;
        accepter_name: string;
        accepter_mobile: string;
    }
    // 评价通知
    type PJWork = {
        id: number;
        step: string;
        work_code: string;
        score: string;
        pj: string;
    }
    // 上下线格式
    type OnOff = { uuid: string; t: 'on' | 'off' };
    // 巡检任务提醒格式
    type CheckTask = { t: 'checktask'; content: string; time: string; id: number; [index: string]: string | number; }
    // 工单任务提醒格式
    type WorkTask = { t: 'worktask'; content: string; time: string; id: number; [index: string]: string | number; }
    // 微信成功绑定格式
    type Scan = {
        t: string;
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