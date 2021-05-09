<template>
    <my-forgot v-bind="$attrs" v-slot="{formInline, extra, isMobile, getCode, sendSms, submitInfo}" v-on="$listeners">
        <i-form :model="formInline" :rules="rules" :label-width="85" class="forms" ref="form">
            <form-item :label="`${$t('h.formLabel.mobile')}: `" prop="mobile">
                <div class="col">
                    <i-input v-model="formInline.mobile" :placeholder="$t('h.placeholder.pleaseEnter', { msg: $t('h.formLabel.mobile') })" />
                    <my-button @click="getCode" :disabled="!isMobile" class="k-w" type="primary">{{extra.code ? $t('h.formLabel.update') : $t('h.formLabel.get')}}{{$t('h.formLabel.graphicCode')}}</my-button>
                </div>
            </form-item>
            <form-item :label="`${$t('h.formLabel.graphicCode')}: `" prop="code">
                <div class="col">
                    <i-input v-model="formInline.code" :readonly="!extra.code" :placeholder="$t('h.placeholder.pleaseEnter', { msg: $t('h.formLabel.graphicCode') })" />
                    <img :src="extra.code" class="code" />
                </div>
            </form-item>
            <form-item :label="`${$t('h.formLabel.smsCode')}: `" prop="verify">
                <div class="col">
                    <i-input v-model="formInline.verify" :readonly="!(extra.code && formInline.code)" :placeholder="formInline.code ? $t('h.placeholder.pleaseEnter', { msg: $t('h.formLabel.smsCode') }) : $t('h.placeholder.pleaseFillIn', { msg: $t('h.formLabel.smsCode') })" />
                    <my-button @click="sendSms" :disabled="!(formInline.code && extra.code) || extra.getSmsing" class="k-w" type="primary">{{extra.getSmsing ? `${60 - extra.timeNum}${$t('h.formLabel.reply')}` : $t('h.formLabel.send')}}</my-button>
                </div>
            </form-item>
            <form-item :label="`${$t('h.formLabel.fresh')}: `" prop="password">
                <i-input v-model="formInline.password" :readonly="!(extra.code && formInline.verify)" :placeholder="$t('h.placeholder.pleaseEnter', { msg: $t('h.formLabel.fresh') })" type="password" />
            </form-item>
            <form-item>
                <my-button @click="$emit('on-back')">{{$t('h.common.back')}}</my-button>
                <my-button @click="formValidate(submitInfo)" type="primary">{{$t('h.common.submit')}}</my-button>
            </form-item>
        </i-form>
    </my-forgot>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Form as IForm, FormItem, Input as IInput } from 'view-design';
import MyForgot from './forgot';
import { mobileReg, passwordReg } from '@/utils/utils';

@Component({
    components: {
        MyForgot,
        IForm,
        FormItem,
        IInput,
    },
})
export default class Login extends Vue {
    $refs!: {
        form: IForm;
    }

    get rules() {
        return {
            mobile: {
                required: true,
                validator: (rule: RegExp, value: string, callback: Function) => callback(mobileReg(value)),
            },
            verify: {
                required: true,
                message: this.$t('h.placeholder.pleaseEnter', { msg: this.$t('h.formLabel.smsCode') }),
            },
            password: {
                required: true,
                validator: (rule: RegExp, value: string, callback: Function) => callback(passwordReg(value)),
            },
        };
    }

    /**
     * @description: 提交修改密码
     * @param {Function} callback: 成功后执行的函数
     */
    async formValidate(callback: Function) {
        const { $refs: { form: { validate }}} = this;
        validate(flag => flag && callback());
    }
}
</script>
<style scoped lang="scss">
    .forms {
        @include utils-pierce(ivu-form-item) {
            margin-bottom: 18px;
            &-label {
                color: #fff;
            }
            &-content {
                display: flex;
                justify-content: space-between;
                .ivu-form-item-error-tip {
                    padding-top: 2px;
                }
            }
        }
        .code {
            height: 32px;
        }
    }
</style>
