<template>
    <my-modal
        v-model="value"
        @on-visible-change="$event || destroy()"
        :loading-func="ok"
        :title="$t('h.modal.titles.workCancel')"
        width="780px"
        loading
    >
        <loading :loading="loading" type="B" />
        <i-form :model="formInline" :rules="rules" class="form" ref="form">
            <form-item prop="reason" :label="i18n.label.reason">
                <i-input v-model="formInline.reason" :readonly="forbidden" type="textarea" :placeholder="i18n.placeholder.reason" />
            </form-item>
        </i-form>
    </my-modal>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { Form as IForm, FormItem, Input as IInput } from 'view-design';
import { Popup } from '@/base-class/dynamic-create';
import { cancelWork as set } from '@/config/api';

const tableListType: Dictionary<string> = {
    reciever: 'account',
};

@Component({
    name: 'WorkPoolCancelManageHandle',
    components: {
        IForm,
        FormItem,
        IInput,
    },
})
export default class WorkPoolCancelManageHandle extends Popup<'CancelWork'> {
    $refs!: {
        form: IForm;
    }

    loading = false;
    formInline = {
        work_id: 0,
        reason: '',
    };

    get i18n() {
        const label = {
            reason: `${this.$t('h.formLabel.work.reason')}: `,
        };
        const placeholder = {
            reason: this.$t('h.placeholder.pleaseSelect', { msg: label.reason }),
        };

        return { label, placeholder };
    }
    get rules() {
        const { placeholder } = this.i18n;

        return {
            reason: { required: true, message: placeholder.reason },
        };
    }

    // 打开前事件
    prefixFunc() {
        const { formInline, id } = this;
        id && (formInline.work_id = id);
    }
    // 关闭前事件
    suffixFunc() {
        this.$refs.form.resetFields();
    }
    // 提交事件
    async ok() {
        const { $refs: { form: { validate }}, formInline} = this;
        const flag = await validate();
        if (flag) {
            this.loading = true;
            const params = { ...formInline };
            const { type } = await set(params);
            if (!type) this.$emit('success');
            this.loading = false;
            return !type;
        }
        return false;
    }
}
</script>

<style scoped lang="scss">
    @import '~@/views/styles/popup.scss';
</style>
