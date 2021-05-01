/// <reference path="./chart.ts" />

type ChartTypeAlias = ResponseChart.ChartDatum | ResponseChart.Text | ResponseChart.Text2 | ResponseChart.Text3 | ResponseChart.StateList | ResponseChart.WorkList | ResponseChart.AlarmList | ResponseChart.CheckList | ResponseChart.EatHistoryList | ResponseChart.TableList | ResponseChart.TableList2 | ResponseChart.Videos;

// 用户列表参数
declare namespace ResponseMap {
    // 义乌 GIS 运维标点数据
    interface YiWuGis {
        d?: YiWuGisPoint<D>;
        f?: YiWuGisPoint<F>;
        p?: YiWuGisPoint<P>;
        m?: YiWuGisPoint<M>;
        mp?: YiWuGisPoint<Mp>;
        b?: YiWuGisPoint<B>;
        gd?: YiWuGisPoint<Gd>;
        jg?: YiWuGisPoint<Jg>;
        rk?: YiWuGisPoint<{ lng: string | number, lat: string | number; count: number }>;
        wg?: YiWuGisPoint<Wg>;
    }
    // 义乌 GIS 运维图表数据
    interface YiWuGisChart {
        /**
         * t 可能的值 -> src\components\map-patch\index.vue (componentNameMap)
         * weather: 天气
         * list: 日志
         * shuizhi: 水质
         * mix_gw: 统计图表
         * text: 文字统计
         * line|bar|pie|bar-y: 图表类型
         * sp: 视频
         * rotate: 记录列表
         * table-unheader: 设备分类列表
         * table-header: 社区人数统计
         * annular: 饼图 -> 工单巡检年月日统计
         * mix-sq: 社区混合统计
         */
        chart: ChartCommonFormat<ChartTypeAlias>[][];
        tj: CountInfo[];
        points: { title: string; value: string; cnt: number; icon?: string; }[];
        dict?: Dict[],
    }
    // 视频结构化运维图表数据
    interface VideoGisChart extends YiWuGisChart {
        events: string[];
    }

    interface Dict {
        name: string;
        code: string;
    }
    interface CountInfo {
        cnt: number;
        code: string;
        status: string;
        title: string;
    }

    // 在线地图的所有标点
    interface OnlineMarkers {
        o?: YiWuGisPoint<MarkerGather['o']>;
        d?: YiWuGisPoint<MarkerGather['d']>;
        ap?: YiWuGisPoint<MarkerGather['ap']>;
        mp?: YiWuGisPoint<MarkerGather['mp']>;
        m?: YiWuGisPoint<MarkerGather['m']>;
        p?: YiWuGisPoint<MarkerGather['p']>;
        f?: YiWuGisPoint<MarkerGather['f']>;
        b?: YiWuGisPoint<MarkerGather['b']>;
        gd?: YiWuGisPoint<MarkerGather['gd']>;
        jg?: YiWuGisPoint<MarkerGather['jg']>;
        lk?: YiWuGisPoint<MarkerGather['lk']>;
    }

    // 设备运维
    type DeviceLayout = Record<'video' | 'sense' | 'alarm' | 'control', YiWuGisPoint<D>>
    // 设备运维图表
    interface DeviceLayoutChart {
        tj: CountInfo[];
        category: DeviceLayoutCategory[];
        alarmchart: { title: string; t: string; code?: string; data: ResponseChart.ChartDatum[]; };
        alarmtypechart: { title: string; t: string; code?: string; data: ResponseChart.ChartDatum[]; };
        chart: ChartCommonFormat<ChartTypeAlias>[][];
        dict: Dict[]
    }
    interface DeviceLayoutTJ {
        total: number;
        on: number;
        off: number;
        alarm: number;
    }
    interface DeviceLayoutCategory {
        name: string;
        code: string;
        tj: DeviceLayoutTJ;
        children: Remove<DeviceLayoutCategory, 'children'>[];
    }

    // 历史轨迹列表
    interface HistoryTraceList {
        code: string;
        name: string;
        checked: boolean;
        device: { name: string; uuid: string; isonline: number; lng: string; lat: string; nbtime: string | null; }[];
    }
    // 历史轨迹
    interface HistoryTrace {
        uuid: string;
        sense: { time: string; lng: string; lat: string; }[];
    }
    // 常用地址列表
    interface UsualAddressList {
        id: number;
        org_id: number;
        name: string;
        address: string;
        lng: string;
        lat: string;
        zoom: number;
        [index: string]: number | string | boolean;
    }
    // 安全用电用水统计数据
    interface ElecWaterCount {
        orgnum: number;
        devicetotalnum: number;
        facilitiestotalnum: number;
        devicenum: { devices: number; onlines: number; facilities: number; };
        alarmnum: ElecWaterCountAlarm[];
    }
    interface ElecWaterCountAlarm {
        dimension: string;
        cnt: number;
        name: string;
        children: any[];
    }

    // 安全用电用水标点数据
    type ElecWaterMarker = YiWuGisPoint<MarkerGather['o']>;

    // 安全用电用水机构详情
    interface ElecWaterOrgInfo {
        id: number;
        remark: string;
        name: string;
        adminor: string;
        adminor_phone: string;
        xf_adminor: string;
        xf_adminor_phone: string;
        address: string;
        devices: { devices: number; onlines: number; facilities: number; };
        chart: { time: string; num: number }[];
    }
    // 应急指挥标点传感器数据
    type EmergencyChart = YiWuGisChart & { senses: SenseOption[]; };
    // 应急指挥标点数据
    interface EmergencyMarkers {
        [index: string]: YiWuGisPoint<MarkerGather[keyof MarkerGather]>;
    }

