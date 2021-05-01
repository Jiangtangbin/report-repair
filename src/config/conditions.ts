export interface ICondition {
    options: IConditionOption[];
    title: string;
    value: string | number;
    placeholder?: string;
}
export interface IConditionOption {
    title: string;
    value: string | number;
}

export interface IConditionSelectOption<T extends GlobalCustomDicts.CustomDicts, K extends keyof GlobalCustomDicts.CustomDicts> {
    options: T[K]['response']['data'] | IConditionOption[];
    name: string | number | string[] | number[];
    placeholder?: string;
    type?: T[K]['type'];
    params?: T[K]['params'];
}

export type IConditionSelect = {
    [key: string]: IConditionSelectOption<GlobalCustomDicts.CustomDicts, keyof GlobalCustomDicts.CustomDicts>;
}
export type IConditionTreeSelect = {
    [key: string]: IConditionSelectOption<GlobalCustomDicts.CustomDicts, keyof GlobalCustomDicts.CustomDicts> & { multiple?: boolean; };
}
export type Options = {
    // 防止 list 组件无法监听到 backfill 的改变，所以提前声明占个位
    backfill: Record<string, any>;
    inputs: ICondition;
    selects?: IConditionSelect;
    treeSelects?: IConditionTreeSelect;
};

// 设备大小类调整，改为多选
// const device = JSON.parse(JSON.stringify(deviceCondition(true)));
// Object.assign(device.treeSelects!.device, { name: [], multiple: true, maxTagCount: 4 });

// 将地图上可能存在的标点类型聚合到一起
export const mapConditions = {
    // d: () => JSON.parse(JSON.stringify(device)),
};

/**
 * 基础的状态筛选条件提取出来
 */
const status = [
    {
        title: 'h.status.enable',
        value: '1',
    },
    {
        title: 'h.status.unable',
        value: '0',
    },
];
const isonline = [
    {
        title: 'h.status.online',
        value: '1',
    },
    {
        title: 'h.status.offline',
        value: '0',
    },
];

// 操作记录查询条件
export function operationLogCondition(): Options {
    return {
        backfill: {},
        selects: {
            op: {
                name: '',
                placeholder: 'h.placeholder.pleaseSelectOperationType',
                type: 'dict',
                params: 254,
                options: [],
            },
        },
        inputs: {
            title: '',
            value: 'username',
            options: [
                {
                    title: 'h.table.operationLog.operationUser',
                    value: 'username',
                },
                {
                    title: 'h.table.operationLog.operationObj',
                    value: 'obj',
                },
            ],
        },
    };
}

// 角色管理查询条件
export function roleManageCondition(): Options {
    return {
        backfill: {},
        inputs: {
            title: '',
            value: 'name',
            options: [
                {
                    title: 'h.table.name',
                    value: 'name',
                },
            ],
        },
    };
}

// 账号管理查询条件
export function accountNumberManageCondition(): Options {
    return {
        backfill: {},
        selects: {
            status: {
                name: '',
                placeholder: 'h.table.statusFilter',
                options: status,
            },
        },
        inputs: {
            title: '',
            value: 'username',
            options: [
                {
                    title: 'h.table.accountNumber',
                    value: 'username',
                },
                {
                    title: 'h.table.mobile',
                    value: 'mobile',
                },
                {
                    title: 'h.table.customerName',
                    value: 'orgname',
                },
                {
                    title: 'h.table.roleName',
                    value: 'rolename',
                },
            ],
        },
    };
}

// 客户管理查询条件
export function customerCondition(): Options {
    return {
        backfill: {},
        selects: {
            orgattr: {
                name: '',
                placeholder: 'h.placeholder.pleaseSelectCustomerType',
                type: 'dict',
                params: 9,
                options: [],
            },
        },
        inputs: {
            title: '',
            value: 'name',
            options: [
                {
                    title: 'h.table.name',
                    value: 'name',
                },
                {
                    title: 'h.table.customerCode',
                    value: 'code',
                },
            ],
        },
    };
}

// 设备管理查询条件
export function deviceCondition(hasTreeSelects = false): Options {
    return {
        backfill: {},
        // 右键菜单的更多条件
        // treeSelects: !hasTreeSelects ? undefined : {
        //     device: {
        //         name: '',
        //         placeholder: 'h.placeholder.pleaseSelectDeviceType',
        //         type: 'device',
        //         params: 'device',
        //         options: [],
        //     },
        // },
        selects: {
            isonline: {
                name: '',
                placeholder: 'h.placeholder.pleaseSelectOnlineOrOfflineDevice',
                options: isonline,
            },
        },
        inputs: {
            title: '',
            value: 'name',
            options: [
                {
                    title: 'h.table.name',
                    value: 'name',
                },
                {
                    title: 'h.table.customerName',
                    value: 'orgname',
                },
                {
                    title: 'h.table.serialNumber',
                    value: 'uuid',
                },
            ],
        },
    };
}

// 设备分组管理查询条件
export function deviceGroupCondition(): Options {
    return {
        backfill: {},
        inputs: {
            title: '',
            value: 'name',
            options: [
                {
                    title: 'h.table.name',
                    value: 'name',
                },
            ],
        },
    };
}

// 文件仓库管理查询条件
export function fileCondition(): Options {
    return {
        backfill: {},
        selects: {
            t: {
                name: '',
                placeholder: 'h.placeholder.pleaseSelectFileType',
                type: 'dict',
                params: 1,
                options: [],
            },
        },
        inputs: {
            title: '',
            value: 'name',
            options: [
                {
                    title: 'h.table.name',
                    value: 'name',
                },
                {
                    title: 'h.table.customerName',
                    value: 'orgname',
                },
            ],
        },
    };
}

// 配置管理查询条件
export function configCondition(): Options {
    return {
        backfill: {},
        inputs: {
            title: '',
            value: 'name',
            options: [
                {
                    title: 'h.table.name',
                    value: 'name',
                },
                {
                    title: 'h.table.customerName',
                    value: 'orgname',
                },
            ],
        },
    };
}

// 下发记录管理查询条件
export function distributeLogCondition(): Options {
    return {
        backfill: {},
        selects: {
            t: {
                name: '',
                placeholder: 'h.placeholder.pleaseSelectFileType',
                type: 'dict',
                params: 2,
                options: [],
            },
        },
        inputs: {
            title: '',
            value: 'creater_name',
            options: [
                {
                    title: 'h.table.distributeLogManage.distributePeople',
                    value: 'creater_name',
                },
                {
                    title: 'h.table.distributeLogManage.distributeDevice',
                    value: 'device_name',
                },
            ],
        },
    };
}

// 平面图管理查询条件
export function planCondition(): Options {
    return {
        backfill: {},
        inputs: {
            title: '',
            value: 'name',
            options: [
                {
                    title: 'h.table.name',
                    value: 'name',
                },
                {
                    title: 'h.table.customerName',
                    value: 'org_name',
                },
            ],
        },
    };
}