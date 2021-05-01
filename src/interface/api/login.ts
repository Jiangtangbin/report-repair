// 登录接口的声明
declare namespace ResponseLogin {
    interface LoginInfo {
        // lnglat: LngLat;
        // zoom: number;
        // mapcenter?: string;
        port: number;
        token: string;
        auth: Auth[];
        info: Info;
        file_pre: string;
        // alarmnotice: AlarmNotice[];
        // config: {
        //     title: string;
        //     baseorg: string;
        // };
    }
    interface AlarmNotice {
        code: string;
        name: string;
        isopen: number;
    }
    interface Info {
        id: number;
        notices: number;
        usercode: string;
        username: string;
        acceptalarm: number;
        mobile: string | number;
        avatar: string;
        email: string;
        address: string;
        wxnum: string;
        qqnum: string;
        belong_org: number;
        department: number;
        uuid: string;
        flag: string;
        isonline: number;
        status: number;
        orgname: string;
        orgcode: string;
        role: string;
        orgpath: string;
        orgattr: string;
        isbloc: number;
        tenant: number;
        xf_path: string;
        tenant_status: number;
        rolename: string;
        goto: string;
        gotoname?: string;
        logintype: string;
        maprange: baiduMap['point'][],
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
    interface LngLat {
        lng: string;
        lat: string;
    }
}