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
                    title: 'h.table.operationLog.operationUser',
                    value: 'username',
                },
                {
                    title: 'h.table.operationLog.operationObj',
                    value: 'obj',
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
                    title: 'h.table.name',
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
export function customerCondition(hasTreeSelects = false): Options {
    return {
        backfill: {},
        treeSelects: !hasTreeSelects ? undefined : {
            region: {
                name: '',
                placeholder: 'h.formLabel.region',
                type: 'unit',
                params: 'E',
                options: [],
            },
        },
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
            ],
        },
    };
}

// 知识库管理查询条件
export function knowledgeBaseCondition(): Options {
    return {
        backfill: {},
        selects: {},
        inputs: {
            title: '',
            value: 'title',
            options: [
                {
                    title: 'h.table.title',
                    value: 'title',
                },
            ],
        },
    };
}

// 公告管理查询条件
export function noticeCondition(): Options {
    return {
        backfill: {},
        selects: {
            publish_status: {
                name: '',
                placeholder: 'h.placeholder.pleaseSelectPublishStatus',
                type: 'dict',
                params: 10,
                options: [],
            },
        },
        inputs: {
            title: '',
            value: 'title',
            options: [
                {
                    title: 'h.table.title',
                    value: 'title',
                },
            ],
        },
    };
}

// 工单池管理查询条件
export function workPoolCondition(): Options {
    return {
        backfill: {},
        selects: {
            work_level: {
                name: '',
                placeholder: 'h.placeholder.pleaseSelectSLALevel',
                type: 'dict',
                params: 13,
                options: [],
            },
        },
        inputs: {
            title: '',
            value: 'work_code',
            options: [
                {
                    title: 'h.table.work.workNumber',
                    value: 'work_code',
                },
                {
                    title: 'h.table.affiliatedCustomer',
                    value: 'org_name',
                },
            ],
        },
    };
}