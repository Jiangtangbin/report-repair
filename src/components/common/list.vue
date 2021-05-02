<template>
    <div class="basic-list-wrapper">
        <loading :loading="loading" type="B" />
        <my-condition @search="querySearch" v-bind="conditions" class="basic-list-condition" ref="condition">
            <template v-if="$scopedSlots.append" #append>
                <slot name="append" />
            </template>
        </my-condition>
        <card class="basic-list-body" :bordered="false">
            <div v-if="$scopedSlots.default" class="basic-list-body-control">
                <slot />
            </div>
            <div class="basic-list-main" :style="{height: hasConditionWrapper ? '' : '100%'}">
                <my-folder
                    v-if="trees"
                    @change="queryChange"
                    :scroll-data="trees"
                    :backfill="conditions.backfill"
                    class="basic-list-main-folder"
                    width="200px"
                />
                <div :style="{width: trees ? 'calc(100% - 200px)' : '100%'}" class="basic-list-main-table">
                    <my-table
                        v-bind="$attrs"
                        v-on="$listeners"
                        @on-sort-change="sortUpdate"
                        :columns="columns"
                        :data="data"
                        :class="{'basic-list-main-table-list-cover-page': pageHide}"
                        class="basic-list-main-table-list fresh-table"
                        ref="table"
                    />
                    <page
                        v-if="!pageHide"
                        @on-change="pagesChange('pageNum', $event)"
                        @on-page-size-change="pagesChange('pageSize', $event)"
                        :current="Number(pages.pageNum)"
                        :page-size="Number(pageSize)"
                        :total="Number(count)"
                        v-bind="pageAttrs"
                        :simple="isMobile"
                        class="basic-list-main-table-page"
                    >{{ $t('h.page.result', { msg: count }) }}</page>
                </div>
            </div>
        </card>
    </div>
</template>

<script lang="ts">
import { Prop, Watch, Component, Vue } from 'vue-property-decorator';
import MyCondition from '@/components/common/conditions.vue';
import MyFolder from '@/components/common/folder.vue';
import MyTable from '@/components/common/table.vue';
import { Page, Card, TableColumn } from 'view-design';
import { appModule } from '@/store/index';
import { IConditionSelect, ICondition } from '@/config/conditions';

@Component({
    inheritAttrs: false,
    components: {
        MyCondition,
        MyTable,
        MyFolder,
        Page,
        Card,
    },
})
export default class basicList extends Vue {
    $refs!: {
        table: MyTable;
        condition: MyCondition;
    }

    // 当前状态
    @Prop(Boolean)
    loading!: boolean;
    // 初始化后是否请求
    @Prop(Boolean)
    immediate!: boolean;
    @Prop({ type: Array, required: true })
    columns!: TableColumn[];
    // 条件
    @Prop({ type: Object, default: () => ({}) })
    conditions!: { hasBtn: boolean, selects: IConditionSelect, inputs?: Dictionary<ICondition>; backfill?: Dictionary<string | number | string[] | number[]> };
    // 数据总数
    @Prop({ type: Number, required: true })
    count!: number;
    // 数据源
    @Prop(Array)
    data!: object[];
    // 初始显示的页数
    @Prop({ type: Number, default: 1 })
    pageNum!: number;
    // 初始每页显示的条数
    @Prop({ type: [Number, String], default: 30 })
    pageSize!: number | string;
    // 传递给分页的参数
    @Prop({ type: Object, default: () => ({}) })
    pageAttr!: Page;
    // 是否包含 tree
    @Prop(Array)
    trees?: Dictionary<any>[];
    // 是否隐藏分页
    @Prop(Boolean)
    pageHide!: boolean;

