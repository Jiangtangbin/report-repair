import Vue from 'vue';
import { Button, Tag, TableColumn, TableColumnRenderParams } from 'view-design';
import Wait from '@/components/common/wait.vue'; // 等待组件
import SvgIcon from '@/components/svg-icon/index.vue'; // svg 组件
import { mergeRegion, getCountDown, mobileMask, mobileIdentify } from '@/utils/utils';
import { i18n } from '@/locale/index';

const vueInstance = new Vue();

export type Trees = {
    title: string;
    value: string;
    type: GlobalCustomDicts.CustomDictsKey;
    params?: GlobalCustomDicts.CustomDictsValue;
    uniqueKey?: string; // 用于提交值的 key，默认取 value -> 针对提交的值
    levelKey?: string[]; // 不同层级取不同的值提交 -> 针对提交的键，优先取数据中的 _type 的值
    parseData?(item: any): void; // 对参数进行处理
    loadData?(item: any, key: string): any[] | Promise<any[]>; // 异步加载数据时提供的函数
    options: any[];
};

// 操作记录列表
export function operationLog(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.operationLog.operationUser') as string);
            },
            key: 'username',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.operationLog.implementOperation') as string);
            },
            key: 'op_name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.operationLog.operationObj') as string);
            },
            key: 'obj',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.operationLog.operationTime') as string);
            },
            key: 'time',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.operationLog.operationResult') as string);
            },
            key: 'status',
            sortable: 'custom',
            render(h?, data?) {
                const { row: { status }} = data as any;
                const text = status ? i18n.t('h.common.success') as string : i18n.t('h.common.fail') as string;
                const color = status ? 'success' : 'error';
                return h!(Tag, { props: { color }}, text);
            },
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.operationLog.errorCause') as string);
            },
            key: 'msg',
        },
    ];
}

// 账号管理列表
export function accountNumberManage(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.name') as string);
            },
            key: 'username',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.mobile') as string);
            },
            key: 'mobile',
            render(h?: CreateElement, data?) {
                const { row: { mobile }} = data as any;
                return h!('span', mobileMask(mobile) as string);
            },
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.roleName') as string);
            },
            key: 'role_name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.customerName') as string);
            },
            key: 'org_name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.weChat') as string);
            },
            key: 'wx',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.status') as string);
            },
            key: 'status',
            render(h?, data?) {
                const { row: { status }} = data as any;
                return h!('span', status ? i18n.t('h.status.enable') as string : i18n.t('h.status.unable') as string);
            },
        },
    ];
}

// 客户管理列表
export function customerManage(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.name') as string);
            },
            key: 'name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.customerCode') as string);
            },
            key: 'code',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.city') as string);
            },
            key: 'city_name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.area') as string);
            },
            key: 'area_name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.adminor') as string);
            },
            key: 'adminor',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.adminorPhone') as string);
            },
            key: 'adminor_phone',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.address') as string);
            },
            key: 'address',
        },
    ];
}

// 知识库管理列表
export function knowLedgeManage(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.title') as string);
            },
            key: 'title',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.publishPeople') as string);
            },
            key: 'creater_name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.publishTime') as string);
            },
            key: 'create_time',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.readingNum') as string);
            },
            key: 'num',
            sortable: 'custom',
        },
    ];
}

// 公告管理列表
export function noticeManage(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.title') as string);
            },
            key: 'title',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.publishStatus') as string);
            },
            key: 'publish_status',
            render(h?, data?) {
                const { row: { publish_status }} = data as any;
                return h!('span', publish_status === 'unpublished' ? i18n.t('h.status.unpublished') as string : i18n.t('h.status.published') as string);
            },
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.createrPeople') as string);
            },
            key: 'creater_name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.createrTime') as string);
            },
            key: 'create_time',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.publishPeople') as string);
            },
            key: 'publish_name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.publishTime') as string);
            },
            key: 'publishtime',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.readingNum') as string);
            },
            key: 'num',
            sortable: 'custom',
        },
    ];
}

// 工单列表
export function work(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.index') as string);
            },
            align: 'center',
            type: 'index',
            width: 80,
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.work.workno') as string);
            },
            align: 'center',
            key: 'workno',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.work.workstatus') as string);
            },
            align: 'center',
            key: 'workstatus_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.work.worktype') as string);
            },
            align: 'center',
            key: 'worktype_name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.work.worklevel') as string);
            },
            align: 'center',
            key: 'worklevel_name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.work.event_name') as string);
            },
            align: 'center',
            key: 'event_name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.work.obj') as string);
            },
            align: 'center',
            key: 'obj',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.work.createtime') as string);
            },
            align: 'center',
            key: 'createtime',
            sortable: 'custom',
        },
    ];
}

