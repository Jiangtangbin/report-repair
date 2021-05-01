<template>
    <my-modal
        v-model="value"
        @on-ok="ok"
        :loading-func="loadingFunc"
        :title="$t('h.modal.optionList')"
        :loading="loading"
    >
        <loading :loading="isLoading" type="B" />
        <tree v-bind="treeInfo" ref="tree" class="tree-wrapper" />
    </my-modal>
</template>

<script lang="ts">
import { Prop, Component } from 'vue-property-decorator';
import { Tree } from 'view-design';
import { BasePopup } from '@/base-class/dynamic-create';
import { DictModule } from '@/store/modules/dict';
import { carryChained, isFunction } from '@/utils';

@Component({
    name: 'BaseDataTreeHandle',
    components: {
        Tree,
    },
})
export default class BaseDataTreeHandle extends BasePopup {
    $refs!: {
        tree: Tree;
    }

    // 是否必填
    @Prop(Boolean)
    loading!: boolean;
    // 是否必填
    @Prop({ type: String, required: true })
    title!: string;
    // 字典类型
    @Prop({ type: [String, Number], required: true })
    t!: GlobalCustomDicts.CustomDicts[keyof GlobalCustomDicts.CustomDicts]['type'];
    // 字典类型
    @Prop({ type: [String, Number, Object] })
    params?: GlobalCustomDicts.CustomDicts[keyof GlobalCustomDicts.CustomDicts]['params'];
    // 默认选中字段
    @Prop({ type: Array, default: () => ([]) })
    checked!: object[];
    // 赋值给 tree 的其它属性
    @Prop({ type: Object, default: () => ({}) })
    trees!: Tree;
    // 触发 success 前执行的函数，第一个参数是选中的数据，第二个是数据源
    @Prop(Function)
    beforeSuccessFunc?: (checked: Dictionary<any>[], source: Dictionary<any>[]) => void;

    treeInfo = ({} as Tree);
    isLoading = false;

    // 打开前事件
    async prefixFunc() {
        const { t: type, params, checked, trees } = this;
        this.isLoading = true;
        const data = await DictModule.getCustomDicts({ type, params });
        if (typeof data === 'string') {
            this.$Message.info(this.$t('h.common.noData'));
            this.$set(this, 'treeInfo', { data: [], ...trees });
        }
        else {
            for (const item of checked) {
                carryChained((data as any), item, (v: any, isDeep?: boolean) => {
                    isDeep
                        ? v.selected = true
                        : v.expand = true;
                });
            }
            this.value = true;
            this.$set(this, 'treeInfo', { data, ...trees });
        }
        this.isLoading = false;
    }
    // 异步提交，做验证，防止必填项未选
    loadingFunc() {
        const { $Message } = this;
        const { length } = this.$refs.tree.getSelectedNodes();
        length ? this.ok() : $Message.info(this.$t('h.tips.required'));
        return !!length;
    }
    // 同步提交
    ok() {
        const { beforeSuccessFunc, treeInfo: { data }} = this;
        const checked = this.$refs.tree.getSelectedNodes();
        isFunction(beforeSuccessFunc) && beforeSuccessFunc(checked, data!);
        this.$emit('success', checked);
    }
}
</script>
<style scoped lang="scss">
    .tree-wrapper {
        max-height: calc(80vh - 140px);
        min-height: 200px;
        overflow: auto;
        color: $--white;
        @include utils-pierce(ivu-tree-title) {
            color: $--white;
            &:hover {
                background-color: $--background-tree-color;
            }
        }
        @include utils-pierce(ivu-tree-title-selected) {
            color: $--white;
            background-color: $--background-tree-color;
        }
    }
</style>