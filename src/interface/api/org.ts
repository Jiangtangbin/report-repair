// 机构声明

declare namespace ResponseOrg {
    // 机构列表
    interface OrgList {
        img: string;
        id: number;
        code: string;
        name: string;
        remark: string;
        status: 0 | 1;
        lng: string;
        lat: string;
        address: string;
        orgtype_name?: string;
        industy_name?: string;
        orgnature_name: string;
        orgclassify_name: string;
        orgattr_name: string;
        province_name?: string;
        city_name?: string;
        area_name?: string;
        county_name?: string;
        street_name?: string;
        [index: string]: string | number | undefined;
    }
    // 机构详情
    interface Detail {
        id: number;
        name: string;
        remark: string;
        lng: string;
        lat: string;
        address: string;
        adminor: string;
        adminor_phone: string;
    }
    // 其它机构类型
    interface OtherList {
        img: string;
        remark: string;
        id: number;
        name: string;
        code: string;
        address: string;
        p_id: number;
        p_name?: string;
        province_name?: string;
        city_name?: string;
        area_name?: string;
        county_name?: string;
        street_name?: string;
        adminor: string;
        adminor_phone: string;
        [index: string]: string | number | undefined;
    }
    // 消防主管单位所监管的单位列表
    interface XfJgOrgsInfo {
        id: number;
        name: string;
        code: string;
    }
    // 机构 ext 字段
    interface DetailExt {
        id: number;
        org_id: number;
        guimo: string;
        jyzt: string;
        membercnt: number;
        gszch: string;
        zczj: number;
        mj: string;
        aqlx: string;
        isimportant: number;
        tcsj: string;
        fgr: number;
        aq_admin: string;
        aq_admin_phone: string;
        zgzh: string;
        zgzdq: string;
        zzjg: string;
        zcdz: string;
        qy_phone: string;
        qy_cz: string;
        yyzz: string;
        shxydm: string;
        hysm: string;
        jjlx: string;
        lsgx: string;
        dzb: number;
        dyrs: number;
        gmys: number;
        lqgb: string;
        dxsl: number;
        whqy: number;
        zdwxy: number;
        schmd: number;
        scsf: number;
        zycp: string;
        zyscgy: string;
        guimo_name: string;
        jyzt_name: string;
        aqlx_name: string;
        yyzz_name: string;
        jjlx_name: string;
        lsgx_name?: string;
        fgr_name?: string;
    }
    // 主管部门树形
    interface ChargeDepartmentTree {
        id: number;
        title: string;
        p_id: number;
        children?: ChargeDepartmentTree[];
        [index: string]: string | number | undefined | ChargeDepartmentTree[];
    }
    // 机构预览
    interface Overview {
        details: Detail;
        nums: OverviewNums;
        counts: OverviewCounts;
    }
    // 机构报警通知信息
    interface AlarmNoticeInfo {
        pushalarm: number;
        receivers: AlarmNoticeInfoReceiver[];
    }
    interface AlarmNoticeInfoReceiver {
        mobile: string;
        name: string;
        pushtype: number;
        alarmtype: string[];
    }
}


interface OverviewCounts {
    danger: Danger;
    alarm: Alarm;
}

interface Alarm {
    notdeal: number;
    dealed: number;
}

interface Danger {
    notdeal: number;
    dealing: number;
    examing: number;
    dealed: number;
}

interface OverviewNums {
    org_id: string;
    usernum: string;
    devicenum: string;
    mapnum: string;
    pointnum: string;
    dangernum: string;
    plannum: string;
    departnum: string;
    alarmnum: string;
    patroldevicenum: string;
    groupnum: string;
    rolenum: string;
    apointnum: string;
    alinknum: string;
    monitornum: string;
}
