// 基础档案

declare namespace ResponseRecord {
    // 车辆列表
    interface CarList {
        id: number;
        code: string;
        brand: string;
        category: string;
        carmodel: string;
        picture: string;
        pailiang_name?: string;
        color_name?: string;
        dangwei_name?: string;
        power_name?: string;
    }
    // 车辆详情
    interface CarInfo {
        id: number;
        engine: string;
        frame: string;
        member_id: number;
        code: string;
        brand: string;
        category: string;
        carmodel: string;
        picture: string;
        color: string;
        pailiang: string;
        dangwei: string;
        power: string;
        pailiang_name: string;
        color_name: string;
        dangwei_name: string;
        power_name: string;
        member?: Member;
    }
    // 车辆所属人详情
    interface Member {
        address: string;
        avatar: string;
        name: string;
        mobile: string;
        identify: string;
        sex_name: string;
        native_place_name?: any;
    }

    // 人员列表
    interface PersonList {
        address: string;
        id: number;
        avatar: string;
        name: string;
        mobile: string;
        identify: string;
        sex: string;
        education: string;
        sex_name: string;
        education_name?: any;
        native_place: string;
        gj: string;
        gj_name?: any;
        province: string;
        city: string;
        area: string;
        province_name: string;
        city_name?: any;
        area_name?: any;
        native_place_name?: any;
        score: number;
        attr: string;
        attr_name: string;
        member_type: string;
        member_type_name: string;
        zzmm: string;
        age: number;
        work: string;
        work_address: string;
        zzmm_name?: any;
        goodcnt: number;
        badcnt: number;
    }
    // 人员详情
    interface PersonInfo {
        address: string;
        id: number;
        avatar: string;
        name: string;
        mobile: string;
        identify: string;
        sex: string;
        education: string;
        sex_name: string;
        education_name?: any;
        native_place: string;
        gj: string;
        gj_name?: any;
        province: string;
        city: string;
        area: string;
        county: string;
        street: string;
        province_name: string;
        city_name?: string;
        area_name?: string;
        county_name?: string;
        street_name?: string;
        native_place_name?: string;
        score: number;
        attr: string;
        attr_name: string;
        member_type: string;
        member_type_name: string;
        zzmm: string;
        age: number;
        work: string;
        work_address: string;
        zzmm_name?: any;
        wgdepart: string;
        wgdepart_name: string;
    }

    // 小区列表
    interface VillageList {
        id: number;
        name: string;
        address: string;
        province: string;
        city: string;
        area: string;
        county: string;
        street: string;
        province_name: string;
        city_name: string;
        area_name: string;
        county_name: string;
        street_name: string;
    }
    // 小区详情
    interface VillageInfo {
        id: number;
        name: string;
        address: string;
        province: string;
        province_name: string;
        city: string;
        city_name: string;
        area: string;
        area_name: string;
        country: string;
        country_name: string;
        street: string;
        street_name: string;
        devices: { name: string; id: number; }[];
    }

    // 楼栋列表
    interface BuildList {
        id: number;
        village_id: number;
        village_name: string;
        name: string;
        address: string;
        jwh: string;
        lng: string;
        lat: string;
        aqtd: number;
        xftd: number;
        bzs: number;
        zafzr: string;
        zafzr_phone: string;
        province: string;
        city: string;
        area: string;
        county: string;
        street: string;
        province_name: string;
        city_name: string;
        area_name: string;
        county_name: string;
        street_name: string;

    }
    // 楼栋详情
    interface BuildInfo {
        id: number;
        village_id: number;
        village_name: string;
        name: string;
        address: string;
        jwh: string;
        lng: string;
        lat: string;
        aqtd: number;
        xftd: number;
        bzs: number;
        zafzr: string;
        zafzr_phone: string;
        province: string;
        city: string;
        area: string;
        county: string;
        street: string;
        province_name: string;
        city_name: string;
        area_name: string;
        county_name: string;
        street_name: string;
        devices: Device[];
        w_unit:string;
        w_one:string;
        w_two:string;
        w_three:string;
        w_one_phone:string;
        w_two_phone:string;
        w_three_phone:string;
    }
    // 地图运维楼栋详情
    interface BuildInfoOfLayout {
        info: {
            id: number;
            village_id: number;
            village_name: string;
            name: string;
            address: string;
            jwh: string;
            lng: string;
            lat: string;
            aqtd: number;
            xftd: number;
            bzs: number;
            zafzr: string;
            zafzr_phone: string;
        };
        devices: ResponseDevice.Info[];
        num: {
            floor: number;
            room: number;
            roombad: number;
            memberbad: number;
        };
        chart: BuildInfoChart[];
    }
    interface BuildInfoChart {
        time: string;
        rnum: number;
        mnum: number;
    }

