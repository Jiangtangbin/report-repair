import Vue, { VNode } from 'vue';
import { TableColumn } from 'view-design';
import {
    getOrgList, getUserList
} from '@/config/api';
import {
    Options, customerCondition, accountNumberManageCondition
} from './conditions';
import {
    Trees, customerManage, accountNumberManage
} from './columns';
import { i18n } from '@/locale/index';

export type PopupListField = 'customer' | 'account';

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
    account: {
        title: '账号列表',
        axios: getUserList,
        columns: accountNumberManage(),
        conditions: accountNumberManageCondition,
        showKey: 'username',
    },
    customer: {
        title: '客户列表',
        axios: getOrgList,
        columns: customerManage(),
        conditions: customerCondition,
        showKey: 'name',
    },
};

export default popupList;
