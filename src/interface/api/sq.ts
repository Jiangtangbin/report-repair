// 此处放社区相关的接口信息(一些简单的)
declare namespace ResponseSq {
    // 人员进出记录列表
    interface MemberInOutList {
        id: number;
        time: string;
        img: string;
        device_name: string;
        village_name: string;
        member_name: string;
        direction_name: string;
    }
    // 人员进出信息
    interface MemberInOutInfo {
        id: number;
        uuid: string;
        direction: string;
        objtype: number;
        unique: string;
        img: string;
        time: string;
        year: string;
        month: string;
        day: string;
        hour: string;
        device_name: string;
        village_name: string;
        direction_name: string;
        member?: ResponseRecord.PersonInfo;
        d?: ResponseDevice.Info;
    }
    // 车辆进出记录列表
    interface CarInOutList {
        id: number;
        time: string;
        img: string;
        code: string;
        device_name: string;
        village_name: string;
        direction_name: string;
    }
    // 车辆进出信息
    interface CarInOutInfo {
        id: number;
        uuid: string;
        direction: string;
        objtype: number;
        unique: string;
        img: string;
        time: string;
        year: string;
        month: string;
        day: string;
        hour: string;
        device_name: string;
        village_name: string;
        direction_name: string;
        car?: ResponseRecord.CarInfo;
        d?: ResponseDevice.Info;
    }
    // 物业费用管理列表
    interface PropertyFeeList {
        id: string;
        village_name: string;
        build_name: string;
        floor_name: string;
        room_name: string;
        t_name: string;
        fee: string;
        period: string;
        remark: string;
        status_name: string;
        status: string;
    }
    // 出入记录统计分析
    interface InOutCount {
        inout: ChartDatum[];
        time: ChartDatum[];
    }
    // 设备的出入记录列表(门禁|道闸)
    interface InOutHistoryByDevice {
        id: number;
        time: string;
        img: string;
        code: string;
        direction_name: string;
        member_name?: any;
        objtype: number;
    }



    interface ChartDatum {
        dimension: string;
        name: string;
        cnt: number;
        children?: ChartDatum[];
    }
}