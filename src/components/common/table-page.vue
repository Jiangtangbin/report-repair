<template>
    <div class="table-page-wrapper">
        <my-table
            v-on="$listeners"
            v-bind="$attrs"
            :data="finalData"
            :class="{ 'ivu-table-full': isHidePage }"
            class="ivu-table"
            ref="table"
        />
        <page
            v-show="!isHidePage"
            :current.sync="currentPage"
            :total="data.length"
            :pageSize="pageSize"
            class="ivu-page"
            show-total
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Page } from 'view-design';
import MyTable from './table.vue';

type Datum = any;

/**
 * @description: 内部分页组件
 *
 * @emit('pageChange', page, oldPage) 翻页事件
 * @param {Number} page: 当前页
 * @param {Number} oldPage?: 翻页前的那一页
 */
export default Vue.extend({
    name: 'table-page',
    inheritAttrs: false,
    components: {
        MyTable,
        Page,
    },
    props: {
        // table 的总数据源
        data: { type: Array, default: () => ([]) },
        // 默认显示的页数
        page: { type: Number, default: 1 },
        // 每页显示的数量
        pageSize: { type: Number, default: 30 },
        // 分页是否自动隐藏
        autoHide: { type: Boolean, default: true },
        // 选中的数据
        checked: { type: Array, default: () => ([]) },
        // 判断是否选中的 key
        UNIQUE_KEY: { type: String, default: 'id' },
    },
    data() {
        return {
            pageNum: this.page,
        };
    },
    computed: {
        // 总页数
        totalPage(): number {
            const { data: { length }, pageSize } = this;
            return length
                ? Math.ceil(length / pageSize)
                : 1;
        },
        // 当前页
        currentPage: {
            get() {
                const { pageNum, totalPage } = this;
                return pageNum > totalPage
                    ? totalPage
                    : pageNum;
            },
            set(page: number) {
                const { totalPage } = this;
                this.pageNum = page > totalPage ? totalPage : page;
                return true;
            },
        },
        // table 最终显示的数据
        finalData(): Datum[] {
            const { currentPage, pageSize, data } = this;
            const limitStart = (currentPage - 1) * pageSize;
            return limitStart < data.length
                ? data.slice(limitStart, limitStart + pageSize)
                : data.slice(-pageSize);
        },
        // 分页是否隐藏
        isHidePage(): boolean {
            const { autoHide, totalPage } = this;
            return autoHide && totalPage <= 1;
        },
    },
    watch: {
        currentPage(val: number, oldVal?: number) {
            this.$listeners.pageChange && this.$emit('pageChange', val, oldVal);
        },
        finalData() {
            const { checked } = this;
            if (!checked.length) return;
            this.$nextTick(() => {
                checked.every(v => {
                    this.setStatus(v, true);
                    return true;
                });
            });
        },
    },
    methods: {
        /**
         * @description: 重置 table 数据指定项数据的状态
         * @param {Object} data: 选中的数据
         * @param {Boolean} status: 设置的状态
         */
        setStatus(data: Datum, status: boolean = false) {
            const { UNIQUE_KEY, finalData: list } = this;
            const a = this.$refs.table.$refs.table as any;
            const _index = list.findIndex(v => v[UNIQUE_KEY] === data[UNIQUE_KEY]);
            if (_index === -1) return;
            if (a.objData.hasOwnProperty(_index)) {
                a.objData[_index]._isChecked = status;
            }
        },
    },
});
</script>

<style scoped lang="scss">
    $page-margin-top: 10px;
    $page-height: 34px + $page-margin-top;

    .table-page-wrapper {
        height: 100%;
        .ivu-table {
            height: calc(100% - #{$page-height});
            position: relative;
            &-full {
                height: 100%;
            }
        }
        .ivu-page {
            margin-top: $page-margin-top;
            text-align: right;
        }
    }
</style>