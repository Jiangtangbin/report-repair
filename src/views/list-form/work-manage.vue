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
            <my-button v-if="hasAuth('create')" @click="handle('create')" class="control-btn">{{$t('h.tableButton.create')}}</my-button>
            <my-button @click="refresh" class="control-btn" type="success">{{$t('h.tableButton.refresh')}}</my-button>
            <my-button v-if="hasAuth('export')" @click="exportCsv" :style="{ marginLeft: 'auto' }" type="info">{{$t('h.tableButton.export')}}</my-button>
        </div>
    </basic-list>
</template>

<script lang="ts">
import { Prop, Watch, Component } from 'vue-property-decorator';
import BasicList from '@/components/common/list.vue';
import { getWorkList as getList, exportWorkList as exportList } from '@/config/api';
import { WorkColumns, PageAuth } from '@/base-class/list';
import { workCondition as searchCondition } from '@/config/conditions';
import { userModule } from '@/store/index';

type PageType = 'WorkList';

@Component({
    name: 'work-manage',
    components: {
        BasicList,
    },
})
export default class WorkManage extends WorkColumns {
    // 当前页面是否以弹出形式打开
    @Prop(Boolean)
    pageType!: boolean;
    // 外部传递的请求参数参数
    @Prop(Object)
    fromQuery!: API.Parameter[PageType];

    loading = false;
    list: API.Response[PageType] = { list: [], page: { pageSize: 1, pageNum: 1, countPage: 1, count: 1 }};
    initCondition = searchCondition();
    queryParams: Dictionary<any> = { };
    orgs = { id: 0, name: '' };

    // 条件参数，防止动态路由缓存
    get searchCondition() {
        const { initCondition, fromQuery } = this;
        return Object.assign(initCondition, { backfill: fromQuery });
    }
    // 获取请求参数
    get getResponseParams() {
        const { queryParams } = this;
        return ({ ...queryParams } as API.Parameter[PageType]);
    }

    created() {
        const { pageType, fromQuery } = this;
        this.setParams(fromQuery, !pageType);
        this.orgs = { id: userModule.user.info.org_id, name: userModule.user.info.org_name }
    }

    // 外部传递的参数
    @Watch('fromQuery')
    routeChange(query?: Dictionary<any>) {
        query && this.setParams(query);
    }
    // 所属类型发生改变时更新权限
    @Watch('authKey', { immediate: true })
    authKeyChange(val: string | undefined) {
        this.getAuth(val as 'work-manage');
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
    // 导出设备列表数据
    exportCsv() {
        const { getResponseParams: { pageSize, pageNum, ...args }} = this;
        const length = Object.values(args).filter(Boolean).length;
        length
            ? exportList(args)
            : this.$Modal.confirm({
                title: this.$t('h.tips.workDataExport') as string,
                content: this.$t('h.tips.noFilterIsExportAllData') as string,
                onOk() {
                    exportList(args);
                },
            });
    }
    // 列表操作栏点击事件
    async handle(name: PageAuth['work-manage'], data?: API.Response['WorkInfo']) {
        const { orgs } = this;
        switch (name) {
            case 'create':
                this.$getDynamicComponent('workPoolManage', () => {
                    this.$createWorkPoolManageHandle({
                        orgs: userModule.user.info.role === 'kh' ? orgs : undefined,
                        id: data && data.id,
                        $events: {
                            success: 'refresh',
                        },
                    }).show();
                });
                break;
            case 'reply':
                this.$getDynamicComponent('workReplyManage', () => {
                    this.$createWorkReplyManageHandle({
                        work_id: data && data.id,
                        $events: {
                            success: 'refresh',
                        },
                    }).show();
                });
                break;
            case 'cancel':
                this.$getDynamicComponent('workPoolCancelManage', () => {
                    this.$createWorkPoolCancelManageHandle({
                        id: data && data.id,
                        $events: {
                            success: 'refresh',
                        },
                    }).show();
                });
                break;
            default: {
                break;
            }
        }
    }
}
</script>

<style scoped lang="scss">
    @import '~@/views/styles/list.scss';
</style>