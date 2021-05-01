// 登录接口的声明
declare namespace ResponseApi {
    interface ApiList {
        headerTitle: string;
        version: string;
        copyright: string;
        apis: Api[];
    }
    interface ApiInfo {
        header: Header[];
        param: any[];
        title: string;
        description: string;
        author: string;
        url: string;
        method: string;
        return: Return;
    }
}
// 接口列表 options
interface Api {
    title: string;
    children: Child[];
    [index: string]: string | boolean | Child[];
}
interface Child {
    title: string;
    name: string;
    [index: string]: string | boolean;
}
// 接口详情 options
interface Return {
    status: string;
    code: number;
    msg: string;
    data: Datum[];
}
interface Datum {
    value: string;
    title: string;
    icon: string;
}
interface Header {
    name: string;
    type: string;
    require: number;
    default: string;
    other: string;
    desc: string;
}