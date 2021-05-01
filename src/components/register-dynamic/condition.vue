<template>
    <my-modal
        v-model="value"
        @on-ok="ok"
        :title="$t('h.modal.titles.queryCriteria')"
        width="780px"
    >
        <my-condition v-bind="condition" :backfill="backfillBack" :has-btn="false" class="form" ref="condition" />
    </my-modal>
</template>

<script lang="ts">
import { Prop, Component } from 'vue-property-decorator';
import { BasePopup } from '@/base-class/dynamic-create';
import MyCondition from '@/components/common/conditions.vue';
import { mapConditions } from '@/config/conditions';
import { i18n } from '@/locale/index';

const conditions = {
    ...mapConditions,
};

@Component({
    name: 'ConditionHandle',
    components: {
        MyCondition,
    },
})
export default class ConditionHandle extends BasePopup {
    $refs!: {
        condition: MyCondition;
    };

    // 显示筛选条件的类型
    @Prop({ type: String, validator: (val: string) => conditions.hasOwnProperty(val) })
    t!: string;
    // 回填的条件
    @Prop({ type: Object, default: () => ({}) })
    backfill?: Dictionary<any>;

    condition = {};
    tBack = '';
    backfillBack = this.backfill || '';

    // 打开前事件
    prefixFunc() {
        const { t, tBack, backfill } = this;
        const func = conditions[t as 'o'];
        t !== tBack && func && this.$set(this, 'condition', func());
        this.$set(this, 'backfillBack', { ...backfill });
    }
    // 关闭前事件
    suffixFunc() {

    }
    // 提交事件
    async ok() {
        const result = this.$refs.condition.search();
        this.$emit('success', result);
        return false;
    }
}
</script>

<style scoped lang="scss">
    @import '~@/views/styles/popup.scss';

    @include utils-pierce (condition-wrapper) {
        width: 100%;
        flex-flow: column;
        align-items: flex-start;
        background: none;
        .ivu-card-body {
            padding: 0;
            .ivu-input {
                border-right: none;
            }
        }
    }
</style>
