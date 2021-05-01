<template>
    <basic-list
        v-bind="list.page"
        @on-row-dblclick="handle('details', $event)"
        @search="setParams($event, !pageType)"
        :columns="columns"
        :data="list.list"
        :loading="loading"
        :total="list.page.count"
        :conditions="searchCondition"
        ref="basicList"
    >
        <div class="control">
            <my-button v-if="hasAuth('add')" @click="handle('add')" class="control-btn">{{$t('h.tableButton.add')}}</my-button>
            <my-button @click="refresh" class="control-btn" type="success">{{$t('h.tableButton.refresh')}}</my-button>
            <my-button
                v-if="isAllowBatchOperation"
                @click="batchOperationStatus = !batchOperationStatus"
                class="control-btn"
                type="info"
            >{{batchOperationStatus ? $t('h.tableButton.close') : $t('h.tableButton.open')}}{{$t('h.tableButton.batchOperation')}}</my-button>
            <template v-if="batchOperationStatus">
                <my-button @click="toggleSelect(true)" class="control-btn">{{$t('h.tableButton.selectAll')}}</my-button>
                <my-button @click="toggleSelect()" class="control-btn">{{$t('h.tableButton.reverseSelect')}}</my-button>
            </template>
        </div>
        <template #append>
            <i-input @click.native="inputHandle" @input="extraParams = { org_id: undefined, __orgname: undefined }" :value="extraParams.__orgname" class="condition-option condition-input" :placeholder="$t('h.placeholder.pleaseSelectCustomer')" clearable readonly />
        </template>
    </basic-list>
</template>

<script lang="ts">
import { Prop, Watch, Component } from 'vue-property-decorator';
import { Input as IInput } from 'view-design';
import BasicList from '@/components/common/list.vue';
import { getDeviceList as getList, delDevice as del, getDeviceConfig } from '@/config/api';
import { DeviceColumns, PageAuth } from '@/base-class/list';
import { deviceCondition as searchCondition } from '@/config/conditions';
import { userModule } from '@/store/index';
import { isBoolean } from '@/utils/index';
import bus from '@/utils/bus';

type PageType = 'DeviceList';

@Component({
    name: 'device-manage',
    components: {
        BasicList,
        IInput,
    },
})
export default class DeviceManage extends DeviceColumns {
    $refs!: {
        basicList: BasicList;
    }

    // 当前页面是否以弹出形式打开
    @Prop(Boolean)
    pageType!: boolean;
    // 外部传递的请求参数参数
    @Prop({ type: Object, default: () => ({}) })
    fromQuery!: API.Parameter[PageType] & { orgname: string };

    loading = false;
    // 是否开启批量操作
    batchOperationStatus = false;
    list: API.Response[PageType] = { list: [], page: { pageSize: 1, pageNum: 1, countPage: 1, count: 1 }};
    initCondition = searchCondition(false);
    extraParams = { org_id: undefined, __orgname: '' } as { org_id?: string; __orgname?: string; };
    queryParams: Dictionary<any> = { };
    orgs = { id: 0, name: '' };

    // 条件参数，防止动态路由缓存
    get searchCondition() {
        const { initCondition, fromQuery, extraParams } = this;
        return Object.assign(initCondition, { backfill: { ...fromQuery, ...extraParams }});
    }
    // 获取请求参数
    get getResponseParams() {
        const { queryParams } = this;
        return ({ ...queryParams } as API.Parameter[PageType]);
    }
    // 是否允许批量操作
    get isAllowBatchOperation() {
        // const { auth } = this;
        // return auth.includes('closeAlarm');
        return true;
    }

    created() {
        const { pageType, fromQuery: { org_id: id, orgname: name, ...fromQuery }} = this;
        this.orgs = id ? { id, name } : userModule.userOrg;
        this.setParams(fromQuery, !pageType);
    }
    activated() {
        // bus.$on('on-alarm', this.updateAlarmStatus);
        // bus.$on('on-unalarm', this.updateAlarmStatus);
        bus.$on('on-online', this.updateOnlineStatus);
    }
    deactivated() {
        // bus.$off('on-alarm');
        // bus.$off('on-unalarm');
        bus.$off('on-online');
    }
    beforeDestroy() {
        // bus.$off('on-alarm');
        // bus.$off('on-unalarm');
        bus.$off('on-online');
    }

