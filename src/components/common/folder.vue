<template>
    <div class="folder-wrapper">
        <loading v-show="expand && loading" :loading="loading" type="B" />
        <svg-icon
            v-if="allowHide"
            @click="expand = !expand"
            :style="{transform: `rotate(${expand - 1 && 180}deg)`}"
            class="folder-icon c-p"
            icon-class="angle-right"
        />
        <div v-show="expand" class="folder" :style="{width}">
            <p class="folder-title d-v-c">{{title || $t('h.tree.auxiliaryOptions')}}</p>
            <div class="folder-conditions pseudo-prefix-empty" :label="$t('h.tips.noFilterSelected')">
                <template v-for="(data, key) in checkCondition">
                    <template v-for="item of data">
                        <p
                            :key="`${key}${item.value}`"
                            v-if="item.value"
                            @click="removeCondition(key, item.value)"
                            :title="item.title"
                            class="folder-conditions-item c-p t-o-e"
                        >
                            {{item.title}}
                            <span class="folder-conditions-item-delete t-a">{{$t('h.tableButton.delete')}}</span>
                        </p>
                    </template>
                </template>
            </div>
            <div v-if="scrollData.length > 1" class="folder-list">
                <span
                    v-for="item of scrollData" :key="item.value"
                    @click="handle(item)"
                    :class="{'folder-list-item-active': tag === item.value}"
                    class="folder-list-item d-v-c c-p"
                >{{ $te(item.title) ? $t(item.title) : item.title }}</span>
            </div>
            <scroll :observeDOM="true" :freeScroll="true" direction="horizontal" class="folder-tree" preventDefault>
                <tree
                    @on-select-change="selected"
                    :data="treeDatum"
                    :loadData="loadData"
                />
            </scroll>
        </div>
    </div>
</template>

<script lang="ts">
import { Prop, Watch, Component, Vue } from 'vue-property-decorator';
import { Tree } from 'view-design';
import { DictModule } from '@/store/modules/dict';
import { isString, isNumber, isFunction, isArray, recursion, getDepth, carryChained } from '@/utils';

type ScrollDatum = Dictionary<any>;
type Datum = Dictionary<any>;
type CheckCondition = Record<string, Checked[]>
type Checked = { title: string; value: string | number; key?: string; resetKey?: string[] };

/**
  * 允许传递的参数
  * @return 父组件接收到的事件
  * $emit('change', data) 条件发生改变时触发
  * @param {Array} data: 已选中的条件
  * $emit('tag-change', value) scroll 发生改变
  * @param {String} value: 选中的 tag;
  */
@Component({
    components: {
        Tree,
    },
})
export default class Folder extends Vue {
    // 初始的选中项
    @Prop({ type: String, default: '' })
    value!: string;
    // @default: 辅助选项
    @Prop({ type: String })
    title!: string;
    // 滚动的数据源
    @Prop({ type: Array, required: true })
    scrollData!: ScrollDatum[];
    // 是否允许隐藏
    @Prop({ type: Boolean, default: true })
    allowHide!: boolean;
    // 初始是否展开
    @Prop({ type: Boolean, default: true })
    expandDefault!: boolean;
    @Prop(String)
    width!: string;
    // 回填的信息
    @Prop({ type: Object, default: () => ({}) })
    backfill!: Dictionary<any>;



    loading = false;
    checkCondition: CheckCondition = {};
    tag = this.value || this.scrollData[0].value; // 当前展示的 tag
    expand = this.expandDefault;


    // 当前展示的树形信息
    get treeInfo(): ScrollDatum {
        const { tag, scrollData } = this;
        const result = scrollData.find(v => v.value === tag);
        return result || { uniqueKey: 'value', options: [] };
    }
    // 当前树形结构的数据源
    get treeDatum(): Datum[] {
        const { treeInfo } = this;
        return treeInfo.options || [];
    }
    // 获取当前项的 key
    get uniqueKey(): string {
        const { treeInfo } = this;
        return treeInfo.uniqueKey || 'value';
    }


    // created() {
    //     const { tag, backfill, scrollData } = this;
    //     const treeInfo = scrollData.find(v => v.value === tag);
    //     if (!treeInfo) return;
    //     let isInit = !!backfill[tag];
    //     if (!isInit && treeInfo.levelKey) {
    //         isInit = treeInfo.levelKey.some((k: string) => backfill[k]);
    //     }
    //     isInit || this.referenceValueGetTreeData(treeInfo);
    // }


    @Watch('scrollData', { immediate: true })
    initCondition(val: ScrollDatum[]) {
        const { treeInfo, backfill, tag } = this;
        const result = val
            .reduce((prev, { value }) => ({ ...prev, [value]: [] }), {});
        let isInit = !!backfill[tag];
        if (!isInit && treeInfo.levelKey) {
            isInit = treeInfo.levelKey.some((k: string) => backfill[k]);
        }
        isInit || this.referenceValueGetTreeData(treeInfo);
        this.$set(this, 'checkCondition', result);
    }
    @Watch('backfill', { immediate: true })
    backfillChange(val: Dictionary<any>) {
        const { scrollData } = this;
        Object.entries(val).every(([k, v]) => {
            const result = scrollData.find(v => {
                if (v.value === k) return true;
                return (v.levelKey || []).includes(k);
            });
            if (result && v) {
                const { options } = result;
                options.length
                    ? this.callback(result, k, v)
                    : this.referenceValueGetTreeData(result, () => this.callback(result, k, v));
            }
            return true;
        });
    }


