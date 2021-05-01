<template>
    <div class="selection-wrapper">
        <header class="selection-header">
            <checkbox v-if="multiple && !(maxChecked && maxChecked < data.length)" @on-change="toggleAll" :value="isAllChecked">{{finalTitle}}</checkbox>
            <span v-else>{{finalTitle}}</span>
            <span v-if="!$scopedSlots.default">{{getCheckedLen ? getCheckedLen + '/' : ''}}{{filterData.length}}</span>
        </header>
        <div class="selection-section">
            <i-input
                v-model="value"
                @on-click="value = ''"
                :icon="value === '' ? 'ios-search' : 'ios-close'"
                class="selection-section-search"
                :placeholder="$t('h.placeholder.pleaseEnterFilterValues')"
            />
            <scroll :disableMouse="false" :data="filterData">
                <ul class="selection-section-list">
                    <li
                        v-for="(item, index) of filterData" :key="`${item[showKey]}${index}`"
                        @click.stop="handler(item)"
                        :class="{'selection-section-item-disabled': !$scopedSlots.default && (item.disabled || (!item.checked && reachMaxLen))}"
                        class="selection-section-list-item t-o-e c-p"
                    >
                        <slot :data="item" :index="index">
                            <!-- 格子被禁用有两种情况, 一种是本身被禁, 一种是达到最大选择数量被禁 -->
                            <template v-if="multiple">
                                <checkbox
                                    v-model="item.checked"
                                    @on-change="[ item.checked = $event, $emit('on-change') ]"
                                    :disabled="item.disabled || (!item.checked && reachMaxLen)"
                                ></checkbox>
                                <slot :data="item" :index="index" name="text">
                                    <span>{{item[showKey]}}</span>
                                </slot>
                            </template>
                            <template v-else>
                                <svg-icon v-if="item.checked" class="selection-section-list-item-checked" icon-class="check" />
                                <slot :data="item" :index="index" name="text">
                                    <span class="selection-section-list-item-checked-desc">{{item[showKey]}}</span>
                                </slot>
                            </template>
                        </slot>
                    </li>
                    <li v-if="!filterData.length" class="selection-section-list-empty">{{$te(noDataText) ? $t(noDataText) : noDataText}}</li>
                </ul>
            </scroll>
        </div>
    </div>
</template>

<script lang="ts">
import { Prop, Emit, Component, Vue } from 'vue-property-decorator';
import { Checkbox, Input as IInput, Poptip } from 'view-design';

@Component({
    components: {
        Checkbox,
        IInput,
        Poptip,
    },
})
export default class SelectBoxItem extends Vue {
    @Prop(Array)
    data!: Dictionary<any>[];
    @Prop(Boolean)
    multiple!: boolean;
    @Prop(String)
    showKey!: string;
    @Prop(Number)
    maxChecked?: number;
    @Prop(Function)
    filterMethod!: (data: Dictionary<any>, query: string, key: string) => boolean;
    @Prop({ type: String, default: 'h.modal.optionList' })
    title!: string;
    @Prop({ type: String, default: 'h.common.noData' })
    noDataText!: string;
    @Prop(Boolean)
    replaceChecked!: boolean;

    get finalTitle() {
        const { title } = this;
        return this.$te(title) ? this.$t(title) : title;
    }
    /**
     * 对数据源进行筛选 -> 最终展示的数据
     */
    get filterData() {
        const { data, value, filterMethod, showKey } = this;
        return data.filter(item => filterMethod(item, value, showKey));
    }
    /**
     * 获取选中的数据
     */
    get getChecked() {
        return this.filterData.filter(v => v.checked);
    }
    /**
     * 获取已选择的数量
     */
    get getCheckedLen() {
        return this.getChecked.length;
    }
    /**
     * 是否达到了最大选择数量
     */
    get reachMaxLen() {
        const { maxChecked, getCheckedLen, multiple, replaceChecked } = this;
        return multiple ? maxChecked && getCheckedLen >= maxChecked : (!replaceChecked && getCheckedLen >= 1);
    }
    /**
     * 是否已经全部选择
     */
    get isAllChecked() {
        const { multiple, filterData, filterData: { length }} = this;
        return multiple && !!length && filterData.every(item => item.checked);
    }

    value = '';

    /**
     * 点击选项列表
     * @param {Object} data: 点击项的数据
     */
    @Emit('on-change')
    handler(data: Dictionary<any>) {
        const { reachMaxLen, multiple, replaceChecked, getChecked } = this;
        if (data.disabled || (!data.checked && reachMaxLen) || this.$scopedSlots.default) return;
        const status = !data.checked;
        if (!multiple && replaceChecked) {
            getChecked.some(v => {
                v.checked = false;
                return false;
            });
        }
        data.checked = status;
    }
    /**
     * 点击头部的选择框时
     * @param {Boolean} flag: 当前全选框状态
     */
    toggleAll(flag: boolean) {
        this.filterData.some(item => {
            item.disabled || (item.checked = flag);
            return false;
        });
    }
}
</script>

<style scoped lang="scss">
    .selection-wrapper {
        width: 100%;
        flex: auto;
        display: flex;
        flex-flow: column;
        // background-color: $--background-option-box-color;
        transition: $--ease-in-out;
        &:hover {
            box-shadow: 0 1px 6px rgba(0,0,0,.2);
            border-color: #eee;
        }
        // 头部
        .selection-header {
            padding: 8px 16px;
            line-height: initial;
            border: $--border-base-color;
            border-radius: 6px 6px 0 0;
            flex: none;
            display: flex;
            justify-content: space-between;
            // background-color: $--background-selection-color;
            // color: $--white;
            // border: none;
        }
        // 主体
        .selection-section {
            border: $--border-base-color;
            border-top: none;
            border-radius: 0 0 6px 6px;
            position: relative;
            overflow: hidden;
            flex: auto;
            display: flex;
            flex-flow: column;
            // color: $--white;
            // 搜索框
            &-search {
                width: auto;
                margin: 8px 8px 0;
                flex: none;
                // @include utils-pierce(ivu-input) {
                //     background-color: $--background-form-box-color;
                //     border: $--border-form-box-color;
                //     color: $--white;
                //     box-shadow: $--shadow-form-box-inset-color;
                // }
                // @include utils-pierce(ivu-icon) {
                //     color: $--white;
                // }
            }
            // 选项列表
            &-list {
                padding: 4px 0;
                overflow: auto;
                flex: auto;
                &-item {
                    margin: 0;
                    line-height: normal;
                    padding: 7px 16px;
                    clear: both;
                    position: relative;
                    transition: background-color #{$--transition-time} #{$--ease-out-function};
                    &__checked {
                        position: absolute;
                        &-desc {
                            padding-left: 22px;
                        }
                    }
                    // 禁用项
                    &-disabled {
                        cursor: no-drop;
                        background-color: inherit !important;
                    }
                }
                // 空数据
                &-empty {
                    margin: 0;
                    line-height: normal;
                    padding: 7px 16px;
                    clear: both;
                }
            }
        }
    }
</style>