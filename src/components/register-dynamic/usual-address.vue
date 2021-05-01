<template>
    <my-modal
        v-model="value"
        @on-visible-change="$event || destroy()"
        :loading-func="ok"
        :title="`${titlePrefix}${$t('h.modal.titles.usualAddress')}`"
        width="780px"
        loading
    >
        <loading :loading="loading" type="B" />
        <i-form :model="formInline" :rules="rules" class="form" ref="form">
            <form-item :label="i18n.label.address" prop="address">
                <i-input v-model="formInline.address" readonly :placeholder="i18n.placeholder.address" />
            </form-item>
            <form-item :label="i18n.label.name" prop="name">
                <i-input v-model="formInline.name" :readonly="forbidden" :placeholder="i18n.placeholder.name" />
            </form-item>
        </i-form>
    </my-modal>
</template>

<script lang="ts">
import { Prop, Watch, Component } from 'vue-property-decorator';
import { Form as IForm, FormItem, Input as IInput } from 'view-design';
import { Popup } from '@/base-class/dynamic-create';
import { setUsualAddressInfo as set } from '@/config/api';

@Component({
    name: 'UsualAddressHandle',
    components: {
        IForm,
        FormItem,
        IInput,
    },
})
export default class UsualAddressHandle extends Popup<'UsualAddressInfo'> {
    $refs!: {
        form: IForm;
    }

    // 从外部传递的 lng，lat，zoom，address 参数
    @Prop({ type: Object, required: true })
    fromParams!: API.Parameter['UsualAddressInfo'];
    // 编辑的参数
    @Prop({ type: Object, default: () => ({}) })
    data!: ResponseMap.UsualAddressList;

    loading = false;
    formInline = {
        type: 1,
        id: 0,
        name: '',
        lng: '',
        lat: '',
        address: '',
        zoom: 5,
    }

    get i18n() {
        const label = {
            name: `${this.$i18n.t('h.other.customName')}: `,
            address: `${this.$i18n.t('h.formLabel.address')}: `,
        };
        const placeholder = {
            name: this.$i18n.t('h.placeholder.pleaseEnter', { msg: label.name }),
            address: this.$i18n.t('h.placeholder.pleaseEnter', { msg: label.address }),
        };

        return { label, placeholder };
    }
    get rules() {
        const { placeholder } = this.i18n;

        return {
            name: { required: true, message: placeholder.name, trigger: 'blur' },
        };
    }

    @Watch('type', { immediate: true })
    changeT(type: 1 | 2 | 'details') {
        typeof type === 'number' && (this.formInline.type = type);
    }
    @Watch('fromParams', { immediate: true })
    fromParamsChange(val: API.Parameter['UsualAddressInfo']) {
        const { formInline } = this;
        Object.assign(formInline, val);
    }

    // 打开前事件
    prefixFunc() {
        const { formInline, data, id } = this;

        id && (formInline.id = id);
        data && this.setDetails(data);
    }
    // 关闭前事件
    suffixFunc() {
        this.$refs.form.resetFields();
    }
    // 设置详情
    setDetails({ org_id, ...data }: ResponseMap.UsualAddressList) {
        const { formInline } = this;
        Object.assign(formInline, data);
    }
    // 提交事件
    async ok() {
        const { $refs: { form: { validate }}, formInline } = this;
        const flag = await validate();
        if (flag) {
            this.loading = true;
            const { type: types } = await set(formInline);
            if (!types) this.$emit('success');
            this.loading = false;
            return !types;
        }
        return false;
    }
}
</script>
<style scoped lang="scss">
    @import '~@/views/styles/popup.scss';
</style>