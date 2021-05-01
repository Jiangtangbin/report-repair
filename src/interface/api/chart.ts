declare namespace ResponseChart {
    // 对图表类型的格式声明
    /* 地图图表或其它页面的图表数据 */
    // 存在 children 且长度 > 0 时，需要遍历，生成多个 series，不存在可以直接展示
    interface ChartDatum {
        dimension?: string;
        name: string;
        cnt: number;
        children?: ChartDatum[]
    }
    // 文字统计数据
    interface Text {
        cnt: number;
        code: string;
        name: string;
        total?: number;
    }
    // 文字统计数据
    interface Text2 {
        cnt: number;
        dimension: string;
        name: string;
    }
    // 文字统计数据 -> 管网 mix_gw
    interface Text3 {
        cnt: number;
        code: string;
        field: string;
        title: string;
    }
    // 状态统计 -> 社区(设备分析)
    interface StateList {
        name: string;
        online: string;
        offline: string;
        alarm: string;
        category: string;
        sub_category: string;
    }
    // 列表格式 -> 最近工单记录
    interface WorkList {
    }
    // 列表格式 -> 最近报警记录
    interface AlarmList {
        status: number;
        id: number;
        event: string;
        objtype: number;
        time: string;
        flag: string;
        m_id: number;
        event_name: string;
        status_name: string;
        obj: string;
        address: string;
    }
    // 列表格式 -> 最近检查记录
    interface CheckList {
        id: number;
        result: string;
        result_name: string;
        remark: string;
        time: string;
        code: string;
        checker_name?: any;
        imgsstr: string;
    }
    // 列表格式 -> 最近就餐记录
    interface EatHistoryList {
        id: number;
        time: string;
        s: string;
        member_name: string;
        orgname: string;
        img: string;
    }
    // table 列表格式 -> 社区
    interface TableList {
        id: number;
        name: string;
        build: number;
        room: number;
        member: number;
        ldmember: number;
    }
    // table 列表格式 -> 民政
    interface TableList2 {
        b: number;
        cnt: number;
        d: number;
        l: number;
        id: string;
        name: string;
    }
    // 视频列表
    interface Videos {
        name: string;
        uuid: string;
        flag: string;
        isonline: number;
        isalarm: number;
    }
    // 带轮询的视频列表
    interface Video2 {
        uuids: Videos[];
        ext?: PollingVideo[];
    }
    interface PollingVideo {
        name: string;
        flag: string;
        radioValue: string;
        timeInterval: string;
        timeQuantunEnd: string | null;
        timeQuantunStart: string | null;
        type: string;
        uuid: string;
        wnd: string;
    }
}