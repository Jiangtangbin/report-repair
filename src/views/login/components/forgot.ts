import { VNode } from 'vue';
import { mobileReg, passwordReg } from '@/utils/utils';
import { getGraphicCode as get, sendSMSCode as send, updatePassword as set } from '@/config/api';
import { i18n } from '@/locale/index';

/**
 * @description: 忘记密码功能
 */
const forgot = {
    name: 'forgot-password',
    props: {
        mobile: Number,
    },
    computed: {
        /**
         * @description: 验证手机号是否通过
         */
        isMobile(): boolean {
            const { formInline: { mobile }} = this as any;
            return !mobileReg(mobile, true).length;
        },
        /**
         * @description: 验证密码是否通过
         */
        isPassword(): boolean {
            const { formInline: { password }} = this as any;
            return !passwordReg(password, true).length;
        },
    },
    data(): any {
        const { mobile } = this as any;
        return {
            formInline: {
                mobile: mobile || null,
                code: '', // 字符串验证码.
                verify: '',
                password: '',
            },
            extra: {
                code: undefined, // 图形验证码.
                timer: '',
                getSmsing: false,
                timeNum: 0,
            },
        };
    },
    methods: {
        /**
         * @description: 重置状态
         */
        reset() {
            const { formInline, extra } = this as any;
            Object.assign(formInline, { mobile: null, code: '', verify: '', password: '' });
            Object.assign(extra, { code: undefined, timer: '', getSmsing: false, timeNum: 0 });
        },
        /**
         * @description: 获取图形验证码
         */
        async getCode() {
            const { formInline: { mobile }, extra } = this as any;
            const { type, data } = await get(mobile);
            if (!type) extra.code = data;
        },
        /**
         * @description: 发送短信验证码
         */
        async sendSms() {
            const { formInline: { mobile, code }, startCountdown } = this as any;
            const { type } = await send({ mobile, code });
            if (!type) startCountdown();
        },
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
        },
        /**
         * @description: 提交
         */
        async submitInfo() {
            const { formInline, $Message, isMobile, isPassword } = this as any;
            if (isMobile && isPassword) {
                const { type } = await set(formInline);
                if (!type) {
                    $Message.success(i18n.t('h.tips.modifiedSuccess'));
                    (this as any).$emit('success', formInline.mobile);
                    this.reset();
                }
            } else {
                (this as any).$emit('fail');
            }
        },
    },
    render(h: CreateElement): VNode {
        const { isMobile, isPassword, formInline, extra, reset, getCode, sendSms, startCountdown, submitInfo } = this as any;
        return h('div', [
            (this as any).$scopedSlots.default({ isMobile, isPassword, formInline, extra, reset, getCode, sendSms, startCountdown, submitInfo }),
        ]);
    },
};

export default forgot;