    private pages = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
    }
    query: Dictionary<string | number | string[] | number[]> = this.conditions.backfill || {};
    treeQuery: Dictionary<string | number> = {};
    sort: { sort: string | undefined; sort_d: string | undefined } = { sort: undefined, sort_d: undefined };

    get isMobile() {
        return appModule.isMobile;
    }
    // 传递给 Page 的参数
    get pageAttrs() {
        return { showTotal: true, showElevator: true, showSizer: true, ...this.pageAttr };
    }
    // 是否存在条件容器
    get hasConditionWrapper(): boolean {
        return !!(this.$scopedSlots.default);
    }

    created() {
        const { immediate } = this;
        immediate && this.search('query');
    }

    /**
     * @description: 页码发生变化，外部触发
     * @param {Number} page: 页码
     */
    @Watch('pageNum')
    pageChange(pageNum: number) {
        this.pages.pageNum = pageNum;
    }
    /**
     * @description: 条数发生变化，外部触发
     * @param {Number} pageSize: 条数
     */
    @Watch('pageSize')
    pageSizeChange(pageSize: number) {
        this.pages.pageSize = pageSize;
    }
    /**
     * @description: 回填条件发生变化时重置 query
     * @tip 回填包含所有数据，因此可以直接赋值
     * @param {Object} val: 回填的条件
     */
    @Watch('conditions.backfill')
    backfillChange(val?: Dictionary<string | number | string[] | number[]>) {
        this.query = val || {};
    }

    /**
     * @description
     * @param {String} type: 修改的类型
     * @param {Number} pages: 修改的值
     */
    pagesChange(type: 'pageNum' | 'pageSize', pages: number) {
        // 通过地址栏改变 pageSize 时，如果 pageSize 不存在 page-size-opts 选项中会触发一次 pageSize change 事件，触发值为 undefined
        if (!pages) return;
        this.pages[type] = pages;
        this.search(type);
    }
    /**
     * @description: 搜索事件
     * @param {Object} query: 搜索的值
     */
    querySearch(query: Dictionary<string | number>) {
        const { pages } = this;
        // 每次搜索事件都重置 pageNum
        pages.pageNum = 1;
        this.$set(this, 'query', query);
        this.search('query');
    }
    // 左侧文件树的筛选
    queryChange(params: Dictionary<any>) {
        this.$set(this, 'treeQuery', params);
        this.$refs.condition
            ? this.querySearch(this.$refs.condition.search())
            : this.search('tree');
    }
    // 排序事件
    sortUpdate(data: { key: string; order: 'desc' | 'asc' | 'normal'}) {
        this.sort = data.order === 'normal'
            ? { sort: undefined, sort_d: undefined }
            : { sort: data.key, sort_d: data.order };
        this.search('sort');
    }
    // 冒泡上层，触发翻页事件
    search(type: 'pageNum' | 'pageSize' | 'query' | 'tree' | 'sort') {
        const { pages, treeQuery, query, sort } = this;
        this.$emit('search', { ...query, ...treeQuery, ...pages, ...sort }, type);
    }
}
</script>

<style scoped lang="scss">
    $condition-height: 73px;
    $padding-top: 16px;
    $page-height: .88rem;

    .basic-list-wrapper {
        width: 100%; height: 100%;
        position: relative;
        display: flex;
        flex-flow: column;
        color: $--white;
        .basic-list-condition {
            flex: none;
        }
        .basic-list-body {
            height: 100%;
            overflow: hidden;
            flex: auto;
            @include utils-pierce(ivu-card-body) {
                width: 100%; height: 100%;
                padding-top: 0;
            }

            &-control {
                padding-top: $padding-top;
            }
        }
        .basic-list-main {
            width: 100%; height: calc(100% - 32px);
            padding-top: $padding-top;
            display: flex;
            &-folder {
                width: initial;
                z-index: 1;
            }
            &-table {
                width: 100%; height: 100%;
                flex: auto;
                display: flex;
                flex-flow: column;
                &-list {
                    width: 100%; height: calc(100% - #{$page-height});
                    &-cover-page {
                        height: 100%;
                    }
                }
                &-page {
                    width: 100%; height: $page-height;
                    padding-left: 10px;
                    flex: none;
                    display: flex;
                    align-items: center;
                }
            }
        }
    }
</style>