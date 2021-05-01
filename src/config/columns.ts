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
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.operationLog.operationTime') as string);
            },
            key: 'time',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.operationLog.operationResult') as string);
            },
            key: 'status',
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

// 角色管理列表
export function roleManage(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.name') as string);
            },
            key: 'name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.code') as string);
            },
            key: 'code',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.description') as string);
            },
            key: 'description',
        },
    ];
}

// 账号管理列表
export function accountNumberManage(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.accountNumber') as string);
            },
            key: 'username',
            sortable: 'custom',
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
                return h!('span', i18n.t('h.table.status') as string);
            },
            key: 'status',
            render(h?, data?) {
                const { row: { status }} = data as any;
                return h!('span', status ? i18n.t('h.status.enable') as string : i18n.t('h.status.unable') as string);
            },
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.customerName') as string);
            },
            key: 'orgname',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.roleName') as string);
            },
            key: 'rolename',
            sortable: 'custom',
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
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.customerCode') as string);
            },
            key: 'code',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.type') as string);
            },
            key: 'orgattr_name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.address') as string);
            },
            key: 'address',
        },
    ];
}

// 设备管理列表
export function deviceManage(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.name') as string);
            },
            key: 'name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.customerName') as string);
            },
            key: 'orgname',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.onlineOrOffline') as string);
            },
            key: 'isonline',
            render(h?, data?) {
                const { row: { isonline }} =  data as any;
                return h!('span', isonline ? i18n.t('h.status.online') as string : i18n.t('h.status.offline') as string);
            },
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.deviceManage.signalIntensity') as string);
            },
            key: 'signal',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.deviceManage.electricityQuantity') as string);
            },
            key: 'battery',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.address') as string);
            },
            key: 'address',
        },
    ];
}

// 设备分组管理列表
export function deviceGroupManage(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.name') as string);
            },
            key: 'name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.code') as string);
            },
            key: 'code',
            ellipsis: true,
            tooltip: true,
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.customerName') as string);
            },
            key: 'orgname',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.remark') as string);
            },
            key: 'remark',
        },
    ];
}

// 文件仓库管理列表
export function fileManage(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.fileManage.fileName') as string);
            },
            key: 'name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.customerName') as string);
            },
            key: 'orgname',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.type') as string);
            },
            key: 't',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.fileManage.fileSize') as string);
            },
            key: 'size',
            render(h?, data?) {
                const { row: { size }} = data as any;
                return h!('span', `${Math.round(Number(size) / 1024)} KB`);
            },
        },
    ];
}

// 配置管理列表
export function configManage(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.configManage.configName') as string);
            },
            key: 'name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.customerName') as string);
            },
            key: 'orgname',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.createdTime') as string);
            },
            key: 'createtime',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.createdPeople') as string);
            },
            key: 'creater_name',
        },
    ];
}

// 下发记录管理列表
export function distributeLogManage(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.distributeLogManage.distributeType') as string);
            },
            key: 't_name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.distributeLogManage.distributeContent') as string);
            },
            key: 'content_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.distributeLogManage.distributePeople') as string);
            },
            key: 'creater_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.distributeLogManage.distributeTime') as string);
            },
            key: 'createtime',
        },
    ];
}

// 平面图管理列表
export function planManage(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.name') as string);
            },
            key: 'name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.customerName') as string);
            },
            key: 'org_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.parentName') as string);
            },
            key: 'p_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.plan') as string);
            },
            key: 'img',
            render(h?, data?) {
                const { row: { img }} =  data as any;
                return h!(
                    'img',
                    {
                        attrs: { src: img, preview: 'plan', class: 'c-p', style: 'width: 35px; display: flex;' },
                        on: { click: (vueInstance as any).$previewRefresh, error: vueInstance.globalImgFail },
                    },
                );
            },
        },
    ];
}

