declare namespace ResponseOrg {
    // 机构列表
    interface OrgList {
        id: number;
        code: string;
        name: string;
        city_name: string;
        area_name: string;
        address: string;
        adminor: string;
        adminor_phone: number | string;
        [index: string]: string | number | undefined;
    }
    // 机构详情
    interface Detail {
        id: number;
        code: string;
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
        [index: string]: string | number | undefined;
    }
}
