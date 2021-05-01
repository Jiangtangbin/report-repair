declare namespace ResponseMonitor {
    // 监测点列表
    interface MonitorList {
        lng: string;
        lat: string;
        remark?: string;
        alarmdevice: number;
        org_id: number;
        id: number;
        name: string;
        orgname: string;
        t: string;
        t_name?: string;
        maps?: string[];
        [index: string]: string | number | undefined | boolean | string[];
    }
    // 监测点信息
    interface MonitorInfo {
        lng: string;
        lat: string;
        remark?: any;
        alarmdevice: number;
        org_id: number;
        id: number;
        shortname: string;
        name: string;
        layout: string;
        layout_content?: string;
        orgname: string;
        ranges?: any;
        t: string;
        t_name?: any;
        point: string;
        maps: string[];
        devices: Devices[];
        province: string;
        city: string;
        area: string;
        county: string;
        street: string;
    }
    // 监测点布局
    interface MonitorLayout {
        id: number;
        name: string;
        layout: string;
        layout_content: string;
    }
    // 监测点信息以及传感器数据
    type MonitorInfoAndData = Replace<MonitorInfo, { devices: MonitorInfoAndDataDevice[] }>
    interface MonitorInfoAndDataDevice extends Devices {
        data?: {
            timestamp: number;
            sense: { [index: string]: string; }
        }
    }


    // 布局后最终的格式
    type MonitorInfoContent = Video | Offmap | Maps | ChartNum | Chart | Variable;

    type Variable = { type: 'variable'; coms: Exclude<MonitorInfoContent, Variable>[] }
    type Video = { type: 'videos' | 'audios'; flag: string; name: string; uuid: string; }
    type Offmap = { type: 'offmap'; coms: { id: number, map_img: string; }; }
    type ChartNum = { type: 'chartNum'; parseIcon: string; showType: string; uuid: string; };
    type Chart = { type: 'chart'; parseIcon: string; uuid: string; };
    type Maps = { type: 'maps'; title: string; lng: number; lat: number; };

    interface Devices {
        id: number;
        category: string;
        sub_category: string;
        flag: string;
        uuid: string;
        isalarm: number;
        isonline: number;
        fullname: string;
        name: string;
        category_name: string;
        sub_category_name: string;
    }
}