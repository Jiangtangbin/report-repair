declare namespace ResponseSimple {
    // 字典数据
    interface Dict {
        value: string;
        title: string;
        type: number;
        [index: string]: string | number;
    }
    // 安装包选项
    interface PackageOptions {
        id: number;
        version_name: string;
        version_no: string;
        type: number;
        url: string;
        create_man: number;
        create_time: string;
        remark: string;
    }
    // 安装包
    interface Package {
        apk?: PackageOptions;
        plugin?: PackageOptions;
        suidao?: PackageOptions;
        ios?: PackageOptions;
    }
    // 菜单模块列表
    interface getModule {
        value: string;
        title: string;
        icon: string;
        children?: getMenuTree[]; // 自定义字段，将 getMenuTree 作为子级，方便直接读取数据
        [index: string]: string | number | undefined | getMenuTree[] | boolean;
    }
    // 树形菜单
    interface getMenuTree {
        id: number;
        pid: number;
        module: string;
        title: string;
        url_value?: string;
        value: string;
        icon: string;
        online_hide: 0 | 1;
        sort: number;
        system_menu: number;
        status: 0 | 1;
        ismenu: 0 | 1;
        children?: getMenuTree[];
        [index: string]: number | string | undefined | getMenuTree[];
    }
    // 菜单详情
    interface getMenuInfo {
        id: number;
        module: string;
        pid: number;
        sort: number;
        title: string;
        icon: string;
        ismenu: 0 | 1;
        status: 0 | 1;
        online_hide: 0 | 1;
        url_value: string;
        in_title: string;
        value: string;
    }
    // 操作记录
    interface OperationLog {
        id: number;
        username: string;
        op_name: string;
        time: string;
        status: 0 | 1;
        msg: string;
    }
    // 角色列表
    interface RoleList {
        id: number;
        code: string;
        name: string;
        description: string;
        issystem: 0 | 1;
        orgname?: string;
    }
    // 角色详情
    interface RoleInfo {
        id: number;
        code: string;
        name: string;
        description: string;
        menu_auth: string[];
    }
    // 平面图列表
    interface PlanList {
        name: string;
        p_name: string;
        org_name: string;
        id: number;
        org_id: number;
        img: string;
    }
    // 平面图详情
    interface PlanFileInfo {
        id: number;
        name: string;
        p_id: number;
        p_name: string;
        org_id: number;
        orgname: string;
        img: string;
    }
    // 离线地图树形
    interface OffLineTree {
        id: number;
        map_name: string;
        map_img: string;
        children: getMenuTree[];
    }
}