    // 楼层列表
    interface FloorList {
        id: number;
        name: string;
        img: string;
        build_id: number;
        build_name: string;
        village_name: string;
    }
    // 楼层详情
    interface FloorInfo {
        id: number;
        name: string;
        img: string;
        build_id: number;
        build_name: string;
        village_name: string;
        devices: Device[];
    }

    // 房间列表
    interface RoomList {
        id: number;
        ischeck: number;
        name: string;
        img: string;
        floor_id: number;
        floor_name: string;
        build_name: string;
        village_name: string;
    }
    // 审核房间申报
    interface SetRoomSb {
        id: number,
        verify: number,
        remark: string,
    }
    // 房间申报列表
    interface RoomSbList {
        id: number,
        room_id: number,
        mobile: string,
        room_name: string,
        time: string,
        verify: number,
    }
    // 房间详情
    interface RoomSbInfo {
        id: number;
            mobile: string;
            room_id: number;
            area_name: string;
            village_name: string;
            build_name: string;
            floor_name: string;
            room_name: string;
            time: string;
            verify: number;
            remark: string;
            members: number[];
    }
    // 房间详情
    interface RoomInfo {
        id: number;
        ischeck: number;
        name: string;
        img: string;
        hetong: number;
        room_status: string;
        czrlx: string;
        czrjy: string;
        neter: number;
        room_status_name?: any;
        czrlx_name: string;
        czrjy_name?: any;
        neter_name: string;
        t: string;
        remark: string;
        zx: string;
        pin: string;
        shi: number;
        ting: number;
        wei: number;
        floor_id: number;
        floor_name: string;
        build_name: string;
        village_name: string;
        t_name: string;
        zx_name: string;
        owner_name?: any;
        // owner: Owner[];
        owner:string;
        owner_sex?:any;
        czr: Owner[];
        devices: Device[];
    }

    // 房间复核日志列表
    interface RoomReviewLogList {
        id: number;
        room_name: string;
        floor_name: string;
        build_name: string;
        village_name: string;
        creater_name: string;
        createtime: string;
        checker_name: string;
        checktime: string;
        percent: string;
        cydata: string;
    }
    // 房间复核日志详情
    interface RoomReviewLogInfo {
        id: number;
        username: string;
        time: string;
        area_name: string;
        village_name: string;
        build_name: string;
        floor_name: string;
        room_name: string;
        remark: string;
        imgs: string[];
        results: any[];
    }

    // 违法违规类型列表
    interface HouseBadTypeList {
        id: number;
        name: string;
        status: number;
        tenant: number;
    }
    // 房屋违法违规列表
    interface HouseBadList {
        id: number;
        t: number;
        time: string;
        remark: string;
        room_name: string;
        owner_name?: string;
        t_name: string;
    }
    // 房屋违法违规信息
    interface HouseBadInfo {
        id: number;
        t: number;
        time: string;
        remark: string;
        room_id: number;
        room_name: string;
        t_name: string;
        imgs: string[];
        videos: string[];
    }

    // 处罚(奖励)类型记录字典
    interface DealType {
        title: string;
        value: string;
    }
    // 处罚奖励记录列表
    interface ActionList {
        id: number;
        time: string;
        point: string;
        remark: string;
        dealtype_name: string;
        ischeck: number;
    }
    // 处罚奖励记录信息
    interface ActionInfo {
        id: number;
        t: string;
        objid: number;
        objtype: number;
        time: string;
        point: string;
        remark: string;
        ischeck: number;
        creater: number;
        createtime: string;
        checker: number;
        checktime?: any;
        dealtype: string;
        dealresult: string;
        duikou: string;
        isopen: number;
        creater_name: string;
        checker_name?: any;
        dealtype_name: string;
        duikou_name?: any;
        objstr: string;
        obj?: any;
        imgs: string[];
        videos: string[];
        dealimgs?: any;
        province: string;
        city: string;
        area: string;
        county: string;
        street: string;
    }
    // 责任部门树信息
    interface DutyDepartTree {
        value: string;
        title: string;
        p_code: string;
        children: DutyDepartTree[];
    }

    interface Owner {
        id: number;
        name: string;
    }

    interface Device {
        id: number;
        name: string;
        flag: string;
        category: string;
        category_name: string;
        sub_category: string;
        sub_category_name: string;
    }
    // 设备分组下的设备
    interface DeviceDistributionInfo {
        id: number;
        name: string;
        flag: string;
    }
}