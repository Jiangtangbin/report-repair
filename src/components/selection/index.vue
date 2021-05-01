<template>
    <my-list
        @on-change="$emit('on-change', getChecked())"
        :data="source"
        :filter-method="filterMethod"
        :multiple="multiple"
        :max-checked="maxChecked"
        :show-key="showKey"
        :title="$te(title) ? $t(title) : title"
        :replace-checked="replaceChecked"
        :no-data-text="$te(noDataText) ? $t(noDataText) : noDataText"
        ref="list"
    >
            <template v-if="$scopedSlots.default" v-slot="{data, index}">
                <slot :data="data" :index="index" />
            </template>
            <template v-if="$scopedSlots.text" v-slot:text="{data, index}">
                <slot :data="data" :index="index" name="text" />
            </template>
    </my-list>
</template>

<script lang="ts">
import { Prop, Watch, Component, Vue } from 'vue-property-decorator';
import MyList from './selection-item.vue';

/**
 * select-box events
 * 选中发生改变时触发
 * $emit('on-change', data)
 * @param {Array} data: 已选中项
 * select-box slots
 * default(data, index): 内容区
 * @param {Object} data: 数据项
 * @param {Number} index: 下标
 */
@Component({
    name: 'Selection',
    components: {
        MyList,
    },
})
export default class Selection extends Vue {
    $refs!: {
        list: MyList;
    }

    // 数据源
    @Prop({ type: Array, default: () => ([]) })
    data!: Dictionary<any>[];
    // 是否可以多选
    @Prop(Boolean)
    multiple!: boolean;
    // 单选时，在选中的情况下，是禁用再次选择还是替换选择，默认是禁止选择
    @Prop(Boolean)
    replaceChecked!: boolean;
    // 多选时限制的选择的数量，multiple 为 true 的情况下
    @Prop(Number)
    maxChecked?: number;
    @Prop({ type: String, default: 'h.modal.optionList' })
    title!: string;
    // 展示的字段
    @Prop({ type: String, default: 'title' })
    showKey!: string;
    // 没有数据时展示的值
    @Prop({ type: String, default: 'h.common.noData' })
    noDataText!: string;
    // 筛选的方法，三个参数，数据源，搜索值与展示的 key，根据返回值来确定是否展示
    @Prop({ type: Function, default: (data: Dictionary<any>, query: string, key: string) => !data.hasOwnProperty(key) || data[key].indexOf(query) !== -1 })
    filterMethod!: (data: Dictionary<any>, query: string, key: string) => boolean;

    source: Dictionary<any>[] = [];

    // 已选中的数据
    get getData() {
        return this.$refs.list.getChecked;
    }

    @Watch('data', { immediate: true })
    initSource(val?: Dictionary<any>[]) {
        val && (this.source = val.map(({ checked, disabled, ...args }) => Object.assign(args, { checked, disabled })));
    }

    /**
     * @description: 获取已选中数据
     * @param {Boolean} excludeDisabled: 是否排除掉禁用的项
     */
    getChecked(excludeDisabled?: boolean) {
        return excludeDisabled ? this.getData.filter((item: Dictionary<any>) => !item.disabled) : this.getData;
    }
}
</script>