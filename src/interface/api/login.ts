// 登录接口的声明
declare namespace ResponseLogin {
    interface LoginInfo {
        token: string;
        auth: Auth[];
        info: Info;
    }
    interface Info {
        id: number;
        org_id: number;
        role: string;
        admin_area: string;
    }
    interface Auth {
        id: number;
        pid: number;
        module: string;
        title: string;
        icon: string;
        url_value: string;
        in_title?: string;
        value: string;
        ismenu?: number;
        sort: number;
        children?: Auth[];
        path: string; // 非后台传递，src\store\modules\permission.ts 中 line: 25 添加
        [index: string]: any;
    }
}