/// <reference path='./simple.ts' />
/// <reference path='./login.ts' />
/// <reference path='./org.ts' />
/// <reference path='./user.ts' />
/// <reference path='./api.ts' />
/// <reference path='./device.ts' />
/// <reference path='./map.ts' />
/// <reference path='./record.ts' />
/// <reference path='./monitor.ts' />
/// <reference path='./mz.ts' />
/// <reference path='./gw.ts' />
/// <reference path='./sq.ts' />

// api 全局声明
declare namespace API {
    // 后台响应值
    interface Response {
        // 刷新 token
        'RefreshToken': string;
        // 上传图片的 token
        'UpToken': {
            upToken: string;
        };
        // 七牛
        'QiNiu': {
            hash: string;
            key: string;
            error?: string;
        };
        // 字典
        'Dict': ResponseSimple.Dict[];
        // 接口页面
        'ApiList': ResponseApi.ApiList;
        // 接口页面
        'ApiInfo': ResponseApi.ApiInfo;
        // 登录信息
        'LoginInfo': ResponseLogin.LoginInfo;
        // 安装包
        'Package': ResponseSimple.Package;
        // 菜单模块列表
        'getModule': ResponseSimple.getModule[];
        // 菜单树形
        'getModuleTree': ResponseSimple.getMenuTree[];
        // 菜单详情
        'getMenuInfo': ResponseSimple.getMenuInfo;
        // 传感器的最新一条数据
        'SenseDataType': Dictionary<ResponseDevice.SenseDataType>;
        // 操作记录
        'OperationLog': ListType<ResponseSimple.OperationLog[]>;
        // 角色列表
        'RoleList': ListType<ResponseSimple.RoleList[]>;
        // 角色详情
        'RoleInfo': ResponseSimple.RoleInfo;
        // 账号列表
        'UserList': ListType<ResponseUser.List[]>;
        // 账号详情
        'UserInfo': ResponseUser.Info;
        // 账号微信信息
        'WxInfo': ResponseUser.WxInfo;
        // 客户列表
        'OrgList': ListType<ResponseOrg.OrgList[]>;
        // 客户详情
        'OrgInfo': ResponseOrg.Detail;
        // 用户已拥有权限
        'UserAuthInfo': ResponseUser.UserAuthInfo[];
        // 设备列表
        'DeviceList': ListType<ResponseDevice.List[]>;
        // 设备详情
        'DeviceInfo': ResponseDevice.Info;
        // 设备配置
        'DeviceConfig': ResponseDevice.Config;
        // 设备分组列表
        'DeviceGroupList': ListType<ResponseDevice.DeviceGroupList[]>;
        // 设备分组下的设备
        'DeviceGroupDevice': ResponseDevice.DeviceGroupDevice;
        // 文件仓库列表
        'FileList': ListType<ResponseFile.List[]>;
        // 配置列表
        'ConfigList': ListType<ResponseConfig.List[]>;
        // 下发记录列表
        'DistributionLogList': ListType<ResponseConfig.DistributionLogList[]>;
        // 下发结果
        'DistributionInfo': ListType<ResponseConfig.DistributionInfo[]>;
        // 常用地址列表
        'UsualAddressList': ListType<ResponseMap.UsualAddressList[]>;

        // 平面图列表
        'PlanList': ListType<ResponseSimple.PlanList[]>;
        // 平面图详情
        'PlanInfo': ResponseSimple.PlanFileInfo;
        // 离线地图的所有标点
        'OfflineMarkers': Partial<Pick<ResponseMap.OnlineMarkers, 'd' | 'f' | 'p'>>;
        // 离线地图树形
        'OffLineTree': ResponseSimple.OffLineTree[];
    }