// 设备管理列表（弹出窗口下的列表）
export function popupDeviceManage<T extends Vue>(instance: T, field: string = 'devices'): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.name') as string);
            },
            key: 'name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.result') as string);
            },
            render(h, params) {
                const { row: { result }} = params;
                // 根据字典 3 返回，result => 'distributing' 'success' 'fail'
                if (result === 'success') {
                    return h!(
                        SvgIcon,
                        { class: 'correct', attrs: { iconClass: 'correct' }},
                    );
                } else if (result === 'fail') {
                    return h!(
                        SvgIcon,
                        { class: 'error', attrs: { iconClass: 'error' }},
                    );
                } else {
                    return h!(Wait);
                }
            },
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.reason') as string);
            },
            key: 'msg',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.time') as string);
            },
            key: 'time',
        },
        {
            width: 90,
            renderHeader(h) {
                return h!(
                    Button,
                    { props: { type: 'text' }, on: { click: () => (instance as any).selectCard(field) }},
                    i18n.t('h.tableButton.add') as string
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

// 配置管理列表（弹出窗口下的列表）
export function popupConfigManage(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.configManage.configName') as string);
            },
            key: 'name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.customerName') as string);
            },
            key: 'orgname',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.createdTime') as string);
            },
            key: 'createtime',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.createdPeople') as string);
            },
            key: 'creater_name',
        },
    ];
}

// 下发结果列表（弹出窗口下的列表）
export function popupDistributeResult(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.name') as string);
            },
            key: 'device_name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.time') as string);
            },
            key: 'time',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.result') as string);
            },
            render(h, params) {
                const { row: { result }} = params;
                // 根据字典 3 返回，result => 'distributing' 'success' 'fail'
                if (result === 'distributing') {
                    return h!(Wait);
                } else if (result === 'success') {
                    return h!(
                        SvgIcon,
                        { class: 'correct', attrs: { iconClass: 'correct' }},
                    );
                } else {
                    return h!(
                        SvgIcon,
                        { class: 'error', attrs: { iconClass: 'error' }},
                    );
                }
            },
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.reason') as string);
            },
            key: 'msg',
        },
    ];
}

// 设备分组管理列表（弹出窗口下的列表）
export function popupDeviceGroupManage<T extends Vue>(instance: T, field: string = 'gid'): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.name') as string);
            },
            key: 'name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.code') as string);
            },
            key: 'code',
            ellipsis: true,
            tooltip: true,
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.customerName') as string);
            },
            key: 'orgname',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.remark') as string);
            },
            key: 'remark',
        },
        {
            width: 90,
            renderHeader(h) {
                return h!(
                    Button,
                    { props: { type: 'text' }, on: { click: () => (instance as any).selectCard(field) }},
                    i18n.t('h.tableButton.add') as string
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

// 角色管理列表（弹出窗口下的列表）
export function popupRole<T extends Vue>(instance: T, field: string = 'role'): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.name') as string);
            },
            key: 'name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.code') as string);
            },
            key: 'code',
        },
        {
            width: 90,
            renderHeader(h) {
                return h!(
                    Button,
                    { props: { type: 'text' }, on: { click: () => (instance as any).selectCard(field) }},
                    i18n.t('h.tableButton.add') as string
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

// 文件仓库管理列表（弹出窗口下的列表）
export function popupFile<T extends Vue>(instance: T, field: string = 'files'): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.fileManage.fileName') as string);
            },
            key: 'name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.customerName') as string);
            },
            key: 'orgname',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.type') as string);
            },
            key: 't',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.fileManage.fileSize') as string);
            },
            key: 'size',
            render(h?, data?) {
                const { row: { size }} = data as any;
                return h!('span', `${Math.round(Number(size) / 1024)} KB`);
            },
        },
        {
            width: 90,
            renderHeader(h) {
                return h!(
                    Button,
                    { props: { type: 'text' }, on: { click: () => (instance as any).selectCard(field) }},
                    i18n.t('h.tableButton.add') as string
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

// 行政区域列表
export function admin(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.title') as string);
            },
            key: 'title',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.code') as string);
            },
            key: 'value',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.p_name') as string);
            },
            key: 'p_name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.p_code') as string);
            },
            key: 'p_code',
        },
    ];
}

// 车辆列表
export function car(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.condition.car.code') as string);
            },
            key: 'code',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.condition.car.brand') as string);
            },
            key: 'brand',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.condition.car.category') as string);
            },
            key: 'category',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.condition.car.carmodel') as string);
            },
            key: 'carmodel',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.condition.car.powerType') as string);
            },
            key: 'power_name',
        },
    ];
}

// 人员列表
export function person(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.member.name') as string);
            },
            key: 'name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.member.identify') as string);
            },
            key: 'identify',
            render(h?: CreateElement, data?) {
                const { row: { identify }} = data as any;
                return h!('span', mobileIdentify(identify) as string);
            },
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.member.sex') as string);
            },
            key: 'sex_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.member.native_place') as string);
            },
            key: 'native_place_name',
        },
    ];
}

