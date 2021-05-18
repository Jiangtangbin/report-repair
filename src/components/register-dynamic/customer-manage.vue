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
                <form-item prop="city" class="col2" :label="i18n.label.city">
                    <i-select v-model="formInline.city" @on-change="cityChange" :disabled="forbidden" :placeholder="i18n.placeholder.city" clearable>
                        <i-option v-for="item of dicts.city" :key="item.code" :value="item.code">{{item.name}}</i-option>
                    </i-select>
                </form-item>
                <form-item prop="area" class="col2" :label="i18n.label.area">
                    <i-select v-model="formInline.area" :disabled="forbidden" :placeholder="i18n.placeholder.area" clearable>
                        <i-option v-for="item of dicts.area" :key="item.code" :value="item.code">{{item.name}}</i-option>
                    </i-select>
                </form-item>
            </div>
            <form-item prop="address" :label="i18n.label.address">
                <i-input v-model="formInline.address" :readonly="forbidden" :placeholder="i18n.placeholder.address" />
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
        </i-form>
    </my-modal>
</template>

<script lang="ts">
import { Watch, Component } from 'vue-property-decorator';
import { Form as IForm, FormItem, Input as IInput, Select as ISelect, Option as IOption } from 'view-design';
import { Popup } from '@/base-class/dynamic-create';
import { locationReg } from '@/utils/utils';
import { setOrg as set, getOrgInfo as get } from '@/config/api';
import { DictModule } from '@/store/modules/dict';

@Component({
    name: 'CustomerManageHandle',
    components: {
        IForm,
        FormItem,
        IInput,
        ISelect,
        IOption,
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
        city: '',
        area: '',
    };
    dicts = { 
        city: [],
        area: [],
    } as Record<'city' | 'area', Dictionary<any>[]>;

    get i18n() {
        const label = {
            name: `${this.$t('h.formLabel.name')}: `,
            address: `${this.$t('h.formLabel.address')}: `,
            adminor: `${this.$t('h.formLabel.customerManage.personInCharge')}: `,
            adminor_phone: `${this.$t('h.formLabel.customerManage.personInChargeTelephone')}: `,
            lng: `${this.$t('h.formLabel.lng')}: `,
            lat: `${this.$t('h.formLabel.lat')}: `,
            city: `${this.$t('h.formLabel.city')}: `,
            area: `${this.$t('h.formLabel.area')}: `,
        };
        const placeholder = {
            name: this.$t('h.placeholder.pleaseEnter', { msg: label.name }),
            address: this.$t('h.placeholder.pleaseEnter', { msg: label.address }),
            adminor: this.$t('h.placeholder.pleaseEnter', { msg: label.adminor }),
            adminor_phone: this.$t('h.placeholder.pleaseEnter', { msg: label.adminor_phone }),
            lng: this.$t('h.placeholder.pleaseEnter', { msg: label.lng }),
            lat: this.$t('h.placeholder.pleaseEnter', { msg: label.lat }),
            city: this.$t('h.placeholder.pleaseSelect', { msg: label.city }),
            area: this.$t('h.placeholder.pleaseSelect', { msg: label.area }),

        };

        return { label, placeholder };
    }
    get rules() {
        const { placeholder } = this.i18n;

        return {
            name: { required: true, message: placeholder.name, trigger: 'blur' },
            address: { required: true, message: placeholder.address, trigger: 'blur' },
            lng: { required: true, validator: (rule: any, val: string, callback: Function) => callback(locationReg(val, 'lng')) },
            lat: { required: true, validator: (rule: any, val: string, callback: Function) => callback(locationReg(val, 'lat')) },
            city: { required: true, message: placeholder.city, trigger: 'blur' },
            area: { required: true, message: placeholder.area, trigger: 'blur' },
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
            dicts: {
                city: { length: city },
                area: { length: area },
            },
        } = this;

        id && (formInline.id = id);
        city || this.getDicts('city', 'city');
        area || this.getDicts('area', 'area');
        id && this.getDetails();
    }
    // 关闭前事件
    suffixFunc() {
        this.$refs.form.resetFields();
    }
    cityChange() {
        const {
            dicts: {
                area: { length: area },
            },
        } = this;
        area || this.getDicts('area', 'area');
    }
    /**
     * 获取字典数据
     * @param {String} key: 成功赋值的键
     * @param {String} type: 字典请求的类型
     * @param {any} params?: 字典请求的参数
     */
    async getDicts<T extends keyof CustomerManageHandle['dicts']>(key: T, type: GlobalCustomDicts.CustomDictsKey, params?: GlobalCustomDicts.CustomDictsValue) {
        const { dicts, formInline: { city } } = this;
        let data = await DictModule.getCustomDicts({ type, params });
        if (data && typeof data !== 'string') {
            if (key === 'area') {
                (dicts[key] as any) = data.find(item => item.code === city)?.children || [];
            } else {
                (dicts[key] as any[]) = data;
            }
        }
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
    setDetails({ address, name, adminor, adminor_phone, lng, lat, city, area, ...args }: API.Response['OrgInfo']) {
        const { formInline } = this;
        Object.assign(formInline, {
            address,
            name,
            adminor,
            adminor_phone: Number(adminor_phone) || 0,
            lng,
            lat,
            city,
            area,
        });
        this.cityChange();
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