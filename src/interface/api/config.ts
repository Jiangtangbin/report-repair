declare namespace ResponseConfig {
    // 配置列表
    interface List {
        id: number;
        org_id: number;
        orgname: string;
        name: string;
        content: string;
        config: string;
        creatertime: string;
        creater: string;
        creater_name: string;
    }
    interface DistributionLogList {
        id: number;
        t: string;
        t_name: string;
        content: string;
        creatertime: string;
        creater: string;
        creater_name: string;
    }
    interface DistributionInfo {
        device_name: string;
        result: string;
        result_name: string;
        time: string;
        msg: string;
    }
}