// 老人管理人员列表
export function elderlyPerson(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.member.name') as string);
            },
            key: 'name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.member.identify') as string);
            },
            key: 'identify',
            render(h?: CreateElement, data?) {
                const { row: { identify }} = data as any;
                return h!('span', mobileIdentify(identify) as string);
            },
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.member.sex') as string);
            },
            key: 'sex_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.member.native_place') as string);
            },
            key: 'native_place_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.person.mtype') as string);
            },
            key: 'mtype_name',
        },
    ];
}

// 小区列表
export function village(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.title') as string);
            },
            key: 'name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.village.address') as string);
            },
            key: 'address',
        },
    ];
}

// 楼栋列表
export function build(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.buildNumber') as string);
            },
            key: 'name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.build.village_name') as string);
            },
            key: 'village_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.build.jwh') as string);
            },
            key: 'jwh',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.build.address') as string);
            },
            key: 'address',
        },
    ];
}

// 楼层列表
export function floor(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.title') as string);
            },
            key: 'name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.buildname') as string);
            },
            key: 'build_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.build.village_name') as string);
            },
            key: 'village_name',
        },
    ];
}

// 房间列表
export function room(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.roomNumber') as string);
            },
            key: 'name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.floorname') as string);
            },
            key: 'floor_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.buildname') as string);
            },
            key: 'build_name',
        },
    ];
}

// 房间申报列表
export function sbHistory(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.room.room_name') as string);
            },
            key: 'room_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.room.sb_mobile') as string);
            },
            key: 'mobile',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.emergencyInfo.region') as string);
            },
            key: 'area_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.build.village_name') as string);
            },
            key: 'village_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.buildname') as string);
            },
            key: 'build_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.floorname') as string);
            },
            key: 'floor_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.room.sb_time') as string);
            },
            key: 'time',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.status') as string);
            },
            key: 'verify',
            render(h?, data?) {
                const { row: { verify }} = data as any;
                return h!('span', verify === 1 ? i18n.t('h.status.adopt') as string : verify === 2 ? i18n.t('h.common.fail') as string : i18n.t('h.condition.noVerify') as string);
            },
        },
    ];
}

// 房间复核列表
export function roomReviewLog(): TableColumn[] {
    return [
        {
            type: 'index',
            title: '序号',
            width: 80,
            align: 'center',
        },
        {
            title: '检查人',
            key: 'username',
            sortable: 'custom',
            align: 'center',
        },
        {
            title: '所属区域',
            key: 'area_name',
            align: 'center',
        },
        {
            title: '所属小区',
            key: 'village_name',
            align: 'center',
        },
        {
            title: '所属楼栋',
            key: 'build_name',
            align: 'center',
        },
        {
            title: '单元名称',
            key: 'floor_name',
            align: 'center',
        },
        {
            title: '房间号',
            key: 'room_name',
            align: 'center',
        },
        {
            title: '检查时间',
            key: 'time',
            align: 'center',
        },
        {
            title: '检查对象',
            key: 'code_name',
            align: 'center',
        },
    ];
}

// 其它机构列表
export function tenant(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.title') as string);
            },
            key: 'name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.code') as string);
            },
            key: 'code',
            ellipsis: true,
            tooltip: true,
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.region') as string);
            },
            key: 'region',
            ellipsis: true,
            tooltip: true,
            render(h?, data?) {
                const { row } = data as any;
                return h!('span', mergeRegion(row));
            },
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.address') as string);
            },
            key: 'address',
            sortable: 'custom',
            ellipsis: true,
            tooltip: true,
        },
    ];
}

// 部门列表
export function department(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.title') as string);
            },
            key: 'name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.unitname') as string);
            },
            key: 'orgname',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.department.remark') as string);
            },
            key: 'remark',
            ellipsis: true,
            tooltip: true,
        },
    ];
}

// 设备运维记录列表
export function deviceOperation(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.title') as string);
            },
            key: 'device_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.orgname') as string);
            },
            key: 'orgname',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.deviceOperation.op_type') as string);
            },
            key: 'op_type_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.deviceOperation.user') as string);
            },
            key: 'username',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.deviceOperation.reportTime') as string);
            },
            key: 'time',
        },
    ];
}

