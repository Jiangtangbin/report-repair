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
            <form-item prop="password" :label="i18n.label.password">
                <i-input v-model="formInline.password" :readonly="forbidden" :placeholder="i18n.placeholder.password" type="password" />
            </form-item>
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
                <form-item prop="belong_org" class="col2" :label="i18n.label.belong_org">
                    <div class="col">
                        <div @click.self="(!isBjg && type === 1) && (forbidden || selectCard('belong_org'))" :label="i18n.placeholder.belong_org" class="receive-wrapper simulate-input pseudo-prefix-empty">
                            <figure v-for="(item, key) of formInline.belong_org" :key="key" class="receive-item">
                                <figcaption @click="openWins('org', item.id)" :title="item.name" class="t-o-e simulate-a">{{item.name}}</figcaption>
                                <svg-icon
                                    v-show="!isBjg && type === 1 && !forbidden"
                                    @click.stop.native="delReceiveItem('belong_org', key)"
                                    class="receive-item-close"
                                    icon-class="close"
                                />
                            </figure>
                        </div>
                        <my-button v-if="!isBjg && type === 1" v-show="!forbidden" @click="selectCard('belong_org')" class="k-w" type="primary">{{$t('h.formLabel.choice')}}</my-button>
                    </div>
                </form-item>
                <form-item prop="role" class="col2" :label="i18n.label.role">
                    <div class="col">
                        <div @click.self="forbidden || selectCard('role')" :label="i18n.placeholder.role" class="receive-wrapper simulate-input pseudo-prefix-empty">
                            <figure v-for="(item, key) of formInline.role" :key="key" class="receive-item">
                                <figcaption :title="item.name" class="t-o-e">{{item.name}}</figcaption>
                                <svg-icon
                                    v-show="!forbidden"
                                    @click.stop.native="delReceiveItem('role', key)"
                                    class="receive-item-close"
                                    icon-class="close"
                                />
                            </figure>
                        </div>
                        <my-button v-show="!forbidden" @click="selectCard('role')" class="k-w" type="primary">{{$t('h.formLabel.choice')}}</my-button>
                    </div>
                </form-item>
            </div>
            <div class="col">
                <form-item prop="qqnum" class="col2" :label="i18n.label.qqnum">
                    <i-input v-model="formInline.qqnum" :readonly="forbidden" :placeholder="i18n.placeholder.qqnum" />
                </form-item>
                <form-item prop="address" class="col2" :label="i18n.label.address">
                    <i-input v-model="formInline.address" :readonly="forbidden" :placeholder="i18n.placeholder.address" />
                </form-item>
            </div>
            <form-item v-if="!forbidden">
                <my-button @click="getUrl">{{$t('h.formLabel.photoUpload')}}</my-button>
            </form-item>
            <form-item prop="avatar" :label="i18n.label.avatar">
                <template v-if="forbidden && !formInline.avatar.length">{{$t('h.common.noPicture')}}</template>
                <my-upload
                    v-show="!(forbidden || formInline.avatar.length)"
                    @ready="formInline.avatar = $event"
                    ref="upload"
                />
                <template v-if="formInline.avatar.length">
                    <p class="upload-item">
                        <template v-if="formInline.avatar[0].status === 'finished'">
                            <img :src="formInline.avatar[0].url" @error="globalImgFail" @click="$previewRefresh" preview="accountNumberImg" class="c-p" alt="" />
                            <p @click.stop class="upload-item-mask">
                                <svg-icon icon-class="eye-center" />
                                <svg-icon v-show="!forbidden" @click.native="$refs.upload.remove(0)" class="upload-item-mask-trash" icon-class="trash-o" />
                            </p>
                        </template>
                        <template v-else>
                            <i-progress v-if="formInline.avatar[0].showProgress" :percent="formInline.avatar[0].percentage" hide-info></i-progress>
                        </template>
                    </p>
                </template>
            </form-item>
        </i-form>
    </my-modal>
</template>

<script lang="ts">
import { Prop, Watch, Component } from 'vue-property-decorator';
import { Form as IForm, FormItem, Input as IInput, Select as ISelect, Option as IOption, Progress as IProgress } from 'view-design';
import MyUpload from '@/components/upload/index.vue';
import { Popup } from '@/base-class/dynamic-create';
import { setUserInfo as set, editUserInfo as update, getUserInfo as get } from '@/config/api';
import lodashGet from 'lodash/get';
import { userNameReg, passwordReg, mobileReg, mobileMask } from '@/utils/utils';
import { userModule } from '@/store/index';

const tableListType: Dictionary<string> = {
    belong_org: 'customer',
    role: 'role',
};

@Component({
    name: 'AccountNumberManageHandle',
    components: {
        IForm,
        FormItem,
        IInput,
        ISelect,
        IOption,
        MyUpload,
        IProgress,
    },
})
export default class AccountNumberManageHandle extends Popup<'SetUser'> {
    $refs!: {
        form: IForm;
    }

    @Prop({ type: Object })
    orgs!: object;

    loading = false;
    formInline = {
        username: '',
        password: '',
        mobile: '',
        originMobile: '', // 编辑时保存的手机号
        _mobile: '', // 显示遮掩的手机号
        email: '',
        wxnum: '',
        qqnum: '',
        address: '',
        belong_org: [],
        role: [],
        avatar: [],
    };

