<template>
    <my-modal
        v-model="value"
        @on-visible-change="$event || destroy()"
        :loading-func="ok"
        :title="`${titlePrefix}${$t('h.modal.titles.customer')}`"
        :footer-hide="forbidden"
        width="780px"
        loading
    >
        <loading :loading="loading" type="B" />
        <i-form :model="formInline" :rules="rules" class="form" ref="form">
            <form-item prop="name" :label="i18n.label.name">
                <i-input v-model="formInline.name" :readonly="forbidden" :placeholder="i18n.placeholder.name" />
            </form-item>
            <div class="col">
                <form-item prop="adminor" class="col2" :label="i18n.label.adminor">
                    <i-input v-model="formInline.adminor" :readonly="forbidden" :placeholder="i18n.placeholder.adminor" />
                </form-item>
                <form-item prop="adminor_phone" class="col2" :label="i18n.label.adminor_phone">
                    <i-input v-model="formInline.adminor_phone" :readonly="forbidden" :placeholder="i18n.placeholder.adminor_phone" />
                </form-item>
            </div>
            <div class="col">
                <form-item prop="lng" class="col2" :label="i18n.label.lng">
                    <i-input v-model="formInline.lng" :placeholder="i18n.placeholder.lng" :readonly="forbidden" />
                </form-item>
                <form-item prop="lat" class="col2" :label="i18n.label.lat">
                    <div class="col">
                        <i-input v-model="formInline.lat" class="a-w" :placeholder="i18n.placeholder.lat" :readonly="forbidden" />
                        <my-button v-show="!forbidden || (formInline.lng && formInline.lat)" @click="openLocation" class="k-w" type="primary">{{forbidden ? $t('h.formLabel.watch') : ''}}{{$t('h.formLabel.location')}}</my-button>
                    </div>
                </form-item>
            </div>
            <form-item prop="address" :label="i18n.label.address">
                <i-input v-model="formInline.address" :readonly="forbidden" :placeholder="i18n.placeholder.address" />
            </form-item>
            <form-item prop="remark" :label="i18n.label.remark">
                <i-input v-model="formInline.remark" :readonly="forbidden" type="textarea" :placeholder="i18n.placeholder.remark" />
            </form-item>
        </i-form>
    </my-modal>
</template>

<script lang="ts">
import { Prop, Watch, Component } from 'vue-property-decorator';
import { Form as IForm, FormItem, Input as IInput } from 'view-design';
import { Popup } from '@/base-class/dynamic-create';
import { setOrg as set, getOrgInfo as get } from '@/config/api';

@Component({
    name: 'CustomerManageHandle',
    components: {
        IForm,
        FormItem,
        IInput,
    },
})
export default class CustomerManageHandle extends Popup<'SetOrg'> {
    $refs!: {
        form: IForm;
    }

    loading = false;
    formInline = {
        type: 1,
        id: 0,
        name: '',
        adminor: '',
        adminor_phone: 0,
        lng: '',
        lat: '',
        address: '',
        remark: '',
    };

    get i18n() {
        const label = {
            name: `${this.$t('h.formLabel.name')}: `,
            address: `${this.$t('h.formLabel.address')}: `,
            adminor: `${this.$t('h.formLabel.customerManage.personInCharge')}: `,
            adminor_phone: `${this.$t('h.formLabel.customerManage.personInChargeTelephone')}: `,
            lng: `${this.$t('h.formLabel.lng')}: `,
            lat: `${this.$t('h.formLabel.lat')}: `,
            remark: `${this.$t('h.formLabel.remark')}: `,
        };
        const placeholder = {
            name: this.$t('h.placeholder.pleaseEnter', { msg: label.name }),
            address: this.$t('h.placeholder.pleaseEnter', { msg: label.address }),
            adminor: this.$t('h.placeholder.pleaseEnter', { msg: label.adminor }),
            adminor_phone: this.$t('h.placeholder.pleaseEnter', { msg: label.adminor_phone }),
            lng: this.$t('h.placeholder.pleaseEnter', { msg: label.lng }),
            lat: this.$t('h.placeholder.pleaseEnter', { msg: label.lat }),
            remark: this.$t('h.placeholder.pleaseEnter', { msg: label.remark }),
        };

        return { label, placeholder };
    }
    get rules() {
        const { placeholder } = this.i18n;

        return {
            name: { required: true, message: placeholder.name, trigger: 'blur' },
            address: { required: true, message: placeholder.address, trigger: 'blur' },
        };
    }

    @Watch('type', { immediate: true })
    changeT(type: 1 | 2 | 'details') {
        typeof type === 'number' && (this.formInline.type = type);
    }

    // 打开前事件
    prefixFunc() {
        const {
            formInline,
            id,
        } = this;

        id && (formInline.id = id);
        id && this.getDetails();
    }
    // 关闭前事件
    suffixFunc() {
        this.$refs.form.resetFields();
        console.log(this.formInline);
    }
    // 获取详情
    async getDetails() {
        const { id } = this;
        if (!id) return console.log('请填写详情 id: ', id);
        this.loading = true;
        const { type, data } = await get(id);
        if (!type) this.setDetails(data);
        this.loading = false;
    }
    // 设置详情
    setDetails({ address, name, adminor, adminor_phone, lng, lat, remark, ...args }: API.Response['OrgInfo']) {
        const { formInline } = this;
        Object.assign(formInline, {
            address,
            name,
            adminor,
            adminor_phone: Number(adminor_phone) || 0,
            lng,
            lat,
            remark,
        });
    }
    /**
     * @description: 打开地图窗口
     * @param {Number | String} lng: 经度
     * @param {Number | String} lat: 纬度
     * @param {Boolean} readonly: 是否只读
     */
    openLocation() {
        const { formInline, formInline: { lng, lat }, forbidden: readonly } = this;
        this.$getDynamicComponent('location', () => {
            this.$createLocationHandle({
                lng: Number(lng),
                lat: Number(lat),
                readonly,
                $events: {
                    success: (point: baiduMap['point']) => Object.assign(formInline, point),
                },
            }).show();
        });
    }
    // 提交事件
    async ok() {
        const { $refs: { form: { validate }}, formInline} = this;
        const flag = await validate();
        if (flag) {
            this.loading = true;
            const params = { ...formInline };
            const { type: types } = await set(params);
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