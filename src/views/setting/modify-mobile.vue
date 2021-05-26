<template>
    <div class="modify-wrapper">
        <Steps :current="current">
            <Step :title="$t('h.tips.getCode')"></Step>
            <Step :title="$t('h.tips.getSmsCode') + $t('h.formLabel.newMobile')"></Step>
            <Step :title="$t('h.formLabel.complete')"></Step>
        </Steps>
        <i-form :model="formInline" :rules="rules" class="form" ref="form">
            <form-item v-show="current === 0" :label="`${$t('h.formLabel.graphicCode')}: `" prop="code">
                <div class="col">
                    <i-input v-model="formInline.code" :readonly="!extra.code" :placeholder="$t('h.placeholder.pleaseEnter', { msg: $t('h.formLabel.graphicCode') })" />
                    <img :src="extra.code" class="code" />
                </div>
            </form-item>
            <form-item v-show="current !== 0" :label="`${$t('h.formLabel.smsCode')}: `" :rules="current !== 0 ? undefined : {}" prop="verify">
                <div class="col">
                    <i-input v-model="formInline.verify" :readonly="!(extra.code && formInline.code)" :placeholder="formInline.code ? $t('h.placeholder.pleaseEnter', { msg: $t('h.formLabel.smsCode') }) : $t('h.placeholder.pleaseEnter', { msg: $t('h.formLabel.smsCode') })" />
                    <my-button @click="sendSms" :disabled="!(formInline.code && extra.code) || extra.getSmsing" class="k-w" type="primary">{{extra.getSmsing ? `${60 - extra.timeNum}${$t('h.formLabel.reply')}` : $t('h.formLabel.send')}}</my-button>
                </div>
            </form-item>
            <form-item v-show="current !== 0" :label="`${$t('h.formLabel.newMobile')}: `" :rules="current !== 0 ? undefined : {}" prop="new">
                <i-input v-model="formInline.new" :readonly="!(extra.code && formInline.verify)" :placeholder="$t('h.placeholder.pleaseEnter', { msg: $t('h.formLabel.newMobile') })" />
            </form-item>
            <form-item v-show="current === 2" :label="`${$t('h.tips.againLogin')}`"></form-item>
        </i-form>
        <my-button @click="next" class="next">{{ current !== 0 ? $t('h.formLabel.modify') : $t('h.formLabel.next')}}</my-button>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Steps, Step, Form as IForm, FormItem, Input as IInput } from 'view-design';
import { mobileReg } from '@/utils/utils';
import { signModule } from '@/store/modules/sign';
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
    $refs!: {
        form: IForm;
    }

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
        this.getCode();
    }

    async next() {
        const { $refs: { form: { validate }}, formInline} = this;
        const flag = await validate();
        if (flag) {
            if (this.current === 0) {
                this.sendSms();
            } else if (this.current === 1) {
                const params = { ...formInline };
                const { type } = await set(params);
                if (!type) {
                    this.current += 1;
                    setTimeout(() => {
                        this.logouts();
                    }, 3000);
                };
            }
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
    /**
     * @description: 发送短信验证码
     */
    async sendSms() {
        const { formInline: { code }, startCountdown } = this as any;
        const { type } = await send({ code });
        if (!type) {
            this.current += 1;
            startCountdown();
        }
    }
    /**
     * @description: 开始倒计时
     */
    startCountdown() {
        const { extra } = this as any;
        extra.getSmsing = true;
        clearInterval(extra.timer);
        extra.timer = setInterval(() => {
            if (extra.timeNum >= 60) {
                clearInterval(extra.timer);
                extra.timeNum = -1;
                extra.getSmsing = false;
            }
            extra.timeNum++;
        }, 1000);
    }
    // 退出登录
    async logouts() {
        const { type } = await signModule.logout();
        if (!type) {
            this.$router.push('/');
        }
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
            padding: 100px 100px 10px 100px;
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