    // 外部传递的参数
    @Watch('fromQuery')
    routeChange(query?: Dictionary<any>) {
        query && this.setParams(query);
    }
    // 所属类型发生改变时更新权限
    @Watch('authKey', { immediate: true })
    authKeyChange(val: string | undefined) {
        this.getAuth(val as 'device-manage');
    }
    /**
     * @description: 列表数据请求函数
     * @param {Boolean} 是否返回第一页
     */
    @Watch('getResponseParams')
    async refresh(isFirst?: boolean) {
        if (this._inactive) return;
        this.loading = true;
        const { type, data } = await getList(isFirst === true ? { ...this.getResponseParams, pageNum: 1 } : this.getResponseParams);
        if (!type) {
            this.list = data;
        }
        this.loading = false;
    }

    /**
     * @description: 更新设备列表的报警状态
     * @param {String} t: 报警类型
     * @param {String} flag: 设备 flag
     * @param {Number} isalarm: 报警状态
     */
    // updateAlarmStatus(t: string, flag: string, status: number) {
    //     const { list: { list }} = this;
    //     t === 'd' && list.some(v => {
    //         const bool = v.flag === flag;
    //         bool && (v.isalarm = status);
    //         return bool;
    //     });
    // }
    /**
     * @description: 更新设备列表的在线状态
     * @param {Object} data: 设备状态信息
     */
    updateOnlineStatus({ uuid, t }: { uuid: string, t: 'on' | 'off' }) {
        const { list: { list }} = this;
        list.some(v => {
            const bool = v.uuid === uuid;
            bool && (v.isonline = Number(t === 'on'));
            return bool;
        });
    }
    // input 点击事件
    inputHandle(ev: MouseEvent) {
        ev.target &&
            (ev.target as any).tagName.toUpperCase() === 'INPUT' &&
            this.openList();
    }
    // 机构筛选
    openList() {
        this.$getDynamicComponent('tableList', () => {
            this.$createTableListHandle({
                t: 'customer',
                $events: {
                    success: ([org]: Dictionary<any>[]) => {
                        this.extraParams = org
                            ? { org_id: org.id, __orgname: org.name }
                            : { org_id: undefined, __orgname: undefined };
                    },
                },
            }).show();
        });
    }
    // 列表操作栏点击事件
    async handle(name: PageAuth['device-manage'] | 'batchCloseAlarm', data?: API.Response['DeviceInfo']) {
        const { orgs } = this;
        console.log(name);
        switch (name) {
            case 'edit':
            case 'details':
                // 增改查
                this.$getDynamicComponent('deviceManage', () => {
                    this.$createDeviceManageHandle({
                        type: this.getType(name),
                        orgs,
                        id: data && data.id,
                        $events: {
                            success: 'refresh',
                        },
                    }).show();
                });
                break;
            case 'distributeContent':
                this.$getDynamicComponent('deviceSetContent', () => {
                    this.$createDeviceSetContentHandle({
                        devices: data && [{id: data.id}],
                        $events: {
                            success: 'refresh',
                        },
                    }).show();
                });
                break;
            case 'view':
                const { preview, resolution } = data!;
                if (preview) {
                    this.loading = true;
                    const { type, data } = await getDeviceConfig(preview);
                    if (!type) {
                        this.loading = false;
                        this.$getDynamicComponent('devicePreview', () => {
                            this.$createDevicePreviewHandle({
                                type: 'details',
                                data,
                                resolution, // 分辨率
                                $events: {
                                    success: 'refresh',
                                },
                            }).show();
                        });
                    }
                }
                break;
            case 'delete': {
                // 删除
                this.loading = true;
                const { type } = await del(data!.id);
                this.loading = false;
                type || this.refresh(this.list.list.length <= 1);
                break;
            }
        }
    }
    /**
     * @description: 设置列表的状态
     * @param {Boolean} status?: 设置的状态
     */
    toggleSelect(status?: boolean) {
        const list = this.getList();
        const _isBoolean = isBoolean(status);
        list.every(v => {
            v._isChecked = _isBoolean ? status : !v._isChecked;
            return true;
        });
    }
    // 获取 table 的列表，由于 view-design table 数据源，被隔离了，所以单独获取
    getList(): Record<string, any>[] {
        try {
            const { objData } = this.$refs.basicList.$refs.table.$refs.table as any;
            return Object.values(objData);
        } catch (e) {
            return [];
        }
    }
}
</script>

<style scoped lang="scss">
    @import '~@/views/styles/list.scss';
</style>