// 报警联动列表
export function linkage(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.device.name') as string);
            },
            key: 'name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.device.fullname') as string);
            },
            key: 'fullname',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.orgname') as string);
            },
            key: 'orgname',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.device.sub_category') as string);
            },
            key: 'sub_category_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.linkage.event') as string);
            },
            key: 'event_name',
            sortable: 'custom',
        },
    ];
}

// 报警日志列表
export function alarmLog(): TableColumn[] {
    return [
        {
            type: 'index',
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.index') as string);
            },
            width: 80,
            align: 'center',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.alarmObj') as string);
            },
            key: 'objname',
            align: 'center',
            sortable: 'custom',
            render(h?, data?) {
                const { row: { device_name, patrol_name, patrol_type_name, code, point }} = data as any;
                return h!('span', device_name || patrol_name || (patrol_type_name && `${patrol_type_name}${code}${point || ''}`));
            },
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.orgname') as string);
            },
            key: 'orgname',
            align: 'center',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.isHandle') as string);
            },
            key: 'status',
            align: 'center',
            render(h?, data?) {
                const { row: { status }} = data as any;
                return h!('span', status ? i18n.t('h.status.disposed') as string : i18n.t('h.status.undisposed') as string);
            },
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.alarms.event_name') as string);
            },
            key: 'event_name',
            align: 'center',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.alarms.descs') as string);
            },
            key: 'descs',
            align: 'center',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.alarms.time') as string);
            },
            key: 'time',
            align: 'center',
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

// 设施列表
export function facility(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.name') as string);
            },
            key: 'code',
            sortable: 'custom',
            ellipsis: true,
            tooltip: true,
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.orgname') as string);
            },
            key: 'orgname',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.type') as string);
            },
            key: 'patrol_type_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.facility.adminor') as string);
            },
            key: 'adminor',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.region') as string);
            },
            key: 'region',
            ellipsis: true,
            tooltip: true,
            render(h?, data?) {
                const { row } = data as any;
                return h!('span', mergeRegion(row));
            },
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.address') as string);
            },
            key: 'point',
        },
    ];
}

// 巡查点列表
export function patrol(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.title') as string);
            },
            key: 'name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.orgname') as string);
            },
            key: 'orgname',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.type') as string);
            },
            key: 'point_type_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.address') as string);
            },
            key: 'point',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.patrol.tag') as string);
            },
            key: 'tag',
            sortable: 'custom',
        },
    ];
}

// 检查项列表
export function checkStandard(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.title') as string);
            },
            key: 'name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.score') as string);
            },
            key: 'score',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.code') as string);
            },
            key: 'code',
            sortable: 'custom',
        },
    ];
}

// 检查类型列表
export function checkType(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.title') as string);
            },
            key: 'name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.belong') as string);
            },
            key: 't_name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.code') as string);
            },
            key: 'code',
            sortable: 'custom',
        },
    ];
}

// 任务列表
export function task(): TableColumn[] {
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
                return h!('span', i18n.t('h.table.task.name') as string);
            },
            align: 'center',
            key: 'name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.unitname') as string);
            },
            align: 'center',
            key: 'org_name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.task.create_name') as string);
            },
            align: 'center',
            key: 'create_name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.task.taskStatus') as string);
            },
            align: 'center',
            key: 'status_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.remark') as string);
            },
            align: 'center',
            key: 'remark',
        },
    ];
}

// 周期性任务模板列表
export function cycleTask(): TableColumn[] {
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
                return h!('span', i18n.t('h.table.task.name') as string);
            },
            align: 'center',
            key: 'name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.unitname') as string);
            },
            align: 'center',
            key: 'orgname',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.task.datetype') as string);
            },
            align: 'center',
            key: 'datetype_name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.cycleTask.tempStatus') as string);
            },
            align: 'center',
            key: 'status',
            render(h?, data?) {
                const { row: { status }} = data as any;
                return h!('span', status ? i18n.t('h.status.enable') as string : i18n.t('h.status.unable') as string);
            },
        },
    ];
}

// 巡查隐患列表
export function hiddenDanger(): TableColumn[] {
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
                return h!('span', i18n.t('h.table.hiddenDanger.center') as string);
            },
            align: 'center',
            key: 'content',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.unitname') as string);
            },
            align: 'center',
            key: 'org_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.hiddenDanger.level') as string);
            },
            align: 'center',
            key: 'level_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.hiddenDanger.status') as string);
            },
            align: 'center',
            key: 'status_name',
        },
    ];
}

