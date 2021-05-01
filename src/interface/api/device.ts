// 设备参数
declare namespace ResponseDevice {
    // 设备列表
    interface List {
        id: number;
        org_id: number;
        uuid: string;
        name: string;
        isonline: number;
        preview: number;
        lng: string;
        lat: string;
        address: string;
        orgname: string;
        signal: number | string;
        battery: number | string;
        [index: string]: string | number;
    }
    // 设备详情
    interface Info {
        id: number;
        org_id: number;
        orgname: string;
        uuid: string;
        name: string;
        lng: string;
        lat: string;
        address: string;
        group: any;
        battery: number | string;
        isonline: number;
        preview: number;
        nbtime: string; // 上次通讯时间
        resolution: string; // 分辨率
        signal: number | string; // 信号
        adminor: string;
        adminor_phone: number | string;
    }
    // 设备配置
    interface Config {
        config: string;
    }
    // 设备分组列表
    interface DeviceGroupList {
        id: number;
        org_id: number;
        orgname: string;
        code: string;
        name: string;
        remark: string;
    }
    // 设备分组下的设备
    interface DeviceGroupDevice {
        id: number;
        name: string;
    }
    // 设备分组树形
    interface DeviceGroupTree {
        id: number;
        value: string;
        title: string;
        p_id: number;
        p_name: string;
        children?: DeviceGroupTree[];
        [index: string]: number | string | boolean | undefined | DeviceGroupTree[];
    }
    // 设备大小类
    interface Category {
        value: string;
        title: string;
        p_code: string;
        children: Category[];
    }
    // 设备传输方式
    interface DeviceTransfer {
        value: string;
        title: string;
        children: DeviceTransfer[];
    }
    // 设备厂家列表
    interface DeviceCj {
        name: string;
        code: string;
    }
    // 设置设备参数
    interface DeviceOptionInfo {
        lm?: number | null;
        jglm?: number | null;
        jgjd?: number | null;
        jgfd?: number | null;
    }
    // 设置传感器参数
    interface DeviceSenseInfo {
        uuid: string;
        interval: string;
        accuracy: string;
        sensesets: DeviceSenseInfoOption[];
    }
    interface DeviceSenseInfoOption {
        t: string;
        t_name: string;
        max: number | string;
        min: number | string;
        filter: boolean;
        jz: number | string;
    }
    // 设置机构下所有的传感器参数
    interface DeviceSenseTypeInfo {
        t: string;
        t_name: string;
        max: number | string;
        min: number | string;
        jz: number | string;
    }
    // 设置控制设备参数
    interface DeviceControlInfo {
        value: number
    }
    // 设备下一层设备
    interface DeviceChildrenInfo {
        id: number;
        name: string;
        category: string;
        sub_category: string;
        uuid: string;
        isonline: number;
        isalarm: number;
        flag: string;
        p_flag: string;
        protected: number;
        switched: number;
        leveled: number;
        child: number;
        children?: DeviceChildrenInfo[];
        [index: string]: boolean | number | string | DeviceChildrenInfo[] | undefined;
    }
    // 矩阵设备默认输出口
    interface DeviceDefault {
        out: { uuid: string; name: string; sub_category: string; [index: string]: boolean | string; }[];
        chk: { v: string; a: string; };
    }

    // 移动设备最新坐标
    interface NewestLocation {
        uuid: string;
        lng: string;
        lat: string;
    }

    // 传感器数据类型
    interface SenseDataType {
        name: string;
        code: string;
        danwei: string;
    }

    // 传感器的最新一条数据
    interface SenseTops {
        uuid: string;
        timestamp: number;
        sense: Dictionary<string>;
    }

    // 传感器最新曲线图数据
    interface SenseData {
        timestamp: number;
        sense: Dictionary<string>;
    }
    // 传感器历史统计数据
    interface SenseHistoryData {
        type: string;
        data: SenseHistoryDataDatum[];
    }
    interface SenseHistoryDataDatum {
        k: string;
        cnt: number;
        total: string;
    }
    // 传感器指定时间段历史数据
    interface SenseHistory {
        timestamp: number;
        sense: { [index: string]: string; }[]
    }
    // p2p 转发服务器列表
    interface P2pServerList {
        id: number;
        name: string;
    }
}