<template>
    <i-select
        v-bind="$attrs"
        @on-change="handleChange"
        @on-clear="handleChange"
        :multiple="multiple"
        class="tree-select-wrapper"
        ref="select"
    >
        <tree-select-tree-item
            :selectedArray="valueWrapper"
            :data="data"
            @on-clear="handleClear"
            :load-data="loadData"
            :nodeKey="nodeKey"
            :multiple="multiple"
            @on-check="handleTreeCheck"
        ></tree-select-tree-item>
    </i-select>
</template>

<script>
import { Select as ISelect } from 'view-design';
import Emitter from 'view-design/src/mixins/emitter';
import TreeSelectTreeItem from './tree.vue';

export default {
    name: 'TreeSelect',
    mixins: [Emitter],
    components: {
        TreeSelectTreeItem,
        ISelect,
    },
    props: {
        value: {
            type: [Array, String],
            default: () => [],
        },
        data: {
            type: Array,
            default: () => [],
        },
        multiple: Boolean,
        nodeKey: { type: String, default: 'value' },
        loadData: Function,
    },
    data() {
        return {
            isChangedByTree: true,
            isInit: true,
        };
    },
    provide() {
        return {
            parent: this,
        };
    },
    computed: {
        valueWrapper() {
            return [].concat(this.value);
        },
    },
    methods: {
        handleChange(selected) {
            if (!this.isChangedByTree) this.$emit('input', selected);
            this.isChangedByTree = false;
        },
        handleTreeCheck(selectedArray) {
            this.isChangedByTree = true;
            const result = selectedArray.map(item => item[this.nodeKey]);
            this.$emit('input', this.multiple ? result : result[0]);
        },
        handleClear() {
            this.$refs.select.reset();
        },
    },
};
</script>

<style scoped lang="scss">
    .tree-select-wrapper {
        .ivu-select-dropdown {
            padding: 0 6px;
        }
    }
</style>