// 监测点列表
export function monitor(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.title') as string);
            },
            key: 'name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.orgname') as string);
            },
            key: 'orgname',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.status') as string);
            },
            key: 'alarmdevice',
            render(h?: CreateElement, { row: data }: TableColumnRenderParams = {}) {
                return h!('span', (data as any).alarmdevice ? i18n.t('h.common.alarm') as string : i18n.t('h.common.normal') as string);
            },
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.remark') as string);
            },
            key: 'remark',
        },
    ];
}

// 会议列表
export function conference(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.index') as string);
            },
            type: 'index',
            align: 'center',
            width: 70,
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.title') as string);
            },
            key: 'name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.conference.talker') as string);
            },
            key: 'talker',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.conference.status') as string);
            },
            render(h?: CreateElement, { row: data }: TableColumnRenderParams = {}) {
                const text = (data as any).status ? i18n.t('h.status.opening') as string : i18n.t('h.status.ended') as string;
                const color = (data as any).status ? 'success' : 'error';
                return h!(Tag, { props: { color }}, text);
            },
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.type') as string);
            },
            key: 't_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.conference.startTime') as string);
            },
            key: 'starttime',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.conference.endTime') as string);
            },
            key: 'endtime',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.conference.useTime') as string);
            },
            render(h?, data?) {
                const { row: { status, starttime, endtime }} = data as any;
                return h!(
                    'span',
                    status
                        ? ''
                        : getCountDown(new Date(endtime).getTime() - new Date(starttime).getTime())
                );
            },
        },
    ];
}

// 预置模式列表
export function preference(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.title') as string);
            },
            key: 'name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.orgname') as string);
            },
            key: 'orgname',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.type') as string);
            },
            key: 't_name',
        },
    ];
}

// 应急预案列表
export function preplan(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.title') as string);
            },
            key: 'name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.orgname') as string);
            },
            key: 'orgname',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.type') as string);
            },
            key: 't_name',
        },
    ];
}

// 房屋违法违规类型列表
export function houseBadType(): TableColumn[] {
    return [
        {
            title: 'ID',
            key: 'id',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.title') as string);
            },
            key: 'name',
        },
    ];
}

// 房屋违法违规记录列表
export function houseBad(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.houseBad.room') as string);
            },
            key: 'room_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.houseBad.violationType') as string);
            },
            key: 't_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.houseBad.time') as string);
            },
            key: 'time',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.work.descs') as string);
            },
            key: 'remark',
        },
    ];
}

// 人员处罚记录列表
export function punishLog(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.punishLog.event_name') as string);
            },
            key: 'dealtype_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.houseBad.time') as string);
            },
            key: 'time',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.punishLog.place') as string);
            },
            key: 'point',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.punishLog.isHandle') as string);
            },
            key: 'ischeck',
            render(h?, data?) {
                const { row: { ischeck }} = data as any;
                return h!('span', ischeck ? i18n.t('h.status.disposed') as string : i18n.t('h.status.undisposed') as string);
            },
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.remark') as string);
            },
            key: 'remark',
        },
    ];
}

// 应急事件列表
export function emergency(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.emergency.t') as string);
            },
            key: 't_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.emergency.level') as string);
            },
            key: 'level_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.address') as string);
            },
            key: 'address',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.emergencyInfo.create_time') as string);
            },
            key: 'create_time',
        },
    ];
}

// 应急队伍列表
export function emergencyTerm(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.title') as string);
            },
            key: 'name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.orgname') as string);
            },
            key: 'orgname',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.remark') as string);
            },
            key: 'remark',
        },
    ];
}

