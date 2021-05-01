// 此处放管网相关的接口信息(一些简单的)
declare namespace ResponseGw {
    // 管道列表
    interface PipelineList {
        t: string;
        material: string;
        org_id: number;
        province: string;
        city: string;
        area: string;
        id: number;
        img: string;
        name: string;
        belong: string;
        t_name: string;
        material_name: string;
        province_name: string;
        city_name?: string;
        area_name?: string;
        points: string;
    }
    // 管道信息
    interface PipelineInfo {
        id: number;
        org_id: number;
        org_name: string;
        address: string;
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
        city_name?: any;
        area_name?: any;
    }
    // 井盖列表
    interface SewerCoverList {
        id: number;
        qrcode: string;
        img: string;
        code: string;
        t_name: string;
        material_name: string;
        province_name: string;
        city_name?: any;
        area_name?: any;
        address: string;
        depth: number;
        nextcode: string | number;
        distance: string;
        status: string;
        status_name: string;
        isdelay: number;
        isdelay_name: string;
    }
    // 井盖信息
    interface SewerCoverInfo {
        id: number;
        img: string;
        code: string;
        t: string;
        material: string;
        province: string;
        city: string;
        area: string;
        county: string;
        street: string;
        t_name: string;
        material_name: string;
        province_name: string;
        city_name?: any;
        area_name?: any;
        county_name?: any;
        street_name?: any;
        address: string;
        depth: number;
        lng: string;
        lat: string;
        adminor_id: number;
        adminor_name?: any;
        org_id: number;
        pipeline_id: number;
        org_name: string;
        pipeline_name: string;
        points: string;
        pipeline_t: string;
        remark: string;
        term: number;
        isdelay: number;
        imei: string;
        nextcode: string | number;
        distance: string;
        status: string;
        status_name: string;
        qrcode: string;
        wgdepart: string;
        wgdepart_name: string;
    }
    // 井盖检查记录列表
    interface CheckLogList {
        id: number;
        result: string;
        result_name: string;
        remark: string;
        time: string;
        code: string;
        checker_name: string;
        imgsstr: string;
    }
    // 井盖检查信息
    interface CheckLogInfo {
        id: number;
        result: string;
        result_name: string;
        remark: string;
        time: string;
        code: string;
        checker_name: string;
        imgs: string[];
        distance: string;
        checker: number;
        sewercover_id: number;
    }
    // 井盖维修记录列表
    interface RepairLogList {
        id: number;
        remark: string;
        time: string;
        code: string;
        address: string;
        dealer_name: string;
        t: string;
        t_name: string;
        imgsstr: string;
    }
    // 井盖维修信息
    interface RepairLogInfo {
        id: number;
        remark: string;
        time: string;
        code: string;
        address: string;
        dealer_name: string;
        dealer: number;
        imgs: string[];
        sewercover_id: number;
        t: string;
        t_name: string;
    }
}