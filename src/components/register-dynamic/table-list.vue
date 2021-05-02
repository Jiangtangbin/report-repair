<template>
    <my-modal
        v-model="value"
        @on-visible-change="$event || resetDatum()"
        @on-ok="ok"
        :title="`${title || tableInfo.title}`"
        :loading="loading"
        :theme="!drag ? undefined : 'draggable'"
        :width="!drag ? '80vw' : '590px'"
        :draggable="!drag ? undefined : true"
    >
        <basic-list
            v-bind="tableInfo"
            @search="setParams"
            @on-selection-change="temporaryChecked = $event"
            @on-row-dblclick="handle"
            @on-current-change="rowChange"
            @on-select-cancel="removeDurableChecked(arguments[1])"
            @on-select-all-cancel="removeDurableChecked(list.list)"
            :class="classes"
            :conditions="conditions"
            :columns="columns"
            :data="list.list"
            :loading="loading"
            :total="list.page.count"
            :count="list.page.count"
            :page-num="list.page.pageNum"
            :page-size="list.page.pageSize"
            :highlight-row="!multiple"
            :page-attr="pageAttr"
            ref="table"
            class="popup-table-wrapper"
        />
            <selection v-if="multiple" v-slot="{data, index}" :data="finallyChecked" :show-key="getShowKey" class="popup-checked">
                <div class="popup-checked-selection">
                    <span class="t-o-e">{{index + 1}}. {{data[getShowKey]}}</span>
                    <svg-icon @click="removeOption(data, index)" icon-class="times" />
                </div>
            </selection>
    </my-modal>
</template>

<script lang="ts">
import { Prop, Emit, Component } from 'vue-property-decorator';
import { TableColumn } from 'view-design';
import BasicList from '@/components/common/list.vue';
import Selection from '@/components/selection/index.vue';
import { BasePopup } from '@/base-class/dynamic-create';
import popupList, { PopupList, PopupListField } from '@/config/popup-list';
import { Options } from '@/config/conditions';
import { uniq, isArray } from '@/utils/index';
import isEqual from 'lodash/isEqual';
import { i18n } from '@/locale/index';

type Datum = Dictionary<any>;
type TableInfo = Replace<PopupList[keyof PopupList], { conditions: Options }>;

@Component({
    name: 'TableListHandle',
    components: {
        BasicList,
        Selection,
    },
})
export default class TableListHandle extends BasePopup {
    $refs!: {
        table: BasicList;
    }

    // 弹窗打开列表的类型
    @Prop({ type: String, required: true, validator: v => popupList.hasOwnProperty(v) })
    t!: PopupListField;
    // 弹窗打开列表的类型
    @Prop({ type: String })
    title!: string;
    @Prop(Boolean)
    multiple!: boolean;
    // 多选时, 用来去重的唯一值
    @Prop({ type: String, default: 'id' })
    uniqueKey!: string;
    // 多选时, 选中列表显示的字段
    @Prop(String)
    showKey!: string;
    // 默认选中字段
    @Prop({ type: Array, default: () => ([]) })
    checked!: Dictionary<any>[];
    // 外部传递的参数
    @Prop({ type: Object, default: () => ({}) })
    fromQuery!: Dictionary<any>;
    @Prop({ type: Boolean, default: false })
    drag!: boolean;

    // table 的 columns 字段
    get columns(): TableColumn[] {
        const { multiple, tableInfo: { columns = [] }} = this;
        return multiple
            ? ([{ type: 'selection', width: 60 }] as TableColumn[]).concat(columns)
            : columns;
    }
    // table 的条件
    get conditions() {
        const { tableInfo: { conditions }, queryParams } = this;
        return { ...conditions, backfill: queryParams };
    }
    // 获取多选时展示的 key
    get getShowKey() {
        const { showKey, tableInfo } = this;
        return tableInfo.showKey || showKey;
    }
    // 多选时去重的唯一字段
    get UNIQUE_KEY() {
        const { uniqueKey, tableInfo } = this;
        return tableInfo.uniqueKey || uniqueKey;
    }
    // 为 table 返回 class
    get classes() {
        const { multiple } = this;
        return multiple ? 'popup-table-wrapper-decrease-side' : '';
    }
    // 多选时选中的值
    get finallyChecked() {
        const { durableChecked, temporaryChecked, UNIQUE_KEY } = this;
        return durableChecked.concat(uniq(temporaryChecked, durableChecked, UNIQUE_KEY));
    }

    loading = false;
    list: API.ListType<Dictionary<any>[]> = { list: [], page: { pageSize: 1, pageNum: 1, countPage: 1, count: 1 }};
    queryParams: Dictionary<any> = { pageNum: 1 };
    // 单选时选中的值
    uniqueChecked: Dictionary<any>[] = [];
    // 多选确定选中的值
    durableChecked: Dictionary<any>[] = [];
    // 多选临时选中的值
    temporaryChecked: Dictionary<any>[] = [];
    pageAttr = { showSizer: false };
    tableInfo: TableInfo = ({ title: i18n.t('h.modal.titles.presetTitle'), conditions: { }} as TableInfo);

