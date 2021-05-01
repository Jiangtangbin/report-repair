<template>
    <tree
        :data="data"
        @on-check-change="handleCheckSelect"
        v-on="parent.$listeners"
        v-bind="parent.$attrs"
        :load-data="loadDataCallback"
        show-checkbox
    ></tree>
</template>

<script>
import { Tree } from 'view-design';
import Emitter from 'view-design/src/mixins/emitter.js';

const arrayEqual = (arr1, arr2) => {
    // 判断数组的长度
    if (arr1.length !== arr2.length) {
        return false;
    } else {
    // 循环遍历数组的值进行比较
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) {
                return false;
            }
        }
        return true;
    }
};

export default {
    name: 'TreeSelectTree',
    mixins: [Emitter],
    components: {
        Tree,
    },

    props: {
        data: {
            type: Array,
            default: () => [],
        },
        selectedArray: {
            type: Array,
            default: () => [],
        },
        loadData: Function,
        nodeKey: String,
        multiple: Boolean,
    },

    data() {
        return {
            flatDic: {},
            checkedArray: [],
        };
    },

    inject: ['parent'],

    computed: {
        expandAll() {
            return this.parent.$attrs['expand-all'];
        },
    },

    watch: {
        data(newData) {
            this.updateFlagDic(newData);
            let selectArray = [];
            this.selectedArray.forEach(id => {
                if (id in this.flatDic) selectArray.push(id);
            });
            this.$emit('on-check', selectArray.map(id => this.flatDic[id]));
            if (this.expandAll) this.checkData(newData, false, true);
            this.parent.isChangedByTree = false; // 重置父级的状态, 防止异步改变数据后, 第一次删除选项无法触发的问题
        },
        selectedArray(newVal, oldVal) {
            if (arrayEqual(newVal, oldVal)) return;
            const filtedNewVal = newVal.filter(id => id in this.flatDic);
            this.$emit('on-check', filtedNewVal.map(id => this.flatDic[id]));
            this.$emit('on-clear');
            this.$nextTick(() => {
                this.checkData(this.data, true);
            });
        },
    },

    methods: {
        checkEmit(value, label) {
            this.dispatch('iSelect', 'on-select-selected', {
                value,
                label,
            });
            this.$emit('on-select-selected', {
                value,
                label,
            });
        },
        updateFlagDic(newData) {
            let newFlagDic = {};
            this.setFlagDic(newData, item => {
                newFlagDic[item[this.nodeKey]] = item;
            });
            this.flatDic = newFlagDic;
        },
        setFlagDic(data, callback) {
            data.forEach(item => {
                if (item.children && item.children.length) { this.setFlagDic(item.children, callback) }
                callback(item);
            });
        },
        handleCheckSelect(selectArray, selectItem) {
            const checked = this.multiple ? selectArray : [selectItem];
            this.$emit('on-check', checked);
            this.parent.$emit('on-change', checked);
        },
        checkData(data, emit, expandAll) {
            data.forEach(item => {
                if (this.selectedArray.includes(item[this.nodeKey])) {
                    this.$set(item, 'checked', true);
                    this.checkedArray.push(item);
                    if (emit) this.checkEmit(item[this.nodeKey], item.title);
                }
                else {
                    this.$set(item, 'checked', false);
                }
                if (item.children && item.children.length) {
                    if (this.expandAll && expandAll) this.$set(item, 'expand', true);
                    this.checkData(item.children, emit, expandAll);
                }
            });
        },
        loadDataCallback(item, callback) {
            this.loadData(item, data => {
                return (() => {
                    callback(data);
                    this.updateFlagDic(this.data);
                })(data);
            });
        },
    },

    mounted() {
        this.$nextTick(() => {
            this.checkData(this.data, true, true);
        });
    },
};
</script>