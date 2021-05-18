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
import { getKnowledgeBaseList as getList, deleteKnowledgeBase as del } from '@/config/api';
import { KnowledgeBaseColumns, PageAuth } from '@/base-class/list';
import { knowledgeBaseCondition as searchCondition } from '@/config/conditions';

type PageType = 'KnowledgeBaseList';

@Component({
    name: 'know-ledge-manage',
    components: {
        BasicList,
    },
})
export default class CustomerManage extends KnowledgeBaseColumns {
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
    }

    // 外部传递的参数
    @Watch('fromQuery')
    routeChange(query?: Dictionary<any>) {
        query && this.setParams(query);
    }
    // 所属类型发生改变时更新权限
    @Watch('authKey', { immediate: true })
    authKeyChange(val: string | undefined) {
        this.getAuth(val as 'know-ledge-manage');
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
    
    // 列表操作栏点击事件
    async handle(name: PageAuth['know-ledge-manage'], data?: API.Response['KnowledgeBaseInfo']) {
        switch (name) {
            case 'add':
            case 'edit':
            case 'details':
                this.$getDynamicComponent('knowLedgeManage', () => {
                    this.$createKnowLedgeManageHandle({
                        type: this.getType(name),
                        id: data && data.id,
                        $events: {
                            success: 'refresh',
                        },
                    }).show();
                });
                break;
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