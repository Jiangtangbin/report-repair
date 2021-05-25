<template>
    <basic-list
        v-bind="list.page"
        @on-row-dblclick="handle('details', $event)"
        @search="querySearch"
        :columns="columns"
        :data="list.list"
        :loading="loading"
        :total="list.page.count"
        :conditions="searchCondition"
    >
        <template #default>
            <div class="control">
                <my-button v-if="hasAuth('add')" @click="handle('add')" class="control-btn">{{$t('h.tableButton.append')}}</my-button>
                <my-button @click="refresh" class="control-btn" type="success">{{$t('h.tableButton.refresh')}}</my-button>
            </div>
        </template>
        <template #append>
            <date-picker
                @on-change="time = $event;"
                :value="time"
                :options="timeOption"
                class="condition-option control-btn"
                :placeholder="$t('h.placeholder.pleaseSelectQueryTime')"
                type="datetimerange"
            />
        </template>
    </basic-list>
</template>

<script lang="ts">
import { Prop, Watch, Component } from 'vue-property-decorator';
import { DatePicker } from 'view-design';
import BasicList from '@/components/common/list.vue';
import { getOperationLog as getList } from '@/config/api';
import { OperationLogColumns as Columns, PageAuth } from '@/base-class/list';
import { operationLogCondition as searchCondition } from '@/config/conditions';
import { disabledAfterToday as disabledDate } from '@/config/index';

type PageType = 'OperationLog';

@Component({
    name: 'operation-log',
    components: {
        BasicList,
        DatePicker,
    },
})
export default class OperationLog extends Columns {
    // 当前页面是否以弹出形式打开
    @Prop(Boolean)
    pageType!: boolean;
    // 外部传递的请求参数参数
    @Prop({ type: Object, default: () => ({}) })
    fromQuery!: API.Parameter[PageType];

    loading = false;
    list: API.Response[PageType] = { list: [], page: { pageSize: 1, pageNum: 1, countPage: 1, count: 1 }};
    time = this.fromQuery.starttime && this.fromQuery.endtime ? [this.fromQuery.starttime, this.fromQuery.endtime] : [];
    initCondition = searchCondition();
    queryParams: Dictionary<any> = { };
    timeOption = { disabledDate };

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
        this.getAuth();
        const { pageType, fromQuery } = this;
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
        const { type, data } = await getList(isFirst === true ? { ...this.getResponseParams, pageNum: 1 } : this.getResponseParams);
        if (!type) {
            this.list = data;
        }
        this.loading = false;
    }

    // 搜索方法，将外部的参数与内部合并后在进行搜索
    querySearch(query: API.Parameter[PageType]) {
        const { time: [starttime, endtime], pageType } = this;
        this.setParams({ ...query, starttime, endtime }, !pageType);
    }
    // 列表操作栏点击事件
    async handle(name: PageAuth['operation-log'], data?: API.Response[PageType]) {
        // switch (name) {
        //     case 'details':
        //         this.$getDynamicComponent('role', () => {
        //             this.$createRoleHandle({
        //                 type: this.getType(name),
        //                 orgs,
        //                 id: data && data.id,
        //                 $events: {
        //                     success: 'refresh',
        //                 },
        //             }).show();
        //         });
        //         break;
        //     default: {
        //         break;
        //     }
        // }
    }
}
</script>

<style scoped lang="scss">
    @import '~@/views/styles/list.scss';
</style>