// 民政相关，就餐记录
export function eatHistory(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.eatHistory.user') as string);
            },
            key: 'member_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.eatHistory.time') as string);
            },
            key: 'time',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.eatHistory.diningRoom') as string);
            },
            key: 'orgname',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.eatHistory.similarity') as string);
            },
            key: 's',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.eatHistory.oldImg') as string);
            },
            key: 'oldimg',
            width: 100,
            align: 'center',
            render(h?, data?) {
                const { row: { oldimg, member_name }} = data as any;
                return !oldimg
                    ? h!('span', i18n.t('h.common.noPicture') as string)
                    : h!('span', [
                    h!('img', {
                        class: 'cursor-pointer',
                        style: { maxWidth: '50px', maxHeight: '50px' },
                        attrs: { src: oldimg, alt: i18n.t('h.formLabel.imgLoadError') as string, preview: i18n.t('h.table.eatHistory.userImgs'), previewText: `${i18n.t('h.table.eatHistory.user')}${member_name || i18n.t('h.common.unknown')}${i18n.t('h.table.eatHistory.img')}` },
                        on: { click: (vueInstance as any).$previewRefresh, error: vueInstance.globalImgFail },
                    }),
                    ]);
            },
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.eatHistory.userImg') as string);
            },
            key: 'img',
            width: 100,
            align: 'center',
            render(h?, data?) {
                const { row: { img, member_name }} = data as any;
                return !img
                    ? h!('span', i18n.t('h.common.noPicture') as string)
                    : h!('span', [
                    h!('img', {
                        class: 'cursor-pointer',
                        style: { maxWidth: '50px', maxHeight: '50px' },
                        attrs: { src: img, alt: i18n.t('h.formLabel.imgLoadError') as string, preview: i18n.t('h.table.eatHistory.userImgs'), previewText: `${i18n.t('h.table.eatHistory.user')}${member_name || i18n.t('h.common.unknown')}${i18n.t('h.table.eatHistory.img')}` },
                        on: { click: (vueInstance as any).$previewRefresh, error: vueInstance.globalImgFail },
                    }),
                    ]);
            },
        },
    ];
}

// 就餐报表
export function diningReport(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.date') as string);
            },
            key: 'day',
            align: 'center',
        },
    ];
}

// 就餐报表，详情
export function diningReportInfo(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.diningReportInfo.reportForm') as string);
            },
            align: 'center',
            sortable: false,
            children: [
                {
                    renderHeader(h?: CreateElement) {
                        return h!('span', i18n.t('h.table.diningReportInfo.diningRoom') as string);
                    },
                    title: '食堂', // 导出时使用
                    key: 'orgname',
                    sortable: true,
                },
                {
                    renderHeader(h?: CreateElement) {
                        return h!('span', i18n.t('h.table.diningReportInfo.breakfastNum') as string);
                    },
                    title: '早餐人数', // 导出时使用
                    key: 'b',
                    sortable: true,
                },
                {
                    renderHeader(h?: CreateElement) {
                        return h!('span', i18n.t('h.table.diningReportInfo.dinnerNum') as string);
                    },
                    title: '中餐人数', // 导出时使用
                    key: 'l',
                    sortable: true,
                },
                {
                    renderHeader(h?: CreateElement) {
                        return h!('span', i18n.t('h.table.diningReportInfo.supperNum') as string);
                    },
                    title: '晚餐人数', // 导出时使用
                    key: 'd',
                    sortable: true,
                },
                {
                    renderHeader(h?: CreateElement) {
                        return h!('span', i18n.t('h.table.diningReportInfo.totalNum') as string);
                    },
                    colSpan: 666,
                    title: '总人数', // 导出时使用
                    key: 't',
                    sortable: true,
                },
            ],
        },
    ];
}

// 补助报表列表
export function EatMoeny(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.eatMoeny.name') as string);
            },
            title: '食堂名称', // 导出时使用
            key: 'name',
            sortable: true,
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.eatMoeny.a') as string);
            },
            title: '无偿服务对象', // 导出时使用
            key: 'a',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.eatMoeny.a_sum') as string);
            },
            title: '无偿服务对象金额', // 导出时使用
            key: 'a_sum',
            sortable: true,
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.eatMoeny.b') as string);
            },
            title: '一类低偿服务对象', // 导出时使用
            key: 'b',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.eatMoeny.b_sum') as string);
            },
            title: '一类低偿服务对象金额', // 导出时使用
            key: 'b_sum',
            sortable: true,
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.eatMoeny.c') as string);
            },
            title: '二类低偿服务对象', // 导出时使用
            key: 'c',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.eatMoeny.c_sum') as string);
            },
            title: '二类低偿服务对象金额', // 导出时使用
            key: 'c_sum',
            sortable: true,
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.eatMoeny.d') as string);
            },
            title: '有偿服务对象', // 导出时使用
            key: 'd',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.eatMoeny.d_sum') as string);
            },
            title: '有偿服务对象金额', // 导出时使用
            key: 'd_sum',
            sortable: true,
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.eatMoeny.total_sum') as string);
            },
            title: '总金额', // 导出时使用
            key: 'total_sum',
            sortable: true,
        },
    ];
}