// 树形结构数据
const possibleLevel = {
    E: ['province', 'city', 'area', 'county', 'street'],
    device: ['category', 'sub_category'],
};

// 基础类型筛选
export const baseTrees: () => Trees[] = () => [
    {
        title: 'h.tree.region',
        value: 'E',
        type: 'unit',
        params: 'E',
        levelKey: possibleLevel.E,
        options: [],
    },
    {
        title: 'h.tree.category',
        value: 'orgtype',
        type: 'unit',
        params: 'A',
        options: [],
    },
    {
        title: 'h.tree.industy',
        value: 'industy',
        type: 'unit',
        params: 'B',
        options: [],
    },
];

// 区域筛选
export const regionTrees: () => Trees[] = () => [
    {
        title: 'h.tree.region',
        value: 'E',
        type: 'unit',
        params: 'E',
        levelKey: possibleLevel.E,
        options: [],
    },
];

// 弹窗下的列表，机构
export function popupOrg<T extends Vue>(instance: T, field: string = 'org_id'): TableColumn[] {
    return [
        {
            type: 'index',
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.index') as string);
            },
            align: 'center',
            width: 80,
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.title') as string);
            },
            key: 'name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.address') as string);
            },
            key: 'address',
            ellipsis: true,
            tooltip: true,
        },
        {
            width: 90,
            renderHeader(h) {
                return h!(
                    Button,
                    { props: { type: 'text' }, on: { click: () => (instance as any).selectCard(field) }},
                    i18n.t('h.tableButton.plus') as string
                );
            },
            render(h, params) {
                return h!(
                    Button,
                    {
                        props: { type: 'text' }, on: { click: () => (instance as any).delReceiveItem(field, params!.index) },
                    },
                    i18n.t('h.tableButton.delete') as string
                );
            },
        },
    ];
}

// 账户
export function popupUser<T extends Vue>(instance: T, field: string = 'user'): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.title') as string);
            },
            key: 'username',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.orgname') as string);
            },
            key: 'orgname',
            ellipsis: true,
            tooltip: true,
        },
        {
            width: 90,
            renderHeader(h) {
                return h!(
                    Button,
                    { props: { type: 'text' }, on: { click: () => (instance as any).selectCard(field) }},
                    i18n.t('h.tableButton.plus') as string
                );
            },
            render(h, params) {
                return h!(
                    Button,
                    {
                        props: { type: 'text' }, on: { click: () => (instance as any).delReceiveItem(field, params!.index) },
                    },
                    i18n.t('h.tableButton.delete') as string
                );
            },
        },
    ];
}

// 树形结构
export function popupTree<T extends Vue>(instance: T, field: string = 'admin_area'): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.title') as string);
            },
            key: 'title',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.code') as string);
            },
            key: 'value',
            ellipsis: true,
            tooltip: true,
        },
        {
            width: 90,
            renderHeader(h) {
                return h!(
                    Button,
                    { props: { type: 'text' }, on: { click: () => (instance as any).selectTree(field) }},
                    i18n.t('h.tableButton.plus') as string
                );
            },
            render(h, params) {
                return h!(
                    Button,
                    {
                        props: { type: 'text' }, on: { click: () => (instance as any).delReceiveItem(field, params!.index) },
                    },
                    i18n.t('h.tableButton.delete') as string
                );
            },
        },
    ];
}

// 工单接收人
export function popupReceive<T extends Vue>(instance: T, field: string = 'recieve'): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.index') as string);
            },
            type: 'index',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.title') as string);
            },
            key: 'username',
            ellipsis: true,
            tooltip: true,
        },
        {
            width: 90,
            renderHeader(h) {
                return h!(
                    Button,
                    { props: { type: 'text' }, on: { click: () => (instance as any).selectCard(field) }},
                    i18n.t('h.tableButton.plus') as string
                );
            },
            render(h, params) {
                return h!(
                    Button,
                    { props: { type: 'text' }, on: { click: () => (instance as any).delReceiveItem(field, params!.index) }},
                    i18n.t('h.tableButton.delete') as string
                );
            },
        },
    ];
}
