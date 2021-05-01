// 此处放民政相关的接口信息(一些简单的)
declare namespace ResponseMz {
    // 就餐记录列表
    interface EatHistoryList {
        id: number;
        orgname: string;
        time: string;
        member_name: string;
        s: string;
    }
    // 就餐报表列表
    interface DiningReportList {
        day: string;
    }
    // 就餐报表详情
    interface DiningReportInfo {
        day: string;
        list: DiningReportListOption[];
    }
    interface DiningReportListOption {
        orgname: string;
        b: number;
        l: number;
        d: number;
        t: number;
    }
    // 就餐统计
    interface DiningCount {
        type: string;
        data: DiningCountOption[];
    }
    interface DiningCountOption {
        dimension: string;
        name: string;
        cnt: number;
    }
    // 补助报表列表
    interface EatMoneyList {
        id: number,
        name: string,
        a: string,
        a_sum: number,
        b: string,
        b_sum: number,
        c: string,
        c_sum: number,
        d: string,
        d_sum: number,
        total_sum: number,
    }
}