// 管网相关，管道列表
export function sewerCover(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.facility.code') as string);
            },
            key: 'code',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.status') as string);
            },
            key: 'status_name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.sewerCover.isUndetected') as string);
            },
            key: 'isdelay_name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.sewerCover.material') as string);
            },
            key: 'material_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.region') as string);
            },
            key: 'region',
            render(h?, data?) {
                return h!('span', mergeRegion(data!.row!));
            },
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.sewerCover.depth') as string);
            },
            key: 'depth',
            sortable: 'custom',
        },
    ];
}

// 管道列表
export function pipeline(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.title') as string);
            },
            key: 'name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.region') as string);
            },
            key: 'region',
            render(h?, data?) {
                return h!('span', mergeRegion(data!.row!));
            },
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.type') as string);
            },
            key: 't_name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.sewerCover.material') as string);
            },
            key: 'material_name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.pipeline.belong') as string);
            },
            key: 'belong',
        },
    ];
}

export function sewerCoverCheck(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.index') as string);
            },
            type: 'index',
            width: 70,
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.sewerCoverCheck.code') as string);
            },
            key: 'code',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.sewerCoverCheck.checker') as string);
            },
            key: 'checker_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.sewerCoverCheck.time') as string);
            },
            key: 'time',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.sewerCoverCheck.result_name') as string);
            },
            key: 'result_name',
        },
    ];
}

export function sewerCoverRepair(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.index') as string);
            },
            type: 'index',
            width: 70,
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.sewerCoverCheck.code') as string);
            },
            key: 'code',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.sewerCoverCheck.checker') as string);
            },
            key: 'dealer_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.sewerCoverRepair.time') as string);
            },
            key: 'time',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.sewerCoverRepair.t') as string);
            },
            key: 't_name',
        },
    ];
}

// 社区相关，人员进出列表
export function memberInOutList(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.member.personName') as string);
            },
            key: 'member_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.member.snapshot') as string);
            },
            key: 'img',
            render(h?, data?) {
                const { row: { img, member_name }} = data as any;
                return !img
                    ? h!('span', i18n.t('h.common.noPicture') as string)
                    : h!('span', [
                        h!('img', {
                            class: 'cursor-pointer',
                            style: { maxWidth: '50px', maxHeight: '50px' },
                            attrs: { src: img, alt: i18n.t('h.formLabel.imgLoadError'), preview: 'memberInOut', previewText: `${member_name || i18n.t('h.common.unknown')}${i18n.t('h.formLabel.member.in_outPhoto')}` },
                            on: { click: (vueInstance as any).$previewRefresh, error: vueInstance.globalImgFail },
                        }),
                    ]);
            },
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.member.monitorDevice') as string);
            },
            key: 'device_name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.member.village') as string);
            },
            key: 'village_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.member.in_out_direction') as string);
            },
            key: 'direction_name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.member.recordTime') as string);
            },
            key: 'time',
        },
    ];
}

// 车辆进出列表
export function carInOutList(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.condition.car.code') as string);
            },
            key: 'code',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.member.snapshot') as string);
            },
            key: 'img',
            render(h?, data?) {
                const { row: { img, code }} = data as any;
                return !img
                    ? h!('span', i18n.t('h.common.noPicture') as string)
                    : h!('span', [
                        h!('img', {
                            class: 'cursor-pointer',
                            style: { maxWidth: '50px', maxHeight: '50px' },
                            attrs: { src: img, alt: i18n.t('h.formLabel.imgLoadError'), preview: 'carInOut', previewText: `${code || i18n.t('h.common.unknown')}${i18n.t('h.formLabel.member.in_outPhoto')}` },
                            on: { click: (vueInstance as any).$previewRefresh, error: vueInstance.globalImgFail },
                        }),
                    ]);
            },
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.member.monitorDevice') as string);
            },
            key: 'device_name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.member.village') as string);
            },
            key: 'village_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.member.in_out_direction') as string);
            },
            key: 'direction_name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.member.recordTime') as string);
            },
            key: 'time',
        },
    ];
}

