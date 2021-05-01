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
    >
        <div class="control">
            <my-button v-if="hasAuth('add')" @click="handle('add')" class="control-btn">{{$t('h.tableButton.add')}}</my-button>
            <my-button @click="refresh" class="control-btn" type="success">{{$t('h.tableButton.refresh')}}</my-button>
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
import { getDeviceGroupList as getList, delDeviceGroup as del } from '@/config/api';
import { DeviceGroupColumns, PageAuth } from '@/base-class/list';
import { deviceGroupCondition as searchCondition } from '@/config/conditions';
import { userModule } from '@/store/index';

type PageType = 'DeviceGroupList';

@Component({
    name: 'device-group-manage',
    components: {
        BasicList,
        IInput,
    },
})
export default class DeviceGroupManage extends DeviceGroupColumns {
    // 当前页面是否以弹出形式打开
    @Prop(Boolean)
    pageType!: boolean;
    // 外部传递的请求参数参数
    @Prop(Object)
    fromQuery!: API.Parameter[PageType] & { orgname: string };

    loading = false;
    list: API.Response[PageType] = { list: [], page: { pageSize: 1, pageNum: 1, countPage: 1, count: 1 }};
    initCondition = searchCondition();
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

    created() {
        const { pageType, fromQuery: { org_id: id, orgname: name, ...fromQuery }} = this;
        this.orgs = id ? { id, name } : userModule.userOrg;
        this.setParams(fromQuery, !pageType);
    }

    // 外部传递的参数
    @Watch('fromQuery')
    routeChange(query?: Dictionary<any>) {
        query && this.setParams(query);
    }
    // 所属类型发生改变时更新权限
    @Watch('authKey', { immediate: true })
    authKeyChange(val: string | undefined) {
        this.getAuth(val as 'device-group-manage');
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
    async handle(name: PageAuth['device-group-manage'], data?: API.Response['DeviceGroupDevice']) {
        switch (name) {
            case 'add':
            case 'edit':
            case 'details':
                this.$getDynamicComponent('deviceGroupManage', () => {
                    this.$createDeviceGroupManageHandle({
                        type: this.getType(name),
                        id: data && data.id,
                        data: data,
                        $events: {
                            success: 'refresh',
                        },
                    }).show();
                });
                break;
            case 'set-group-device': {
                this.$getDynamicComponent('deviceGroupDevice', () => {
                    this.$createDeviceGroupDeviceHandle({
                        id: data && data.id,
                    }).show();
                });
                break;
            }
            case 'delete': {
                this.loading = true;
                const { type } = await del(data!.id);
                this.loading = false;
                type || this.refresh(this.list.list.length <= 1);
                break;
            }
        }
    }
}
</script>

<style scoped lang="scss">
    @import '~@/views/styles/list.scss';
</style>