    /**
     * @description: 设置指定 tree 的数据源
     * @param {String} result: tree 信息
     * @param {Function} fn: 赋值后的回调(给回填参数用)
     */
    referenceValueGetTreeData(result: ScrollDatum, fn?: (data: Datum[]) => void) {
        if (!(result && result.type && !result.options.length)) return;
        this.loading = true;
        DictModule
            .getCustomDicts({ type: result.type, params: result.params })
            .then(data => {
                if (!isString(data)) {
                    isFunction(result.parseData) && recursion(data, result.parseData);
                    result.options = data;
                    isFunction(fn) && fn(data);
                }
                this.loading = false;
            });
    }
    /**
     * @description: 上方滚动框的选中事件
     * @param {Object} datum: 点击项信息
     */
    handle(datum: ScrollDatum) {
        this.tag = datum.value;
        datum.options.length || this.referenceValueGetTreeData(datum);
        this.$emit('tag-change', datum.value);

    }
    /**
     * @description: 已选中的树状列表
     * @param {Array} data: 当前选中的数据
     * @param {Object} datum: 点击项
     * @emit {Array} 已选中项信息
     */
    selected(data: Datum[], datum: Datum) {
        const { treeInfo: { value, levelKey }, checkCondition, treeDatum, uniqueKey } = this;
        checkCondition[value] = [datum]
            .map(({ selected, title, ...args }) => ({
                value: selected ? args[uniqueKey] : '',
                title,
                resetKey: levelKey,
                key: args._type
                    ? args._type
                    : isArray(levelKey) && levelKey.length
                        ? levelKey[getDepth(treeDatum, uniqueKey, args[uniqueKey])!]
                        : undefined,
            }));
        this.$emit('change', this.formatCondition(checkCondition));
    }
    /**
     * @description: 删除条件
     * @param {String} type: 条件的类别
     * @param {String} value: 条件的 value
     */
    removeCondition(type: string, value: string) {
        let conditionArr = this.checkCondition[type];
        const result = conditionArr.find(v => v.value === value);
        result && (result.value = '');
        this.$emit('change', this.formatCondition(this.checkCondition));
    }
    /**
     * @description: 设置树形数据展开选中状态, 同时回填条件
     * @param {Object} treeInfo: 树信息
     * @param {String} k: 条件中保存的 key
     * @param {String} v: 匹配的值
     */
    callback(treeInfo: ScrollDatum, k: string, v: string | number) {
        const { checkCondition } = this;
        const { options, value: key, uniqueKey = 'value', levelKey } = treeInfo;
        carryChained(options, { [uniqueKey]: isNaN(v as number) ? v : Number(v) }, (data, isDeep) => {
            if (isDeep) {
                this.$set(data, 'selected', true);
                checkCondition[key] = [
                    { title: data.title, value: v, key: k, resetKey: levelKey },
                ];
            }
            else {
                this.$set(data, 'expand', true);
            }
        });
    }
    /**
     * @description: 格式化条件
     * @param {Object} condition: 待格式化的条件
     */
    formatCondition(condition: CheckCondition) {
        const result: Dictionary<any> = {};

        Object.entries(condition).every(([k, [v]]) => {
            if (v) {
                const key = v.key || k;

                isArray(v.resetKey) && v.resetKey.every(k => {
                    // 存在多级的 key 时, 防止无法被内部的覆盖, 从而导致条件出错
                    result[k] = undefined;
                    return true;
                });
                result[key] = v.value;
            }
            return true;
        });
        return result;
    }
    /**
     * @description: 异步加载数据
     */
    async loadData(data: any, cb: (data: any[]) => void) {
        const { uniqueKey, treeInfo, treeInfo: { value, options, levelKey }} = this;
        if (!isFunction(treeInfo.loadData)) return this.$delete(data, 'loading');
        let k = data._type || value;
        if (!data._type && levelKey && levelKey.length) {
            const index = getDepth(options, uniqueKey, data[uniqueKey]);
            isNumber(index) && index < levelKey.length && (k = levelKey[index]);
        }

        const newData = await treeInfo.loadData(data, k);
        
        newData && newData.length
            ? cb(newData)
            : this.$delete(data, 'loading');
    }
}

</script>

<style scoped lang="scss">
    $condition-height: 30px;
    $icon-size: 20px;

    .folder-wrapper {
        width: 100%; height: 100%;
        color: $--gray;
        position: relative;
        .folder-icon {
            width: $icon-size; height: $icon-size;
            background-color: $--background-folder-color;
            border-radius: 2px;
            border: $--border-base-color;
            position: absolute;
            top: 0; left: 100%;
        }
        .folder {
            width: 100%; height: 100%;
            border: $--border-base-color;
            border-radius: 5px;
            overflow: hidden;
            display: flex;
            flex-flow: column;
            &-title {
                height: 40px;
                border-bottom: $--border-base-color;
                background-color: $--background-folder-color;
                font-size: 16px;
            }
            &-conditions {
                height: $condition-height;
                padding: 0 10px;
                border-bottom: $--border-base-color;
                display: flex;
                align-items: center;
                &-item {
                    width: 33%;
                    position: relative;
                    padding-right: 6px;
                    &-delete:hover {
                        opacity: 1;
                    }
                    &-delete {
                        opacity: 0;
                        color: $--white;
                        position: absolute;
                        left: 0; right: 0;
                        top: 0; bottom: 0;
                        background-color: $--background-tooltip-color;
                        transition: $--fade-linear-transition;
                    }
                }
            }
            &-list {
                height: $condition-height;
                border-bottom: $--border-base-color;
                display: flex;
                &-item {
                    &:last-child {
                        border-right: none;
                    }
                    width: 100%; height: 100%;
                    border-right: $--border-base-color;
                    flex: auto;
                    &-active {
                        color: $--text-active-color;
                    }
                }
            }
            &-tree {
                flex: auto;
            }
        }
    }
</style>