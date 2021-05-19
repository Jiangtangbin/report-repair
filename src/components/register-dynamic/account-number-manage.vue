<template>
    <my-modal
        v-model="value"
        @on-visible-change="$event || destroy()"
        :loading-func="ok"
        :title="`${titlePrefix}${$t('h.modal.titles.accountNumber')}`"
        :footer-hide="forbidden"
        width="780px"
        loading
    >
        <loading :loading="loading" type="B" />
        <i-form :model="formInline" :rules="rules" class="form" ref="form">
            <form-item prop="username" :label="i18n.label.username">
                <i-input v-model="formInline.username" :readonly="forbidden" :placeholder="i18n.placeholder.username" />
            </form-item>
            <!-- <form-item prop="password" :label="i18n.label.password">
                <i-input v-model="formInline.password" :readonly="forbidden" :placeholder="i18n.placeholder.password" type="password" />
            </form-item> -->
            <div class="col">
                <form-item prop="mobile" class="col2" :label="i18n.label.mobile">
                    <i-input
                        v-model="formInline.mobile"
                        @on-change="formInline.originMobile = formInline._mobile = '';"
                        :readonly="forbidden"
                        :placeholder="formInline._mobile || i18n.placeholder.mobile"
                    />
                </form-item>
                <form-item prop="email" class="col2" :label="i18n.label.email">
                    <i-input v-model="formInline.email" :readonly="forbidden" :placeholder="i18n.placeholder.email" />
                </form-item>
            </div>
            <div class="col">
                <form-item prop="role" class="col2" :label="i18n.label.role">
                    <i-select v-model="formInline.role" :placeholder="i18n.placeholder.role" clearable>
                        <i-option v-for="item of dicts.role" :key="item.code" :value="item.code">{{item.name}}</i-option>
                    </i-select>
                </form-item>
                <form-item prop="sex" class="col2" :label="i18n.label.sex">
                    <i-select v-model="formInline.sex" :disabled="forbidden" :placeholder="i18n.placeholder.sex" clearable>
                        <i-option v-for="item of dicts.sex" :key="item.code" :value="item.code">{{item.name}}</i-option>
                    </i-select>
                </form-item>
            </div>
            <form-item v-if="formInline.role === 'jg'" :rules="formInline.role === 'jg' ? undefined : {}" prop="admin_area" :label="i18n.label.admin_area">
                <cascader v-model="formInline.admin_area" :data="dicts.admin_area" :disabled="forbidden" :placeholder="i18n.placeholder.admin_area" change-on-select filterable transfer />
            </form-item>
            <form-item v-if="formInline.role === 'kh'" :rules="formInline.role === 'kh' ? undefined : {}" prop="org_id" :label="i18n.label.org_id">
                <div class="col">
                    <div @click.self="forbidden || selectCard('org_id')" :label="i18n.placeholder.org_id" class="receive-wrapper simulate-input pseudo-prefix-empty">
                        <figure v-for="(item, key) of formInline.org_id" :key="key" class="receive-item">
                            <figcaption @click="openWins('org', item.id)" :title="item.name" class="t-o-e simulate-a">{{item.name}}</figcaption>
                            <svg-icon
                                v-show="!forbidden"
                                @click.stop.native="delReceiveItem('org_id', key)"
                                class="receive-item-close"
                                icon-class="close"
                            />
                        </figure>
                    </div>
                    <my-button v-if="type === 1" v-show="!forbidden" @click="selectCard('org_id')" class="k-w" type="primary">{{$t('h.formLabel.choice')}}</my-button>
                </div>
            </form-item>
            <form-item v-if="formInline.role === 'admin'" :rules="formInline.role === 'admin' ? undefined : {}" :label="i18n.label.is_notice" prop="is_notice">
                <i-switch v-model="formInline.is_notice" :true-value="1" :false-value="0">
                    <template v-slot:open>{{$t('h.status.yes')}}</template>
                    <template v-slot:close>{{$t('h.status.no')}}</template>
                </i-switch>
            </form-item>
        </i-form>
    </my-modal>
</template>

<script lang="ts">
import { Prop, Watch, Component } from 'vue-property-decorator';
import { Form as IForm, FormItem, Input as IInput, Select as ISelect, Option as IOption, Switch as ISwitch, Cascader } from 'view-design';
import { Popup } from '@/base-class/dynamic-create';
import { setUserInfo as set, getUserInfo as get } from '@/config/api';
import lodashGet from 'lodash/get';
import { userNameReg, passwordReg, mobileReg, mobileMask } from '@/utils/utils';
import { recursion } from '@/utils/index';
import { DictModule } from '@/store/modules/dict';

const tableListType: Dictionary<string> = {
    org_id: 'customer',
};

@Component({
    name: 'AccountNumberManageHandle',
    components: {
        IForm,
        FormItem,
        IInput,
        ISelect,
        IOption,
        ISwitch,
        Cascader,
    },
})
export default class AccountNumberManageHandle extends Popup<'SetUser'> {
    $refs!: {
        form: IForm;
    }

    loading = false;
    formInline = {
        type: 1,
        id: 0,
        username: '',
        // password: '',
        mobile: '',
        originMobile: '', // 编辑时保存的手机号
        _mobile: '', // 显示遮掩的手机号
        email: '',
        org_id: [],
        role: '',
        is_notice: 1,
        admin_area: [],
        sex: '',
    };
    dicts = { 
        role: [],
        sex: [],
        admin_area: [],
    } as Record<'role' | 'sex' | 'admin_area', Dictionary<any>[]>;

