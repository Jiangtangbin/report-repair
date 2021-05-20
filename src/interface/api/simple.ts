declare namespace ResponseSimple {
    // 字典数据
    interface Dict {
        code: string;
        name: string;
        type: number;
        [index: string]: string | number;
    }
    // 角色下拉框
    interface Rule {
        id: number | string;
        code: string;
        name: string;
        [index: string]: string | number;
    }
    // 市区树形
    interface CityArea {
        value: string;
        title: string;
        p_code: string;
        children?: BasicDataTree[];
        [index: string]: string | number | BasicDataTree[] | undefined;
    }
    // 工单类型和服务 / 故障类型的树形
    interface WorkServiceFault {
        code: string;
        name: string;
        children?: WorkServiceFault[];
        [index: string]: string | number | undefined | WorkServiceFault[];
    }
    // 操作记录
    interface OperationLog {
        id: number;
        username: string;
        op_name: string;
        obj: string;
        time: string;
        status: 0 | 1;
        msg: string;
    }
    // 工单池列表
    interface WorkPoolList {
        id: number | string;
        work_code: number | string;
        work_type_name: string;
        work_level_name: string;
        service_type_name: string;
        org_name: string;
        link_man: string;
        link_mobile: number | string;
        create_time: string;
    }
    // 工单列表
    interface WorkList {
        id: number | string;
        work_code: number | string;
        work_type_name: string;
        work_status_name: string;
        work_level_name: string;
        service_type_name: string;
        org_name: string;
        link_man: string;
        link_mobile: number | string;
        create_time: string;
        score: number | string;
    }
    // 工单详情
    interface WorkInfo {
        // 字段info的注释，请忽略": "详细信息",
        info: {
            id: number | string; 
            work_code: number | string; 
            work_type_name: string; 
            work_level_name: string; 
            work_status: number | string; 
            work_status_name: string; 
            service_type_name: string; 
        },
        // 字段line的注释，请忽略": "时间轴信息",
        line: {
            // 字段report的注释，请忽略": "报修",
            report: {
                time: string;
                creater_name: string;
                org_name: string;
                org_address: string;
                link_man: string;
                link_mobile: number | string;
                content: string;
                imgs: string[];
            },
            //字段recieve的注释，请忽略: 接单,
            recieve: {
                time: string;
                accepttype_name: string;
                sender_name: string;
                accepter_name: string;
                accepter_mobile: number | string;
            },
            //字段arrive的注释，请忽略: 到场,
            arrive: {
                time: string;
                lng: string;
                lat: string;
                distance: string;
            },
            //字段reply的注释，请忽略: 回单,
            reply: {
                time: string;
                replyer_name: string;
                reply_content: string;
                reply_imgs: string[];
            },
            //字段evaluate的注释，请忽略: 评价,
            evaluate: {
                time: string;
                score: number | string;
                pj: string;
            }
        }
    }
    // 知识库列表
    interface KnowledgeBaseList {
        id: number | string;
        title: string;
        creater_name: string;
        create_time: string;
        num: number;
    }
    // 知识库详情
    interface KnowledgeBaseInfo {
        id: number | string;
        title: string;
        content: string;
        creater: number | string;
        creater_name: string;
        create_time: string;
    }
    // 公告列表
    interface NoticeList {
        id: number | string;
        title: string;
        publish_status: string;
        publish_status_name: string;
        creater_name: string;
        createtime: string;
        publish_name: string;
        publishtime: string;
        num: number;
    }
    // 公告详情
    interface NoticeInfo {
        id: number | string;
        title: string;
        content: string;
        publish_status: string;
        publish_status_name: string;
        creater: string;
        creater_name: string;
        create_time: string;
        publish: string;
        publish_name: string;
        publishtime: string;
        num: number;
    }
    // 地图运维
    interface MapOperation {
        points: string;
        // 字段charts的注释，请忽略: 图表,
        charts: {
            // 字段overview的注释，请忽略: 总览,
            overview: {
                total: number;
                year: number;
                month: number;
                unfinish: number;
                pj: number;
                score: number;
            },
        // 字段list的注释，请忽略: 最近工单,
        list: [
            {
            id: number | string;
            work_code: number | string;
            work_type_name: string;
            work_status_name: string;
            work_level_name: string;
            service_type_name: string;
            org_name: string;
            link_man: string;
            link_mobile: number | string;
            create_time: string;
            }
        ]
        }
    }
    // 获取客户总览
    interface OrgOverView {
        // 字段info的注释，请忽略: 详情,
        info: {
            id: number | string;
            code: number | string;
            name: string;
            city: string;
            area: string;
            city_name: string;
            area_name: string;
            address: string;
            lng: string;
            lat: string;
            adminor: string;
            adminor_phone: number | string;
        },
        // 字段overview的注释，请忽略: 总览,
        overview: {
            total: number;
            year: number;
            month: number;
            unfinish: number;
            pj: number;
            score: number;
        }
    }
    // 基础数据树形
    interface BasicDataTree {
        value: string;
        title: string;
        p_code: string;
        children?: BasicDataTree[];
        [index: string]: string | number | BasicDataTree[] | undefined;
    }
}

