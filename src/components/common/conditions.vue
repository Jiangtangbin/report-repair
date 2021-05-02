<template>
    <component :is="tag" class="condition-wrapper" :bordered="false">
        <slot name="append" />
        <!-- 树形下拉列表 -->
        <template v-for="(data, key) of treeSelectInfo">
            <tree-select
                @input="data.name = $event;"
                :value="data.name"
                :key="key"
                :data="data.options"
                :multiple="data.multiple"
                :max-tag-count="data.maxTagCount"
                :placeholder="getI18nValue(data.placeholder || 'h.placeholder.pleaseSelectFilterValues')"
                class="condition-option condition-select"
                check-strictly
                check-directly
                clearable
            ></tree-select>
        </template>
        <!-- 下拉列表 -->
        <template v-for="(data, key) of selectInfo">
            <i-select
                @input="data.name = $event;"
                :value="data.name"
                :key="key"
                :placeholder="getI18nValue(data.placeholder || 'h.placeholder.pleaseSelectFilterValues')"
                class="condition-option condition-select"
                clearable
                filterable
            >
                <i-option
                    v-for="item of data.options" :key="item.code || item.value"
                    :value="item.code || item.value"
                >{{data.type ? item.title || item.name : getI18nValue(item.title || item.name)}}</i-option>
            </i-select>
        </template>
        <!-- 搜索框列表 -->
        <i-input
            v-if="searchInfo.value"
            v-model.trim="searchInfo.title"
            @on-enter="$emit('search', search())"
            :placeholder="getI18nValue(searchInfo.placeholder || 'h.placeholder.pleaseEnterFilterValues')"
            class="condition-option condition-input"
        >
            <i-select
                v-model="searchInfo.value"
                class="condition-input-select"
                slot="append"
            >
                <i-option v-for="item of searchInfo.options" :key="item.value" :value="item.value">{{getI18nValue(item.title)}}</i-option>
            </i-select>
        </i-input>
        <slot v-if="showSearchBtn" :search="search">
            <my-button @click="$emit('search', search())" class="condition-option">{{getI18nValue('h.tableButton.search')}}</my-button>
        </slot>
    </component>
</template>

<script lang="ts">
import { Prop, Watch, Component, Vue } from 'vue-property-decorator';
import { Select as ISelect, Option as IOption, Input as IInput, Card } from 'view-design';
import { DictModule } from '@/store/modules/dict';
import { ICondition, IConditionSelect, IConditionTreeSelect } from '@/config/conditions';
import dynamicImport from '@/utils/component-dynamic-import';
import { isArray } from '@/utils/index';
import { formatParameter, getParameterKey } from '@/utils/utils';
import { i18n } from '@/locale/index';

const normalSearchInfo: ICondition = { title: '', options: [], value: '' };

/**
 * @description: 关于该组件的信息
 * @return 父组件接收到的事件
 * $emit('search', Object) 搜索事件传递的参数
 */
@Component({
    components: {
        ISelect,
        IOption,
        IInput,
        Card,
        TreeSelect: () => dynamicImport(() => import('@/components/tree-select/index.vue')),
    },
})
export default class Condition extends Vue {
    static prefixPath = 'h.condition.';
    static getValue(value: string) {
        const { prefixPath } = this;
        return i18n.te(value)
            ? i18n.t(value)
            : i18n.te(`${prefixPath}${value}`)
                ? i18n.t(`${prefixPath}${value}`)
                : value;
    }

    @Prop({ type: String, default: 'card' })
    // 是否需要搜索按钮
    tag!: string;
    @Prop({ type: Boolean, default: true })
    // 是否需要搜索按钮
    hasBtn!: boolean;
    // 用户树形下拉 treeSelect 筛选的参数
    @Prop({ type: Object, default: () => ({}) })
    treeSelects!: IConditionTreeSelect;
    // 用户下拉 select 筛选的参数
    @Prop({ type: Object, default: () => ({}) })
    selects!: IConditionSelect;
    // 用户自定义搜索参数
    @Prop(Object)
    inputs?: Dictionary<ICondition>;
    // 给 selects 或 inputs 回填的参数 -> { a: 1, b: [1, 2] }
    @Prop({ type: Object, default: () => ({}) })
    backfill!: Dictionary<string | number | string[] | number[]>;

    get showSearchBtn(): boolean {
        return this.hasBtn && !!(Object.keys(this.selects).length || this.searchInfo.value);
    }

    // 筛选的参数 -> { [key]: { options: 数据源, name: 默认值, placeholder, type?: 自定义字典, params?: 自定义字典 } }
    private selectInfo: IConditionSelect = {};
    // 树形下拉筛选参数 -> 格式同上
    private treeSelectInfo: IConditionTreeSelect = {};
    // 搜索的参数
    private searchInfo = { ...normalSearchInfo };
    // 外部传递的回填参数，如果该值不存在于内部的搜索参数中则保存此方法中
    private surplus: Dictionary<any> = {};


