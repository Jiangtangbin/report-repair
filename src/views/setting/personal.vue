<template>
    <div class="personal-wrapper">
        <loading :loading="loading" type="B" />
        <i-form :model="formInline" :rules="rules" class="form" ref="form">
            <form-item prop="username" :label="i18n.label.username">
                <i-input v-model="formInline.username" :placeholder="i18n.placeholder.username" />
            </form-item>
            <form-item prop="email" :label="i18n.label.email">
                <i-input v-model="formInline.email" :placeholder="i18n.placeholder.email" />
            </form-item>
            <form-item prop="sex" :label="i18n.label.sex">
                <i-select v-model="formInline.sex" :placeholder="i18n.placeholder.sex" clearable>
                    <i-option v-for="item of dicts.sex" :key="item.code" :value="item.code">{{item.name}}</i-option>
                </i-select>
            </form-item>
            <form-item :label="i18n.label.wx">
                <my-button v-if="formInline.wx" @click="openWeiXin('info')" class="btn" type="primary">{{$t('h.header.checkWXInfo')}}</my-button>
                <my-button @click="openWeiXin('bind')" class="btn" type="primary">{{formInline.wx ? $t('h.header.replaceAccount') : $t('h.header.bindWX')}}</my-button>
            </form-item>
            <form-item prop="is_notice" :label="i18n.label.is_notice">
                <i-switch v-model="formInline.is_notice" :true-value="1" :false-value="0">
                    <template v-slot:open>{{$t('h.status.yes')}}</template>
                    <template v-slot:close>{{$t('h.status.no')}}</template>
                </i-switch>
            </form-item>
            <form-item>
                <i-button @click="getDetails" class="btn">{{$t('h.formLabel.reset')}}</i-button>
                <i-button @click="setUser" class="btn" type="primary">{{$t('h.common.submit')}}</i-button>
            </form-item>
        </i-form>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Form as IForm, FormItem, Button as IButton, Input as IInput, Select as ISelect, Option as IOption, Switch as ISwitch } from 'view-design';
import MyUpload from '@/components/upload/index.vue';
import { userModule } from '@/store/index';
import { DictModule } from '@/store/modules/dict';
import { personalSetting as set, getUserInfo as get } from '@/config/api';
import { userNameReg } from '@/utils/utils';



@Component({
    components: {
        MyUpload,
        IForm,
        FormItem,
        IButton,
        IInput,
        ISelect,
        IOption,
        ISwitch,
    },
})
export default class Personal extends Vue {
    $refs!: {
        form: IForm;
    }

    loading = false;
    formInline = {
        username: '',
        email: '',
        sex: '',
        is_notice: 1,
        wx: '',
    };
    dicts = { 
        sex: [],
    } as Record<'sex', Dictionary<any>[]>;

    get i18n() {
        const label = {
            username: `${this.$t('h.formLabel.userName')}: `,
            email: `${this.$t('h.formLabel.email')}: `,
            sex: `${this.$t('h.formLabel.sex')}: `,
            is_notice: `${this.$t('h.formLabel.isNotice')}: `,
            wx: `${this.$t('h.formLabel.wechat')}: `,
        };
        const placeholder = {
            username: this.$t('h.placeholder.pleaseEnter', { msg: label.username }),
            email: this.$t('h.placeholder.pleaseEnter', { msg: label.email }),
            sex: this.$t('h.placeholder.pleaseSelect', { msg: label.sex }),
            is_notice: this.$t('h.placeholder.pleaseSelect', { msg: label.is_notice }),
        };

        return { label, placeholder };
    }
    get rules() {
        return {
            username: { required: true, trigger: 'blur', validator: (rule: RegExp, value: string, callback: Function) => callback(userNameReg(value, true)) },
        };
    }

    created() {
        const { 
            dicts: {
                sex: { length: sex },
            }, 
        } = this;
        sex || this.getDicts('sex', 'dict', 1);
        this.getDetails();
    }
    
    /**
     * @description: 微信信息相关操作
     * @param {String} type: 操作的类型
     */
    openWeiXin(type: 'bind' | 'info') {
        if (type === 'bind') {
            this.$getDynamicComponent('wxBind', () => {
                this.$createWxBindHandle({
                    $events: {
                        success: () => {
                            this.getDetails();
                        },
                    },
                }).show();
            });
        }
        else {
            this.$getDynamicComponent('wxInfo', () => {
                this.$createWxInfoHandle({ id: userModule.user.info.id }).show();
            });
        }
    }
    /**
     * 获取字典数据
     * @param {String} key: 成功赋值的键
     * @param {String} type: 字典请求的类型
     * @param {any} params?: 字典请求的参数
     */
    async getDicts<T extends keyof Personal['dicts']>(key: T, type: GlobalCustomDicts.CustomDictsKey, params?: GlobalCustomDicts.CustomDictsValue) {
        const { dicts } = this;
        let data = await DictModule.getCustomDicts({ type, params });
        if (data && typeof data !== 'string') {
            (dicts[key] as any[]) = data;
        }
    }
    // 获取详情
    async getDetails() {
        this.loading = true;
        const { type, data } = await get(userModule.user.info.id);
        if (!type) this.reset(data);
        this.loading = false;
    }
    // 重置用户信息
    reset({ username, email, sex, is_notice, ...args }: API.Response['UserInfo']) {
        const {
            formInline,
        } = this;
        this.$refs.form.resetFields();
        Object.assign(formInline, {
            username,
            email,
            sex,
            is_notice,
        });
        console.log(formInline);
    }
    // 修改用户信息
    async setUser() {
        const { $refs: { form: { validate }}, formInline} = this;
        const flag = await validate();
        if (!flag) return;
        this.loading = true;
        const params = { ...formInline };
        const { type } = await set(params);
        if (!type) {
            this.$Message.success(this.$t('h.tips.modifiedSuccess'));
        }
        this.loading = false;
    }
}
</script>


<style lang="scss" scoped>
    .personal-wrapper {
        height: 100%;
        background-color: $--background-color;
        border-radius: 5px;
        overflow: auto;
        position: relative;
        .form {
            max-width: 800px;
            height: 100%;
            padding: {
                top: 40px;
                left: 10px;
                bottom: 10px;
            }
            @include utils-pierce(ivu-form-item) {
                .ivu-select-selection {
                    background: none;
                    color: $--white;
                    border: $--border-form-popup-color;
                }
                &-label {
                    color: #fff;
                }
            }
            .btn {
                margin-right: 10px;
            }
        }
    }
</style>