// 某设备进出记录列表
export function inOutHistoryByDevice(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.type') as string);
            },
            key: 'objtype',
            render(h?, data?) {
                const { row: { objtype }} = data as any;
                return h!('span', objtype === 1 ? i18n.t('h.formLabel.build.member') as string : i18n.t('h.formLabel.deal.car') as string);
            },
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.inOutHistoryByDevice.user_name_carNum') as string);
            },
            key: 'code',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.member.snapshot') as string);
            },
            key: 'img',
            render(h?, data?) {
                const { row: { img, member_name, code }} = data as any;
                return !img
                    ? h!('span', i18n.t('h.common.noPicture') as string)
                    : h!('span', [
                        h!('img', {
                            class: 'cursor-pointer',
                            style: { maxWidth: '50px', maxHeight: '50px' },
                            attrs: { src: img, alt: i18n.t('h.formLabel.imgLoadError'), preview: 'carInOut', previewText: `${member_name || code || i18n.t('h.common.unknown')}${i18n.t('h.formLabel.member.in_outPhoto')}` },
                            on: { click: (vueInstance as any).$previewRefresh, error: vueInstance.globalImgFail },
                        }),
                    ]);
            },
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.member.in_out_direction') as string);
            },
            key: 'direction_name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.member.recordTime') as string);
            },
            key: 'time',
        },
    ];
}

// 物业费用管理列表
export function propertyFeeList(): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.propertyFeeList.bill') as string);
            },
            key: 'period',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.propertyFeeList.Cost') as string);
            },
            key: 'fee',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.status') as string);
            },
            key: 'status_name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.type') as string);
            },
            key: 't_name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.propertyFeeList.room') as string);
            },
            key: 'room_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.propertyFeeList.floor') as string);
            },
            key: 'floor_name',
            sortable: 'custom',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.propertyFeeList.build') as string);
            },
            key: 'build_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.propertyFeeList.village') as string);
            },
            key: 'village_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.remark') as string);
            },
            key: 'remark',
        },
    ];
}

// 树形结构数据
const possibleLevel = {
    E: ['province', 'city', 'area', 'county', 'street'],
    device: ['category', 'sub_category'],
};

// 设备大小类
export const deviceTrees: () => Trees[] = () => [
    {
        title: 'h.tree.sizeClass',
        value: 'device',
        type: 'device',
        levelKey: possibleLevel.device,
        options: [],
    },
];

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

// 设施类型
export const facilityTrees: () => Trees[] = () => [
    {
        title: 'h.tree.sourceType',
        value: 'patrol_type',
        type: 'facilityType',
        options: [],
    },
];

// 巡查点类型
export const patrolTrees: () => Trees[] = () => [
    {
        title: 'h.tree.type',
        value: 'point_type',
        type: 'dict',
        params: 10,
        options: [],
    },
    {
        title: 'h.tree.level',
        value: 'point_level',
        type: 'dict',
        params: 6,
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

// 租户下的用户
export function popupPerson<T extends Vue>(instance: T, field: string = 'person'): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.title') as string);
            },
            key: 'name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.person.native_place') as string);
            },
            key: 'native_place_name',
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

// 设施
export function popupFacility<T extends Vue>(instance: T, field: string = 'facilities'): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.alarms.sourceCode') as string);
            },
            key: 'code',
            ellipsis: true,
            tooltip: true,
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
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.type') as string);
            },
            key: 'patrol_type_name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.facility.director') as string);
            },
            key: 'director_name',
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

// 巡查点
export function popupPatrol<T extends Vue>(instance: T, field: string = 'patrol'): TableColumn[] {
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
            key: 'name',
            ellipsis: true,
            tooltip: true,
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
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.type') as string);
            },
            key: 'point_type_name',
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

// 检查项
export function popupCheckStandard<T extends Vue>(instance: T, field: string = 'standards'): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.code') as string);
            },
            key: 'code',
            width: 100,
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.title') as string);
            },
            key: 'name',
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

// 应急队伍
export function popupEmergencyTerm<T extends Vue>(instance: T, field: string = 'terms'): TableColumn[] {
    return [
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.table.title') as string);
            },
            key: 'name',
        },
        {
            renderHeader(h?: CreateElement) {
                return h!('span', i18n.t('h.formLabel.orgname') as string);
            },
            key: 'orgname',
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