    // 打开前事件
    async prefixFunc() {
        const { checked, queryParams, t, fromQuery, list } = this;
        this.checkedChange(checked);
        if (!popupList.hasOwnProperty(t)) return console.log('类型错误: ', t);
        list.list = [];
        const query = { ...queryParams, ...fromQuery };
        const { conditions, trees, ...args } = popupList[t];
        this.$set(this, 'tableInfo', { conditions: conditions(), trees: trees && trees(), ...args });
        const flag = this.setParams(query);
        flag && this.refresh(true);
    }
    /**
     * @description: 重置数据
     */
    resetDatum() {
        this.uniqueChecked = [];
        this.durableChecked = [];
        this.temporaryChecked = [];
        this.queryParams = { pageNum: 1 };
    }
    /**
     * @description: 选中项发生改变时触发
     * @param {Array} val: 已选中项
     */
    checkedChange(val: Datum[]) {
        const { durableChecked, multiple, UNIQUE_KEY } = this;
        if (isArray(val)) {
            durableChecked.push(...uniq(val, durableChecked, UNIQUE_KEY));
            multiple && this.$nextTick(() => {
                val.every(v => {
                    this.setStatus(v, true);
                    return true;
                });
            });
        }
    }
    /**
     * @description: 设置请求参数
     * @param {Object} query: 待设置的参数
     * @return {Boolean}
     */
    setParams(query: Dictionary<any>): boolean {
        const { _inactive, queryParams } = this;
        // 参数未发生改变时，不重新触发
        if (_inactive || isEqual(query, queryParams)) return true;
        this.$set(this, 'queryParams', query);
        this.refresh();
        return false;
    }
    /**
     * @description: 请求事件
     * @param {Boolean} isFirst: 是否返回首页
     */
    async refresh(isFirst?: boolean) {
        if (this._inactive) return;
        const { tableInfo: { axios }, temporaryChecked, durableChecked, multiple, UNIQUE_KEY } = this;
        this.loading = true;
        const { type, data } = await axios(isFirst === true ? { ...this.queryParams, pageNum: 1 } : this.queryParams);
        if (!type) {
            durableChecked.push(...uniq(temporaryChecked, durableChecked, UNIQUE_KEY));
            temporaryChecked.splice(0);
            if (isArray(data)) {
                this.list.list = data;
                Object.assign(this.list.page, { count: data.length, pageNum: 1, countPage: 1 });
            } else {
                this.list = data;
            }
            multiple && this.$nextTick(() => {
                durableChecked.every(v => {
                    this.setStatus(v, true);
                    return true;
                });
            });
        }
        this.loading = false;
    }
    // 双击事件
    handle(data: Datum) {
        const { multiple } = this;
        if (multiple) return;
        this.rowChange(data);
        this.ok();
        this.hide();
    }
    // 单选选中项改变事件
    rowChange(data: Datum) {
        const { multiple, uniqueChecked } = this;
        if (multiple) return;
        uniqueChecked.splice(0, 1, data);
    }
    // table 选中项取消时从确定列表中删除相同数据
    removeDurableChecked(data: Datum | Datum[]) {
        const { durableChecked, UNIQUE_KEY } = this;
        const _data = isArray(data) ? data : [data];
        // 从确定选中列表中删除
        _data.every(data => {
            const j = durableChecked.findIndex(v => v[UNIQUE_KEY] === data[UNIQUE_KEY]);
            if (j !== -1) durableChecked.splice(j, 1);
            return true;
        });
    }
    // 多选时，删除选中项事件
    removeOption(data: Datum) {
        const { temporaryChecked, durableChecked, UNIQUE_KEY } = this;
        // 从临时选中列表中删除
        const i = temporaryChecked.findIndex(v => v[UNIQUE_KEY] === data[UNIQUE_KEY]);
        if (i !== -1) temporaryChecked.splice(i, 1);
        // 从确定选中列表中删除
        const j = durableChecked.findIndex(v => v[UNIQUE_KEY] === data[UNIQUE_KEY]);
        if (j !== -1) durableChecked.splice(j, 1);
        this.setStatus(data, false);
    }
    // 重置 table 数据指定项数据的状态
    setStatus(data: Datum, status: boolean = false) {
        const { multiple, UNIQUE_KEY, list: { list }} = this;
        if (!multiple) return;
        const a = this.$refs.table.$refs.table.$refs.table as any;
        const _index = list.findIndex(v => v[UNIQUE_KEY] === data[UNIQUE_KEY]);
        if (_index === -1) return;
        if (a.objData.hasOwnProperty(_index)) {
            a.objData[_index]._isChecked = status;
        }
    }
    // 确定事件
    @Emit('success')
    ok() {
        const { multiple, finallyChecked, uniqueChecked } = this;
        return multiple ? finallyChecked : uniqueChecked;
    }
}
</script>

<style scoped lang="scss">
    @import '~@/views/styles/list.scss';
    
    $aside-width: 200px;
    $space: 20px;
    
    .popup-table-wrapper {
        width: 100%; height: calc(80vh - 100px);
        vertical-align: top;
        margin: 0;
    }
    .popup-table-wrapper-decrease-side {
        width: calc(100% - #{$aside-width});
        display: inline-flex;
    }
    // 左右两侧
    .popup-checked {
        width: $aside-width; height: calc(80vh - 100px);
        vertical-align: top;
        display: inline-flex;
        &-selection {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
    }
</style>