    // 前端请求参数
    interface Parameter {
        // 登录
        'Login': {
            mobile: number | string;
            password: string;
            type: number;
            force?: number;
        }
        // 安装包
        'Package': {
            type?: 1 | 2 | 3 | 4;
        }
        // 上传安装包
        'SetPackage': {
            type: number;
            version_name: string;
            version_no: string;
            remark?: string;
            url: string;
        }
        // 设置菜单
        'SetMenu': {
            type: TypeAlias;
            id?: number;
            module: string;
            title: string;
            pid?: number;
            url_value?: string;
            value: string;
            online_hide?: number | boolean;
            icon: string;
            ismenu: number | boolean;
            sort: number;
            roles: number[]
        }
        // 操作记录
        'OperationLog': RequestPage & {
            op?: string;
            obj?: string;
            starttime?: string;
            endtime?: string;
        }
        // 角色列表
        'RoleList': RequestPage & { org_id: number; name?: string; };
        // 设置角色
        'setRole': {
            type: TypeAlias;
            name: string;
            org_id: number;
            description?: string;
            menu_auth: (string | number)[];
        }
        // 账号列表
        'UserList': RequestPage & {
            org_id?: number;
            orgname?: string;
            username?: string;
            mobile?: number;
            status: number;
            bindwx?: 0 | 1;
        }
        // 添加账号
        'SetUser': {
            username: string;
            mobile: string;
            password?: string;
            email?: string;
            avatar?: string;
            qqnum?: number | string;
            department?: string;
            address?: string | number;
            belong_org?: number;
            role?: number;
        }
        // 修改账号
        'editUser': Parameter['SetUser'] & { id?: number; }
        // 禁用启用账号
        'Forbidden': {
            ids: number[];
            status: number;
        }
        // 个人设置
        'PersonalSettings': Parameter['SetUser'] & { goto?: string; gotoname?: string; notices: number; }
        // 客户列表
        'OrgList': RequestPage & Region & {
            org_id?: number;
            code?: string;
            name?: string;
            orgtype?: string;
            industy?: string;
            orgclassify?: string;
            orgnature?: string;
            orgattr?: string;
            filtermap?: 0 | 1;
            sort?: string;
            sort_d?: SortDecDirection;
            withjg?: number;
            admin_area?: string[];
        }
        // 设置客户列表
        'SetOrg': Region & Partial<Location> & {
            type: TypeAlias;
            id?: number;
            name: string;
            address: string;
            remark?: string;
            adminor?: string;
            adminor_phone?: number | string;
            lng: string;
            lat: string;
        }
        // 设置用户权限
        'SetUserAuth': {
            id: number;
            auth: number[];
        }
        // 设备列表
        'DeviceList': RequestPage & Region & {
            org_id?: number;
            orgname?: string;
            uuid?: string;
            name?: string;
            isonline?: number;
            address: string;
            signal?: number | string;
            battery?: number | string;
        }
        // 修改设备
        'EditDevice': Region & Partial<Location> & {
            type: TypeAlias;
            id?: number;
            name: string;
            address?: string;
            gid: number[];
            lng: string;
            lat: string;
            adminor?: string;
            adminor_phone?: number | string;
        }
        'DevicePreview': {
            content: object;
        }
        // 设备分组列表
        'DeviceGroupList': RequestPage & Region & {
            org_id?: number;
            orgname?: string;
            code?: string;
            name?: string;
            remark?: string;
        }
        // 设置设备分组
        'SetDeviceGroup': {
            type: TypeAlias;
            id?: number;
            org_id?: number;
            name: string;
            remark?: string;
        }
        // 设置设备下的设备
        'SetDeviceGroupDevice': {
            id?: number;
            devices?: string[];
        }
        // 文件仓库列表
        'FileList': RequestPage & Region & {
            org_id?: number,
            orgname?: string,
            name?: string,
            size?: string,
            t?: string,
            t_name?: string,
            path?: string,
        }
        // 上传文件
        'UploadFile': {
            org_id: number;
            name: string;
            t: string;
            file: string;
            cover?: number;
        }
        // 配置列表
        'ConfigList': RequestPage & Region & {
            org_id?: number,
            orgname?: string,
            name?: string,
            content?: string,
            creatertime?: string,
            creater?: string,
            creater_name?: string,
        }
        // 设置配置内容
        'ConfigContent': {
            multipleConfig: Parameter['ConfigContentMultipleConfig'][];
        }
        'ConfigContentMultipleConfig': {
            t: string;
            display: any;
            time: string;
            audio: any;
        }
        // 设置配置
        'SetConfig': {
            type: TypeAlias;
            id?: number;
            org_id: number;
            name: string;
            content: string;
        }
        // 设置下发配置或文件到设备
        'ConfigOrFile': {
            t: string;
            config_id: number;
            file_id: number;
            files: number[];
            devices: number[];
        }
        // 下发记录列表
        'DistributionLogList': RequestPage & Region & {
            org_id: number;
            t: string;
            t_name: string;
            content: string;
            creatertime: string;
            creater: string;
            creater_name: string;
        }
        // 下发结果
        'DistributionInfo': {
            devices: number[];
        }
        // 常用地址列表
        'UsualAddressList': RequestPage & { name?: string; };
        // 设置常用地址
        'UsualAddressInfo': Location & {
            type: number;
            id?: number;
            name: string;
            address: string;
            zoom: number;
        }