    get i18n() {
        const label = {
            username: `${this.$t('h.formLabel.accountNumber')}: `,
            password: `${this.$t('h.formLabel.password')}: `,
            mobile: `${this.$t('h.formLabel.mobile')}: `,
            email: `${this.$t('h.formLabel.email')}: `,
            qqnum: `${this.$t('h.formLabel.qqNumber')}: `,
            belong_org: `${this.$t('h.formLabel.affiliatedCustomer')}: `,
            role: `${this.$t('h.formLabel.name')}: `,
            address: `${this.$t('h.formLabel.address')}: `,
            avatar: `${this.$t('h.formLabel.avatar')}: `,
        };
        const placeholder = {
            username: this.$t('h.placeholder.pleaseEnter', { msg: label.username }),
            belong_org: this.$t('h.placeholder.pleaseSelect', { msg: label.belong_org }),
            role: this.$t('h.placeholder.pleaseSelect', { msg: label.role }),
            password: this.$t('h.placeholder.pleaseEnter', { msg: label.password }),
            mobile: this.$t('h.placeholder.pleaseEnter', { msg: label.mobile }),
            email: this.$t('h.placeholder.pleaseEnter', { msg: label.email }),
            qqnum: this.$t('h.placeholder.pleaseEnter', { msg: label.qqnum }),
            address: this.$t('h.placeholder.pleaseEnter', { msg: label.address }),
        };

        return { label, placeholder };
    }
    get rules() {
        const { i18n: { placeholder }, type } = this;
        const isAdd = type === 1;

        return {
            username: { required: true, validator: (rule: RegExp, value: string, callback: Function) => callback(userNameReg(value, true)), trigger: 'blur' },
            password: { required: isAdd, validator: (rule: RegExp, value: string, callback: Function) => callback(passwordReg(value, isAdd)), trigger: 'blur' },
            mobile: { required: true, validator: (rule: RegExp, value: string, callback: Function) => callback(mobileReg(value, true)), trigger: 'blur' },
        };
    }
    // 是否是被监管客户，被监管客户无法选择所属客户
    get isBjg() {
        const orgattr = userModule.user.info.orgattr;
        return !orgattr || orgattr === 'bjg';
    }

    // 所属机构发生改变
    @Watch('orgs', { immediate: true })
    changeOrgs(val?: object) {
        (this.formInline as any).belong_org = val ? [val] : [];
    }

    // 打开前事件
    prefixFunc() {
        const { id } = this;

        id && this.getDetails();
    }
    // 关闭前事件
    suffixFunc() {
        const { formInline, formInline: { avatar }} = this;
        this.$refs.form.resetFields();
        avatar.splice(0);
        formInline.avatar = avatar;
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
    setDetails({ username, mobile, email, wxnum, qqnum, address, belong_org: orgId, orgname, role, rolename, avatar }: API.Response['UserInfo']) {
        const { formInline } = this;
        Object.assign(formInline, {
            username,
            mobile: undefined,
            originMobile: mobile,
            _mobile: mobileMask(mobile),
            email,
            wxnum,
            qqnum,
            address,
            belong_org: orgId ? [{ id: orgId, name: orgname }] : [],
            role: role ? [{ code: role, name: rolename }] : [],
        });
        avatar && (formInline.avatar as any[]).push({
            response: { key: avatar },
            status: 'finished',
            url: avatar,
        });
    }
    // 选择弹窗
    selectCard(type: keyof AccountNumberManageHandle['formInline']) {
        const { formInline: { belong_org: [org] }, forbidden } = this;
        if (forbidden) return;
        if (type !== 'belong_org' && !org) return this.$Message.info(this.$t('h.placeholder.pleaseSelectCustomer'));
        this.$getDynamicComponent('tableList', () => {
            const { formInline } = this;
            this.$createTableListHandle({
                t: tableListType[type],
                checked: formInline[type],
                fromQuery: type === 'belong_org' ? {} : { org_id: org && (org as any).id },
                $events: {
                    success: (data: Dictionary<any>[]) => {
                        (formInline[type] as Dictionary<any>[]) = data;
                    },
                },
            }).show();
        });
    }
    /**
     * @description: 获取拍照生成的图片
     */
    getUrl() {
        const { formInline: { avatar }} = this;
        this.$getDynamicComponent('camera', () => {
            this.$createCameraHandle({
                autoOpen: true,
                $events: {
                    success: (data: { url: string; key: string; }) => {
                        (avatar as any[]).splice(0, 1, {
                            url: data.url,
                            status: 'finished',
                            response: { key: data.key },
                        });
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
            formInline: { belong_org: org, role, avatar, mobile, originMobile, _mobile, ...args },
        } = this;
        const factMobile = originMobile || mobile;
        originMobile && (formInline.mobile = factMobile);
        const flag = await validate();
        formInline.mobile = mobile;
        if (flag) {
            this.loading = true;
            const params = Object.assign(args, {
                id: type === 1 ? undefined : id,
                role: lodashGet(role, '[0].code', ''),
                belong_org: lodashGet(org, '[0].id', ''),
                avatar: lodashGet(avatar, '[0].response.key', ''),
                mobile: factMobile,
            });
            const request = type === 1 ? set : update;
            const { type: types } = await request(params);
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