    // 应急指挥各类传感器数据
    type ChartDatumAndLocation = SenseOption & {
        title: string;
        address: string;
        lng: string;
        lat: string;
        value: string;
        cnt: number;
        uuid: string;
        left: string | number;
        top: string | number;
    }



    type ChartCommonFormat<T> = { title: string; t: string; code?: string; data: { tt: string; data: T[] }[]; };
    type YiWuGisPoint<T> = { nextid: number; total: number; list: T[] };

    interface SenseOption {
        code: string;
        name: string;
        danwei: string;
        status: boolean;
    }

    // 所有标点集合, 方便外部调用
    type AllMarkers = MarkerGather[keyof MarkerGather];
    // 对标点聚合, 方便外部调用
    interface MarkerGather {
        o: O;
        d: D;
        ap: Ap;
        mp: Mp;
        m: M;
        p: P;
        f: F;
        b: B;
        gd: Gd;
        jg: Jg;
        lk: Lk;
        rk: Rk;
        dj: Rk;
    }
    // 单位信息
    interface O {
        province: string;
        city: string;
        area: string;
        county: string;
        street: string;
        orgtype: string;
        industy: string;
        orgclassify: string;
        orgnature: string;
        id: number;
        name: string;
        lng: string;
        lat: string;
        alarmdevice: number;
        address: string;
        isshow: number;
        [index: string]: number | string;
    }
    // 设备信息
    interface D {
        province: string;
        city: string;
        area: string;
        county: string;
        orgattr: string;
        street: string;
        orgtype: string;
        industy: string;
        id: number;
        uuid: string;
        lng: string;
        lat: string;
        isonline: number;
        isalarm: number;
        name: string;
        fullname: string;
        flag: string;
        category: string;
        sub_category: string;
        isshow: number;
        category_name: string;
        sub_category_name: string;
        orgname: string;
        protected: number;
        switched: number;
        leveled: number;
        [index: string]: number | string;
    }
    // 警点信息
    interface Ap {
        lng: string;
        lat: string;
        remark?: string;
        alarmdevice: number;
        org_id: number;
        id: number;
        name: string;
        orgname: string;
        [index: string]: number | string | undefined;
    }
    // 监测点信息
    interface Mp {
        org_id: number;
        orgname: string;
        lng: string;
        lat: string;
        t: string;
        alarmdevice: number;
        id: number;
        name: string;
        shortname: string;
        ranges?: string;
        remark?: string;
        v?: number;
        [index: string]: number | string | undefined;
    }
    // 平面图信息
    interface M {
        province: string;
        city: string;
        area: string;
        county: string;
        street: string;
        orgtype: string;
        industy: string;
        id: number;
        lng: string;
        lat: string;
        map_name: string;
        icon: string;
        org_id: number;
        map_img: string;
        orgname: string;
        isshow: number;
        [index: string]: number | string;
    }
    // 巡查点信息
    interface P {
        province: string;
        city: string;
        area: string;
        county: string;
        street: string;
        orgtype: string;
        industy: string;
        alarmdevice: number;
        lng: string;
        lat: string;
        org_id: number;
        id: number;
        name: string;
        point: string;
        tag: string;
        point_type: string;
        point_level_name: string;
        point_level: string;
        point_type_name: string;
        orgname: string;
        isshow: number;
        [index: string]: number | string;
    }
    // 设施信息
    interface F {
        province: string;
        city: string;
        area: string;
        county: string;
        street: string;
        orgtype: string;
        industy: string;
        isalarm: number;
        patrol_type: number;
        lng: string;
        lat: string;
        id: number;
        code: string;
        point: string;
        patrol_type_name: string;
        director_name?: string;
        orgname: string;
        isshow: number;
        [index: string]: number | string | undefined;
    }
    // 楼栋信息
    interface B {
        id: number;
        name: string;
        address: string;
        lng: string;
        lat: string;
        [index: string]: number | string;
    }
    // 管道信息
    interface Gd {
        id: number;
        img: string;
        name: string;
        belong: string;
        t: string;
        material: string;
        remark: string;
        h: string;
        points: string;
        i_radius: string;
        o_radius: string;
        province: string;
        city: string;
        area: string;
        t_name: string;
        material_name: string;
        province_name: string;
        city_name: string;
        area_name?: any;
        [index: string]: number | string | undefined;
    }
    // 井盖信息
    interface Jg {
        id: number;
        code: string;
        lng: string;
        lat: string;
        t: string;
        isdelay: number;
        status: string;
        [index: string]: number | string | undefined;
    }
    // 河流信息
    interface Lk {
        remark: string;
        id: number;
        name: string;
        code: string;
        address: string;
        adminor: string;
        adminor_phone: string;
        xzrange: string;
        orglist: O[];
        [index: string]: number | string | O[];
    }
    // 人口
    interface Rk {
        name: string;
        mobile: string;
        avatar: string;
        sex: string;
        identify: string;
        education: string;
        native_place: string;
        attr: string;
        member_type: string;
        age: number;
        zzmm: string;
        gj: string;
        lng: string;
        lat: string;
        build_id: number;
        province: string;
        city: string;
        area: string;
        county: string;
        street: string;
        [index: string]: string | number | boolean | undefined;
    }
    // 网格信息
    interface Wg {
        id: number;
        name: string;
        xzrange: API.Location[] | API.Location[][];
        adminor: string;
        adminor_phone: string;
        device: number;
        member: number;
        user: number;
        [index: string]: number | string | API.Location[] | API.Location[][];
    }
}