    get i18n() {
        const label = {
            username: `${this.$t('h.formLabel.accountNumber')}: `,
            // password: `${this.$t('h.formLabel.password')}: `,
            mobile: `${this.$t('h.formLabel.mobile')}: `,
            email: `${this.$t('h.formLabel.email')}: `,
            org_id: `${this.$t('h.formLabel.affiliatedCustomer')}: `,
            role: `${this.$t('h.formLabel.affiliatedRole')}: `,
            admin_area: `${this.$t('h.formLabel.adminArea')}: `,
            sex: `${this.$t('h.formLabel.sex')}: `,
            is_notice: `${this.$t('h.formLabel.isNotice')}: `,
        };
        const placeholder = {
            username: this.$t('h.placeholder.pleaseEnter', { msg: label.username }),
            org_id: this.$t('h.placeholder.pleaseSelect', { msg: label.org_id }),
            role: this.$t('h.placeholder.pleaseSelect', { msg: label.role }),
            // password: this.$t('h.placeholder.pleaseEnter', { msg: label.password }),
            mobile: this.$t('h.placeholder.pleaseEnter', { msg: label.mobile }),
            email: this.$t('h.placeholder.pleaseEnter', { msg: label.email }),
            admin_area: this.$t('h.placeholder.pleaseSelect', { msg: label.admin_area }),
            sex: this.$t('h.placeholder.pleaseSelect', { msg: label.sex }),
            is_notice: this.$t('h.placeholder.pleaseSelect', { msg: label.is_notice }),
        };

        return { label, placeholder };
    }
    get rules() {
        const { i18n: { placeholder }, type } = this;
        // const isAdd = type === 1;

        return {
            username: { required: true, validator: (rule: RegExp, value: string, callback: Function) => callback(userNameReg(value, true)), trigger: 'blur' },
            // password: { required: isAdd, validator: (rule: RegExp, value: string, callback: Function) => callback(passwordReg(value, isAdd)), trigger: 'blur' },
            mobile: { required: true, validator: (rule: RegExp, value: string, callback: Function) => callback(mobileReg(value, true)), trigger: 'blur' },
            role: { required: true, message: placeholder.role },
            admin_area: { required: true, message: placeholder.org_id },
            org_id: { required: true, message: placeholder.org_id },
            is_notice: { required: true, message: placeholder.org_id },
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
                role: { length: role },
                sex: { length: sex },
                admin_area: { length: admin_area },
            }, 
        } = this;

        id && (formInline.id = id);
        role || this.getDicts('role', 'role');
        sex || this.getDicts('sex', 'dict', 1);
        admin_area || this.getDicts('admin_area', 'city');
        id && this.getDetails();
    }
    // 关闭前事件
    suffixFunc() {
        this.$refs.form.resetFields();
    }
    /**
     * 获取字典数据
     * @param {String} key: 成功赋值的键
     * @param {String} type: 字典请求的类型
     * @param {any} params?: 字典请求的参数
     */
    async getDicts<T extends keyof AccountNumberManageHandle['dicts']>(key: T, type: GlobalCustomDicts.CustomDictsKey, params?: GlobalCustomDicts.CustomDictsValue) {
        const { dicts } = this;
        let data = await DictModule.getCustomDicts({ type, params });
        if (data && typeof data !== 'string') {
            if (key === 'admin_area') {
                recursion((data as any), v => {
                    v.label = v.name;
                    v.value = v.code;
                });
                (dicts[key] as any[]) = data;
            }
            (dicts[key] as any[]) = data;
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
    setDetails({ username, mobile, email, org_id: orgId, org_name, role, is_notice, sex, admin_area }: API.Response['UserInfo']) {
        const { formInline } = this;
        Object.assign(formInline, {
            username,
            mobile: undefined,
            originMobile: mobile,
            _mobile: mobileMask(mobile),
            email,
            org_id: orgId ? [{ id: orgId, name: org_name }] : [],
            role,
            is_notice,
            sex,
            admin_area: admin_area ? ["hn001", admin_area] : [],
        });
    }
    // 选择弹窗
    selectCard(type: keyof AccountNumberManageHandle['formInline']) {
        const { formInline: { org_id: [org] }, forbidden } = this;
        if (forbidden) return;
        if (type !== 'org_id' && !org) return this.$Message.info(this.$t('h.placeholder.pleaseSelectCustomer'));
        this.$getDynamicComponent('tableList', () => {
            const { formInline } = this;
            this.$createTableListHandle({
                t: tableListType[type],
                checked: formInline[type],
                fromQuery: type === 'org_id' ? {} : { org_id: org && (org as any).id },
                $events: {
                    success: (data: Dictionary<any>[]) => {
                        (formInline[type] as Dictionary<any>[]) = data;
                    },
                },
            }).show();
        });
    }
    // 提交事件
    async ok() {
        const {
            $refs: { form: { validate }},
            id,
            type,
            formInline,
            formInline: { org_id: org, mobile, originMobile, _mobile, admin_area, is_notice, role, ...args },
        } = this;
        const factMobile = originMobile || mobile;
        originMobile && (formInline.mobile = factMobile);
        const flag = await validate();
        formInline.mobile = mobile;
        if (flag) {
            this.loading = true;
            const params = Object.assign(args, {
                id: type === 1 ? undefined : id,
                org_id: lodashGet(org, '[0].id', ''),
                mobile: factMobile,
                is_notice: role === 'admin' ? is_notice : undefined,
                role,
                admin_area: admin_area[admin_area.length - 1],
            });
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