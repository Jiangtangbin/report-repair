<template>
    <div class="modify-wrapper">
        <Steps :current="current">
            <Step title="获取图形验证码"></Step>
            <Step title="发送短信验证码"></Step>
            <Step title="新手机号码"></Step>
            <Step title="完成"></Step>
        </Steps>
        <i-form :model="formInline" :rules="rules" class="form" ref="form">
            <form-item v-if="current === 0" :label="`${$t('h.formLabel.graphicCode')}: `" prop="code">
                <div class="col">
                    <i-input v-model="formInline.code" :readonly="!extra.code" :placeholder="$t('h.placeholder.pleaseEnter', { msg: $t('h.formLabel.graphicCode') })" />
                    <img :src="extra.code" class="code" />
                    <my-button @click="getCode" class="k-w">{{extra.code ? $t('h.formLabel.update') : $t('h.formLabel.get')}}{{$t('h.formLabel.graphicCode')}}</my-button>
                </div>
            </form-item>
        </i-form>
        <my-button @click="next" class="next">下一步</my-button>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Steps, Step, Form as IForm, FormItem, Input as IInput } from 'view-design';
import { mobileReg } from '@/utils/utils';
import { getPrivateGraphicCode as get, privateSendSMSCode as send, updatePasswordMobile as set } from '@/config/api';

@Component({
    components: {
        Steps,
        Step,
        IForm,
        FormItem,
        IInput,
    },
})
export default class Personal extends Vue {
    current = 0;
    formInline = {
        code: '',
        verify: '',
        t: '2',
        new: '',
    };
    extra = {
        code: undefined, // 图形验证码.
        timer: '',
        getSmsing: false,
        timeNum: 0,
    }
    
    get rules() {
        return {
            code: {
                required: true,
                message: this.$t('h.placeholder.pleaseEnter', { msg: this.$t('h.formLabel.graphicCode') }),
            },
            verify: {
                required: true,
                message: this.$t('h.placeholder.pleaseEnter', { msg: this.$t('h.formLabel.smsCode') }),
            },
            new: {
                required: true,
                validator: (rule: RegExp, value: string, callback: Function) => callback(mobileReg(value)),
            },
        };
    }

    created() {

    }

    next () {
        if (this.current == 3) {
            this.current = 0;
        } else {
            this.current += 1;
        }
    }
    /**
     * @description: 获取图形验证码
     */
    async getCode() {
        const { extra } = this as any;
        const { type, data } = await get();
        if (!type) extra.code = data;
    }
}
</script>


<style lang="scss" scoped>
    .modify-wrapper {
        padding: 150px;
        @include utils-pierce(ivu-steps) {
            &-item {
                .ivu-steps-tail {
                    left: 13px;
                }
                .ivu-steps-head {
                    background: none;
                }
                .ivu-steps-title {
                    color: $--white;
                    background: none;
                    padding-top: 2px;
                }
            }
        }
        .form {
            padding: 100px;
            @include utils-pierce(ivu-form-item) {
                &-label {
                    color: $--white;
                }
            }
            .code {
                height: 32px;
                padding: 0 5px;
            }
        }
        .next {
            margin-left: 100px;
        }
    }
</style>
