// 用户列表参数
declare namespace ResponseUser {
    // 用户列表
    interface List {
        id: number;
        usercode: string;
        username: string;
        mobile: string;
        email: string;
        avatar: string;
        status: number;
        wxnum: string;
        qqnum: string;
        address: string;
        belong_org: number;
        orgname?: string;
        rolename: string;
        departmentname?: string;
        [index: string]: string | number | undefined;
    }
    // 用户详情
    interface Info {
        belong_org: number;
        id: number;
        usercode: string;
        username: string;
        mobile: string;
        email: string;
        avatar: string;
        status: number;
        wxnum: string;
        qqnum: string;
        address: string;
        department: number;
        role: string;
        orgname: string;
        rolename: string;
        departmentname?: string | null;
        [index: string]: string | number | undefined | null;
    }
    // 用户已拥有权限
    interface UserAuthInfo {
        id: number;
        children?: UserAuthInfo[];
    }
    // 获取微信绑定二维码
    interface QRCodeUrl {
        url: string;
    }
    // 获取用户微信信息
    interface WxInfo {
        subscribe: number;
        openid: string;
        nickname: string;
        sex: number;
        language: string;
        city: string;
        province: string;
        country: string;
        headimgurl: string;
        subscribe_time: number;
        remark: string;
        groupid: number;
        tagid_list: any[];
        subscribe_scene: string;
        qr_scene: number;
        qr_scene_str: string;
    }
    // 用户部门列表
    interface DepartmentList {
        id: number;
        name: string;
        code: string;
        remark: string;
        org_id: number;
        orgname?: string;
    }
}
