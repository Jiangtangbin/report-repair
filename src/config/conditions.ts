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

// 操作记录查询条件
export function operationLogCondition(): Options {
    return {
        backfill: {},
        selects: {
            op: {
                name: '',
                placeholder: 'h.placeholder.pleaseSelectOperationType',
                type: 'dict',
                params: 9,
                options: [],
            },
        },
        inputs: {
            title: '',
            value: 'username',
            options: [
                {
                    title: 'h.table.operationLog.operationObj',
                    value: 'obj',
                },
                {
                    title: 'h.table.operationLog.operationUser',
                    value: 'username',
                },
                {
                    title: 'h.table.operationLog.startTime',
                    value: 'starttime',
                },
                {
                    title: 'h.table.operationLog.endTime',
                    value: 'endtime',
                },
            ],
        },
    };
}

// 账号管理查询条件
export function accountNumberManageCondition(): Options {
    return {
        backfill: {},
        selects: {},
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
                    value: 'org_name',
                },
                {
                    title: 'h.table.roleName',
                    value: 'role_name',
                },
            ],
        },
    };
}

// 客户管理查询条件
export function customerCondition(): Options {
    return {
        backfill: {},
        selects: {},
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
                {
                    title: 'h.table.address',
                    value: 'address',
                },
                {
                    title: 'h.table.city',
                    value: 'city',
                },
                {
                    title: 'h.table.area',
                    value: 'area',
                },
            ],
        },
    };
}
