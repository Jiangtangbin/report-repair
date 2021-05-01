<template>
    <div class="table-wrapper" :theme="theme" ref="tableBox">
        <i-table v-on="$listeners" v-bind="$attrs" :height="table.height" :data="data" :enableBScroll="isEnableBScroll" ref="table" stripe />
    </div>
</template>

<script lang="ts">
import { Prop, Watch, Mixins, Component } from 'vue-property-decorator';
import { Table as ITable } from 'view-design';
import { AnewCalculateHeight, BetterScrollBar } from '@/mixins/table';

@Component({
    inheritAttrs: false,
    components: {
        ITable,
    },
})
export default class MyTable extends Mixins(AnewCalculateHeight, BetterScrollBar) {
    $refs!: {
        tableBox: HTMLElement;
        table: ITable;
    }

    @Prop({ type: Array, default: () => ([]) })
    data!: object[]
    // 主题，dark
    @Prop(String)
    theme?: string;
    // 是否启用 better-scroll 滚动条
    @Prop({ type: Boolean, default: true })
    enableBScroll!: boolean;

    isEnableBScroll = this.enableBScroll;
    timer = 0;
    timer2 = 0;

    mounted() {
        const { isEnableBScroll } = this;
        isEnableBScroll && this.initScroll();
    }

    // 数据发生变化时，重新计算滚动条的高度
    @Watch('data', { immediate: true })
    anewCalculate() {
        const { timer, timer2, isEnableBScroll } = this;
        clearTimeout(timer);
        clearTimeout(timer2);
        this.timer = window.setTimeout(this.$_calcHeight, 500);
        this.timer2 = window.setTimeout(() => {
            if (this.scroll) {
                this.scroll.scrollTo(0, 0);
                this.scroll.refresh();
            }
        }, 500);
    }

    // 初始化滚动条
    initScroll() {
        this.$nextTick(() => {
            let el = this.$el.getElementsByClassName('ivu-table-body')[0] as any;
            this.genScrollBar(el);
            el = null;
        });
    }
    // 刷新滚动条
    refresh() {
        const { timer, timer2, isEnableBScroll } = this;
        if (!(isEnableBScroll && this.scroll)) return;
        clearTimeout(timer);
        clearTimeout(timer2);
        this.$_calcHeight();
        setTimeout(() => {
            this.scroll.refresh();
        }, 20);
    }
    /**
     * @description: 表格数据导出
     * @param {String} type: 导出类型（resource 按照 table 已有数据导出，custom 按照自定义表头导出）
     * @param {String} name: 文件名称
     * @param {Array} condition: 导出表头的 key
     */
    exportData(type: string, name: string, condition: any) {
        if (type === 'resource') {
            this.$refs.table.exportCsv({
                filename: name,
            });
        } else {
            this.$refs.table.exportCsv({
                filename: name,
                columns: this.columns.filter(item => condition.includes(item.key)),
                data: this.data.filter((item, index) => index = 1),
            });
        }
    }
}
</script>

<style scoped lang="scss">
    $table-body-color: transparent;

    [enableBScroll=true] {
        @include utils-pierce(ivu-table) {
            //  bs 滚动条产生的前提条件
            .ivu-table-overflowY,
            .ivu-table-overflowX {
                overflow: hidden;
                position: relative;
            }
        }
    }

    .table-wrapper {
        width: 100%;
        height: 100%;
        overflow: hidden;
        flex: auto;
    }

    .table-wrapper[theme=dark] {
        @include utils-pierce (ivu-table-wrapper) {
            .ivu-table {
                color: $--white;
                background: $--table-header-color1;
                &:before {
                    height: 0;
                }
                // 消除 table header 宽度多 1px 的颜色不对等的问题
                .ivu-table-body {
                    border-left: 1px solid $--background-color;
                    border-left: 1px solid $--background-color;
                }
                // table 所有格子的背景颜色
                th, td {
                    background: none;
                    border-bottom: none;
                }
                // 多选框
                .ivu-checkbox-wrapper {
                    margin-right: 0;
                }
            }
            // 隔行色
            .ivu-table-stripe .ivu-table-body tr:nth-child(2n) td, .ivu-table-stripe .ivu-table-fixed-body tr:nth-child(2n) td {
                background: $--table-header-color1;
            }
        }
    }

    .table-wrapper[theme=map] {
        @include utils-pierce (ivu-table-wrapper) {
            .ivu-table {
                color: #b9dbff;
                background-color: $table-body-color;
                &::before, &::after {
                    height: 0;
                    background-color: $--table-border-color;
                }
                // table 所有格子的背景颜色
                th, td {
                    border: none;
                    background: $table-body-color;
                }
                // table th 的背景颜色
                .ivu-table-header th {
                    color: $--white;
                    background: $--table-header-color2;
                }
                // table hover 时 row 的背景颜色
                tr.ivu-table-row-hover td {
                    background: $--table-row-hover-color;
                }
                // table 选中时 row 的背景颜色
                tr.ivu-table-row-highlight td {
                    background: $--table-row-hover-color;
                }
                // 多选框
                .ivu-checkbox-wrapper {
                    margin-right: 0;
                }
            }
            // 隔行换色
            .ivu-table-stripe .ivu-table-body tr:nth-child(2n) td, .ivu-table-stripe .ivu-table-fixed-body tr:nth-child(2n) td {
                background: $--table-header-color2;
            }
        }
    }
</style>