    // 参数发生改变时触发
    @Watch('inputs', { immediate: true })
    initParams(val: ICondition = normalSearchInfo) {
        this.searchInfo = { ...val };
    }
    // 参数发生改变时触发
    @Watch('selects', { immediate: true })
    selectChange<T extends GlobalCustomDicts.CustomDicts, K extends keyof GlobalCustomDicts.CustomDicts>(val?: IConditionSelect) {
        this.selectInfo = {};
        const { selectInfo } = this;
        if (val) {
            Object.entries(val).some(([k, val]) => {
                if (val.type) {
                    const a = val.name;
                    val.name = '';
                    DictModule.getCustomDicts({ type: val.type, params: val.params })
                        .then(data => {
                            if (typeof data !== 'string') {
                                val.options = data;
                                val.name || (val.name = a);
                            }
                        });
                }
                this.$set(selectInfo, k, val);
                return false;
            });
        }
    }
    // 参数发生改变时触发
    @Watch('treeSelects', { immediate: true })
    treeSelectChange<T extends GlobalCustomDicts.CustomDicts, K extends keyof GlobalCustomDicts.CustomDicts>(val?: IConditionTreeSelect) {
        this.treeSelectInfo = {};
        const { treeSelectInfo } = this;
        if (val) {
            Object.entries(val).some(([k, val]) => {
                if (val.type) {
                    DictModule.getCustomDicts({ type: val.type, params: val.params })
                        .then(data => {
                            if (typeof data !== 'string') {
                                val.options = data;
                            }
                        });
                }
                this.$set(treeSelectInfo, k, val);
                return false;
            });
        }
    }
    // 回填的参数改变时触发
    @Watch('backfill', { immediate: true })
    backfillParams(val: Dictionary<string | number | string[] | number[]> | undefined, oldVal?: any) {
        const { selectInfo, searchInfo, treeSelectInfo } = this;
        this.surplus = {};
        if (!val) return;
        Object.entries(val).some(([k, v]) => {
            if (selectInfo.hasOwnProperty(k)) {
                // 下拉参数回填
                selectInfo[k].name = v;
            }
            else if (
                (!(oldVal === undefined) || v) &&
                    searchInfo.options.some(v => v.value === k)
            ) {
                // 搜索参数回填
                searchInfo.value = k;
                typeof v !== 'object' && (searchInfo.title = (v as string));
            }
            else if (treeSelectInfo.hasOwnProperty(k)) {
                // 下拉树形参数回填，treeSelect 初始会触发值更改事件，所以延时回填
                setTimeout(() => {
                    treeSelectInfo[k].name = v;
                });
            }
            else {
                // 特殊的下拉树形参数回填
                const newKey = getParameterKey(k);
                if (newKey !== k && treeSelectInfo.hasOwnProperty(newKey)) {
                    setTimeout(() => {
                        // 延时赋值，防止被 treeSelect 触发的事件导致值被覆盖
                        treeSelectInfo[newKey].name = isArray(v) ? [...((treeSelectInfo[newKey].name as string[] | number[]) || []), ...v] : v;
                    });
                } else {
                    this.surplus[k] = v;
                }
            }
            return false;
        });
    }

    /**
     * @description: 搜索函数
     * @returns {Object} 待搜索的值
     */
    search() {
        const { surplus, selectInfo, treeSelectInfo, searchInfo: { title, value }} = this;
        const result: Dictionary<string | number | string[] | number[]> = {};
        value && (result[value] = title);
        Object.entries(treeSelectInfo)
            .concat(Object.entries(selectInfo))
            .some(([k, v]) => {
                result[k] = v.name;
                return false;
            });
        formatParameter(
            result,
            Object.entries(treeSelectInfo).reduce((prev, [k, v]) => Object.assign(prev, { [k]: v.options }), {})
        );

        return { ...surplus, ...result };
    }
    /**
     * @description: 获取国际化的值
     * @param {String} value: 待转换的值
     */
    getI18nValue(value: string) {
        return Condition.getValue(value);
    }
}
</script>

<style scoped lang="scss">
    $space: 5px;

    .condition-wrapper {
        width: 100%;
        display: flex;
        flex-flow: row wrap;
        align-items: center;
        @include utils-pierce(ivu-card-body) {
            display: flex;
            flex-flow: row wrap;
            align-items: center;
        }
        @include utils-pierce(condition) {
            &-option {
                margin: $space $space $space 0;
                top: 0;
                &:last-child {
                    margin-right: 0;
                }
            }
            // 下拉条件
            &-select {
                width: 200px;
            }
            // input 输入框
            &-input {
                width: 230px;
                &-select {
                    width: 90px;
                }
            }
            & button {
                flex: none;
            }
            .ivu-icon {
                width: 14px;
                height: 14px;
            }
        }
    }
</style>