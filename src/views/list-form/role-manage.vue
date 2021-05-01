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
    </basic-list>
</template>

<script lang="ts">
import { Prop, Watch, Component } from 'vue-property-decorator';
import BasicList from '@/components/common/list.vue';
import { getRoleList, delRole } from '@/config/api';
import { RoleColumns, PageAuth } from '@/base-class/list';
import { roleManageCondition as searchCondition } from '@/config/conditions';
import { userModule } from '@/store/index';

@Component({
    name: 'role-manage',
    components: {
        BasicList,
    },
})
export default class RoleManage extends RoleColumns {
    // 当前页面是否以弹出形式打开
    @Prop(Boolean)
    pageType!: boolean;
    // 外部传递的请求参数参数
    @Prop({ type: Object, default: () => ({}) })
    fromQuery!: API.Parameter['RoleList'] & { orgname: string };

    loading = false;
    list: API.Response['RoleList'] = { list: [], page: { pageSize: 1, pageNum: 1, countPage: 1, count: 1 }};
    initCondition = searchCondition();
    orgs = { id: 0, name: '' };
    queryParams: Dictionary<any> = { };

    // 条件参数，防止动态路由缓存
    get searchCondition() {
        const { initCondition, fromQuery } = this;
        return Object.assign(initCondition, { backfill: fromQuery });
    }
    // 获取请求参数
    get getResponseParams() {
        const { queryParams } = this;
        return ({ ...queryParams } as API.Parameter['RoleList']);
    }

    created() {
        this.getAuth();
        const { pageType, fromQuery, fromQuery: { org_id: id, orgname: name }} = this;
        this.orgs = id ? { id, name } : userModule.userOrg;
        this.setParams(fromQuery, !pageType);
    }

    // 外部传递的参数
    @Watch('fromQuery')
    routeChange(query?: Dictionary<any>) {
        query && this.setParams(query);
    }
    /**
     * @description: 列表数据请求函数
     * @param {Boolean} 是否返回第一页
     */
    @Watch('getResponseParams')
    async refresh(isFirst?: boolean) {
        if (this._inactive) return;
        this.loading = true;
        const { type, data } = await getRoleList(isFirst === true ? { ...this.getResponseParams, pageNum: 1 } : this.getResponseParams);
        if (!type) {
            this.list = data;
        }
        this.loading = false;
    }
    // 列表操作栏点击事件
    async handle(name: PageAuth['role-manage'], data?: API.Response['RoleInfo']) {
        const { orgs } = this;
        switch (name) {
            case 'add':
            case 'edit':
            case 'details':
                this.$getDynamicComponent('roleManage', () => {
                    this.$createRoleManageHandle({
                        type: this.getType(name),
                        orgs,
                        id: data && data.id,
                        $events: {
                            success: 'refresh',
                        },
                    }).show();
                });
                break;
            case 'delete': {
                this.loading = true;
                const { type } = await delRole(data!.id);
                this.loading = false;
                type || this.refresh(this.list.list.length <= 1);
                break;
            }
            default:
                break;
        }
    }
}
</script>

<style scoped lang="scss">
    @import '~@/views/styles/list.scss';
</style>