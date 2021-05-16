import Vue, { VNode } from 'vue';
import { TableColumn } from 'view-design';
import {
    getDeviceList, getOrgList, getRoleList, getDeviceGroupList, getConfigList, getFileList, getDistributionLogList, getPlanList
} from '@/config/api';
import {
    Options, deviceCondition, customerCondition, roleManageCondition, deviceGroupCondition, configCondition, fileCondition, distributeLogCondition, planCondition
} from './conditions';
import {
    Trees, deviceManage, customerManage, roleManage, deviceGroupManage, configManage, fileManage, distributeLogManage, planManage
} from './columns';
import {
    getRightMenu, orgHandle, mapDeviceHandle
} from '@/mixins/map';
import { i18n } from '@/locale/index';

export type PopupListField = 'device' | 'customer' | 'role' | 'deviceGroup' | 'config' | 'file' | 'distributeLog' | 'plan';

export type PopupList = Record<PopupListField, {
    title: string,
    axios: (...args: any[]) => Promise<IResponse<API.ListType<any[]>>>;
    columns: TableColumn[];
    conditions: () => Options;
    trees?: () => Trees[];
    showKey?: string;
    uniqueKey?: string;
}>;

type RightMenuOption = { title: string; value: string; icon: string; require?: string; requireValue?: string; };

/**
 * @description: 生成按钮
 * @param {Array} menus: 按钮数据信息
 * @param {Object} data: 数据项信息
 * @return {Array}
 */
function genRightMenu<T extends Dictionary<any>>(this: Vue, menus: RightMenuOption[], data: T, callback: (type: string, data: T) => void): VNode[] {
    const result: VNode[] = [];
    const h = this.$createElement;
    menus.every(v => {
        if (
            v.hasOwnProperty('require') && !(
                v.hasOwnProperty('requireValue')
                    ? v.requireValue === data[v.require!]
                    : data[v.require!]
            )
        ) return true;
        result.push(h(
            'span',
            { class: 'table-operation-btn-control', on: { click: () => callback.call(this, v.value, data) }, attrs: { title: i18n.te(v.title) ? i18n.t(v.title) : v.title }},
            [h('svg-icon', { class: 'c-p', props: { iconClass: v.icon }})]
        ));
        return true;
    });
    return result;
}

// 弹窗列表
const popupList: PopupList = {
    device: {
        title: '设备列表',
        axios: getDeviceList,
        columns: deviceManage(),
        conditions: deviceCondition,
        showKey: 'name',
    },
    customer: {
        title: '客户列表',
        axios: getOrgList,
        columns: customerManage(),
        conditions: customerCondition,
        showKey: 'name',
    },
    role: {
        title: '角色列表',
        axios: getRoleList,
        columns: roleManage(),
        conditions: roleManageCondition,
        showKey: 'name',
    },
    deviceGroup: {
        title: '设备分组列表',
        axios: getDeviceGroupList,
        columns: deviceGroupManage(),
        conditions: deviceGroupCondition,
        showKey: 'name',
    },
    config: {
        title: '配置列表',
        axios: getConfigList,
        columns: configManage(),
        conditions: configCondition,
        showKey: 'name',
    },
    file: {
        title: '文件列表',
        axios: getFileList,
        columns: fileManage(),
        conditions: fileCondition,
        showKey: 'name',
    },
    distributeLog: {
        title: '下发记录列表',
        axios: getDistributionLogList,
        columns: distributeLogManage(),
        conditions: distributeLogCondition,
        showKey: 'name',
    },
    plan: {
        title: '平面图列表',
        axios: getPlanList,
        columns: planManage(),
        conditions: planCondition,
        showKey: 'name',
    },
};

export default popupList;

// 地图附近资源 table columns
export function nearbyColumns(instance: Vue): Record<API.PointType | 'o', TableColumn[]> {
    return {
        o: [
            {
                type: 'index',
                renderHeader(h?: CreateElement) {
                    return h!('span', (i18n.t('h.table.index') as string));
                },
                align: 'center',
                width: 60,
            },
            {
                renderHeader(h?: CreateElement) {
                    return h!('span', (i18n.t('h.table.name') as string));
                },
                key: 'name',
                sortable: true,
            },
            {
                renderHeader(h?: CreateElement) {
                    return h!('span', (i18n.t('h.table.distance') as string));
                },
                key: 'distance',
                sortable: true,
            },
            {
                renderHeader(h?: CreateElement) {
                    return h!('span', (i18n.t('h.table.operation') as string));
                },
                width: 120,
                align: 'center',
                render(h?, data?) {
                    const { row } = data as any;
                    const btnDatum = getRightMenu('o', 'o').filter(v => v.value !== 'details') as RightMenuOption[];
                    return h!(
                        'div',
                        { on: { dblclick: (e: MouseEvent) => e.stopPropagation() }, class: 'table-operation' },
                        genRightMenu.call(instance, btnDatum, row, orgHandle),
                    );
                },
            },
        ],
        d: [
            {
                type: 'selection',
                width: 51,
            },
            {
                renderHeader(h?: CreateElement) {
                    return h!('span', (i18n.t('h.table.name') as string));
                },
                key: 'name',
                tooltip: true,
                ellipsis: true,
            },
            {
                renderHeader(h?: CreateElement) {
                    return h!('span', (i18n.t('h.table.customerName') as string));
                },
                key: 'orgname',
            },
            {
                renderHeader(h?: CreateElement) {
                    return h!('span', (i18n.t('h.table.distance') as string));
                },
                key: 'distance',
                sortable: true,
            },
            {
                renderHeader(h?: CreateElement) {
                    return h!('span', (i18n.t('h.table.operation') as string));
                },
                width: 120,
                align: 'center',
                render(h?, data?) {
                    const { row, row: { category, sub_category }} = data as any;
                    const unique = `${category}${sub_category}`;
                    const btnDatum = getRightMenu(unique, 'd', category, sub_category).filter(v => v.value !== 'details') as RightMenuOption[];
                    return h!(
                        'div',
                        { on: { dblclick: (e: MouseEvent) => e.stopPropagation() }, class: 'table-operation' },
                        genRightMenu.call(instance, btnDatum, row, mapDeviceHandle),
                    );
                },
            },
        ],
    };
}