        // 平面图列表
        'PlanList': RequestPage & {
            org_id?: number;
            name?: string;
            org_name?: string;
            sort?: string;
        }
        // 设置平面图
        'SetPlan': Partial<Location> & {
            type: number;
            id?: number;
            org_id: number;
            name: string;
            img: string;
            p_id?: string;
        }
        // 平面图布点
        'PlanDistribution': {
            map_id: number;
            marker_type: string;
            flag: string;
            lng: string;
            lat: string;
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
    // 基础数据列表的类型 -> 单位类别(A), 所属行业(B), 行政区域(E);
    type BasicDataType = 'A' | 'B' | 'E';
    // 其它机构的属性 -> 监管单位(jg), 被监管单位(bjg), 行政主管单位(xz), 维保单位(xf), 消防主管部门(fire),平台(pt), 微型消防站(xfz), 网格化管理(wg), 河长制(lk), 租户(zh), 环保主管单位(hb) 水务主管部门(sw) 安监主管部门(aj) 综治主管部门(zz) 党建主管部门(dj) 社区主管部门(sq) 管网主管部门(gw);
    type OrgType = 'jg' | 'bjg' | 'xz' | 'xf' | 'fire' | 'pt' | 'xfz' | 'wg' | 'lk' | 'zh' | 'hb' | 'sw' | 'aj' | 'zz' | 'dj' | 'sq';
    // 单位性质 -> 机关(office), 团体(group), 企业(enterprise), 事业(cause), 其他(other);
    type OrgNature = 'office' | 'group' | 'enterprise' | 'cause' | 'other';
    // 单位分级 -> 消防安全重点单位(important), 消防安全一般单位(common), 消防安全事故单位(accident);
    type OrgClassify = 'important' | 'common' | 'accident';
    // 列表排序方向 -> desc(降序), asc(升序);
    type SortDecDirection = 'desc' | 'asc';
    type Region = {
        province?: string;
        city?: string;
        area?: string;
        county?: string;
        street?: string;
    }
    type Location = {
        lng: string;
        lat: string;
    }
    type PointType = 'o' | 'd';
    type PointDatum = {
        o: ResponseMap.O[];
        d: ResponseMap.D[];
    }
    // 添加编辑时 type 的别名
    type TypeAlias = number;
    // type TypeAlias = 1 | 2;
    // 添加编辑时根据 type 判断 id 是否传递
    type isRequireId<T extends 1 | 2> = { type: T } & (T extends 1 ? {} : { id: number });
    // 获取详情
    interface GetDetails {
        id: number;
    }
    // 列表分页参数筛选
    interface RequestPage {
        pageSize?: number;
        pageNum?: number;
    }
}