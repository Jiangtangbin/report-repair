/// <reference path='./simple.ts' />
/// <reference path='./login.ts' />
/// <reference path='./org.ts' />
/// <reference path='./user.ts' />

// api 全局声明
declare namespace API {
    // 后台响应值
    interface Response {
        // 登录信息
        'LoginInfo': ResponseLogin.LoginInfo;
        // 刷新 token
        'RefreshToken': string;
        // 字典
        'Dict': ResponseSimple.Dict[];
        // 角色下拉框
        'Rule': ResponseSimple.Rule[];
        // 市区属性
        'CityArea': ResponseSimple.CityArea[];
        // 工单类型和服务 / 故障类型的树形
        'WorkServiceFault': ResponseSimple.WorkServiceFault[];
        // 客户列表
        'OrgList': ListType<ResponseOrg.OrgList[]>;
        // 客户详情
        'OrgInfo': ResponseOrg.Detail;
        // 账号列表
        'UserList': ListType<ResponseUser.List[]>;
        // 账号详情
        'UserInfo': ResponseUser.Info;
        // 微信二维码
        'QRCodeUrl': {
            url: string;
        }
        // 用户微信信息
        'UserWxInfo': {
            nickname: string;
            headimgurl: string;
            country: string;
            province: string;
            city: string;
        }
        // 操作记录列表
        'OperationLog': ListType<ResponseSimple.OperationLog[]>;
        // 工单池列表
        'WorkPoolList': ListType<ResponseSimple.WorkPoolList[]>;
        // 工单列表
        'WorkList': ListType<ResponseSimple.WorkList[]>;
        // 工单详情
        'WorkInfo': ResponseSimple.WorkInfo;
        // 知识库列表
        'KnowledgeBaseList': ListType<ResponseSimple.KnowledgeBaseList[]>;
        // 知识库详情
        'KnowledgeBaseInfo': ResponseSimple.KnowledgeBaseInfo;
        // 公告列表
        'NoticeList': ListType<ResponseSimple.NoticeList[]>;
        // 公告详情
        'NoticeInfo': ResponseSimple.NoticeInfo;
        // 地图运维
        'MapOperation': ResponseSimple.MapOperation;
        // 获取客户总览
        'OrgOverView': ResponseSimple.OrgOverView;
        // 基础数据树形
        'BasicDataTree': ResponseSimple.BasicDataTree[];
    }

    // 前端请求参数
    interface Parameter {
        // 登录
        'Login': {
            mobile: number | string;
            password: string;
            type: number | string;
        }
        // 获取图形验证码
        'GraphicCode': {
            mobile: number | string;
        }
        // 获取短信验证码
        'SMSCode': {
            mobile?: number | string;
            code: number | string;
        }
        // 修改密码
        'UpdatePassword': {
            mobile: number | string;
            password: string;
            verify: string;
        }
        // 修改密码或手机号码
        'UpdatePasswordMobile': {
            t: string;
            new: string;
            verify: string;
        }
        // 上传文件
        'UploadFile': {
            file: string;
        }
        // 客户列表
        'OrgList': RequestPage & Region & {
            code?: string;
            name?: string;
            address?: string;
        }
        // 设置客户
        'SetOrg': Region & Partial<Location> & {
            type: TypeAlias;
            id?: number;
            name: string;
            address: string;
            adminor?: string;
            adminor_phone?: number | string;
            lng: string;
            lat: string;
        }
        // 账号列表
        'UserList': RequestPage & {
            org_id?: number;
            orgname?: string;
            username?: string;
            mobile?: number;
            role_name?: string;
        }
        // 添加账号
        'SetUser': Area &  {
            type: TypeAlias;
            id?: number;
            username: string;
            mobile: string;
            role: string;
            org_id?: any;
            sex?: number | string;
            email?: string;
            is_notice?: number;
        }
        // 启用禁用账号
        'Forbidden': {
            id: number;
            status: number;
        }
        // 个人设置
        'PersonalSetting': {
            username: string;
            email?: string;
            sex?: string;
            is_notice?: number;
        }
        // 操作记录列表
        'OperationLog': RequestPage & {
            op?: string;
            obj?: string;
            username?: string;
            starttime?: string;
            endtime?: string;
        }
        // 工单池列表
        'WorkPoolList': RequestPage & {
            work_code: string;
            work_type: string;
            service_type: string;
            work_level: string;
            org_name: string;
            work_status: string;
        }
        // 工单列表
        'WorkList': RequestPage & {
            work_code: string;
            work_type: string;
            service_type: string;
            work_level: string;
            work_status: string;
            score: number | string;
            org_name: string;
        }
        // 上报工单
        'CreateWork': {
            org_id: number | string;
            work_type: string;
            service_type: string;
            work_level: string;
            content: string;
            imgs?: string[];
            link_man: string;
            link_mobile: number | string;
        }
        // 派发工单
        'DistributionWork': {
            work_id: number;
            reciever: number | string;
        }
        // 回单
        'ReplyWork': {
            work_id: number;
            reply_content: string;
            reply_imgs?: string[];
        }
        // 评价
        'Appraise': {
            work_id: number;
            score: number | string;
            pj?: string;
        }
        // 取消工单
        'CancelWork': {
            work_id: number;
            reason: string;
        }
        // 知识库列表
        'KnowledgeBaseList': RequestPage & {
            title?: string;
        }
        // 设置知识库
        'SetKnowledgeBase': {
            type: number | string;
            id?: number | string;
            title: string;
            content: string;
        }
        // 公告列表
        'NoticeList': RequestPage & {
            title?: string;
            publish_status?: string;
        }
        // 设置公告
        'SetNotice': {
            type: number | string;
            id?: number | string;
            title: string;
            content: string;
        }
        // 发布公告
        'PublishNotice': {
            id: number | string;
        }
    }
    // 在项目中为列表声明的类型
    interface ListType<T> {
        list: T;
        page: ResponsePage;
    }
    // 列表时的分页参数
    interface ResponsePage {
        pageSize: number;
        pageNum: number;
        count: number;
        countPage: number;
    }
    type Region = {
        province?: string;
        city?: string;
        area?: string;
        county?: string;
        street?: string;
    }
    type Area = {
        admin_city?: string;
        admin_area?: string;
    }
    type Location = {
        lng: string;
        lat: string;
    }
    // 添加编辑时 type 的别名
    type TypeAlias = number;
    // 列表分页参数筛选
    interface RequestPage {
        pageSize?: number;
        pageNum?: number;
    }
}