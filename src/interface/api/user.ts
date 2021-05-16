declare namespace ResponseUser {
    // 用户列表
    interface List {
        id: number; 
        username: string; 
        mobile: number | string; 
        role_name: string; 
        org_name: string; 
        email: string; 
        wx: string; 
        status: number; 
        [index: string]: string | number | undefined;
    }
    // 用户详情
    interface Info {
        id: number;
        username: string;
        mobile: number | string;
        role: string;
        role_name: string;
        org_id: string;
        org_name: string;
        sex: string;
        sex_name: string;
        email: string;
        wx: string;
        status: number;
        [index: string]: string | number | undefined | null;
    }
}
