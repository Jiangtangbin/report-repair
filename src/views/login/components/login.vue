<template>
    <i-form :model="formInline" :rules="rules" class="login-form" ref="form">
        <form-item prop="mobile">
            <div class="login-form-item">
                <svg-icon class="login-form-item-icon" icon-class="user" />
                <auto-complete
                    v-model="formInline.mobile"
                    @keyup.tab.exact.native="focusPassword"
                    @keyup.enter.native="toSample"
                    @on-select="setPassword"
                    @on-search="setPassword"
                    :data="userList"
                    class="login-form-item-input"
                    :placeholder="i18n.placeholder.account"
                    ref="autoComplete"
                />
            </div>
        </form-item>
        <form-item prop="password">
            <div class="login-form-item">
                <svg-icon class="login-form-item-icon" icon-class="lock" />
                <i-input
                    v-model="formInline.password"
                    @click.native="$refs.password && $refs.password.focus()"
                    @on-enter="toSample"
                    class="login-form-item-input" type="password" :placeholder="i18n.placeholder.password" ref="password"
                    password
                />
            </div>
        </form-item>
        <form-item>
            <div class="login-form-control">
                <checkbox v-model="formInline.remember">{{$t('h.login.rememberPassword')}}</checkbox>
                <span class="c-p">{{$t('h.login.forgetPassword')}}?</span>
            </div>
        </form-item>
        <form-item>
            <my-button @click="toSample" :loading="loading" class="login-form-submit" type="primary">{{$t('h.login.signIn')}}</my-button>
        </form-item>
    </i-form>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import { Form as IForm, FormItem, AutoComplete, Input as IInput, Checkbox } from 'view-design';
import Ripple from '@/components/ripple/index.vue';
import { signModule } from '@/store/modules/sign';
import { IUserInfo, getUser, setUser } from '@/utils/encrypt';
import { passwordReg, userNameReg } from '@/utils/utils';
import { i18n } from '@/locale/index';


@Component({
    components: {
        IForm,
        FormItem,
        AutoComplete,
        Checkbox,
        IInput,
        Ripple,
    },
})
export default class LoginBox extends Vue {
    $refs!: {
        autoComplete: AutoComplete;
        form: IForm;
    }

    @Prop() account?: string;

    private formInline: IUserInfo = {
        mobile: '',
        password: '',
        remember: true,
    }
    private users: IUserInfo[] = []
    private loading = false;

    get i18n() {
        const placeholder = {
            account: this.$t('h.placeholder.pleaseEnter', { msg: this.$t('h.login.account') }),
            password: this.$t('h.placeholder.pleaseEnter', { msg: this.$t('h.login.password') }),
        };

        return { placeholder };
    }
    get rules() {
        const { placeholder } = this.i18n;

        return {
            mobile: { require: true, message: placeholder.account, validator: (rule: RegExp, value: string, callback: Function) => callback(userNameReg(value, true)) },
            password: { require: true, message: placeholder.password, validator: (rule: RegExp, value: string, callback: Function) => callback(passwordReg(value, true)) },
        };
    }
    get userList(): string[] {
        return this.users.map(v => v.mobile);
    }

    created() {
        this.users = getUser();
    }
    mounted() {
        // 初始聚焦输入框
        this.$nextTick((this.$refs.autoComplete as any).$refs.input.focus);
    }

    @Watch('account', { immediate: true })
    setUsername(str?: string) {
        if (str) {
            this.formInline.mobile = str;
        }
    }

    /**
     * @description: 重置表单
     */
    resetForm() {
        this.$refs.form.resetFields();
    }
    /**
     * @description: 用户名输入框监听 tab 键, 使密码框聚焦
     */
    focusPassword() {
        const e = new KeyboardEvent('keydown', { key: 'Escape' });
        const { autoComplete, password } = (this.$refs as any);
        autoComplete.$children[0].$refs.reference.dispatchEvent(e);
        password.focus();
    }
    /**
     * @description: 设置用户名对应的密码
     * @param {String} mobile: 用户名
     */
    setPassword(mobile: string) {
        const { users, formInline } = this;
        const user = users.find(v => v.mobile === mobile);
        if (user) {
            user.remember
                ? Object.assign(formInline, user)
                : (formInline.remember = false);
        }
    }
    /**
     * @description: 记住密码
     * @param {Boolean} status
     */
    rememberPassword(status: boolean) {
        this.formInline.remember = status;
    }
    /**
     * @description: 校验表单
     */
    async toSample() {
        const flag = await (this.$refs.form as any).validate();
        if (!flag || this.loading) return;
        this.$Message.info(this.$t('h.tips.loggingIn'));
        this.onOk();
    }
    /**
     * @description: 提交表单
     * @param {Number} force: 是否强制登录，1 强制登录
     */
    async onOk(force?: number) {
        const { formInline, formInline: { password, mobile }, $Message, $Modal } = this;
        this.loading = true;
        signModule.login({ mobile, password, type: 1, force })
            .then(({ type, msg, code, data }) => {
                type || setUser(formInline);
                if (code === 2) {
                    $Modal.confirm({
                        title: this.$t('h.tips.loggedIn') as string,
                        content: this.$t('h.tips.forceLogin') as string,
                        onOk: () => {
                            this.onOk(1);
                        },
                    });
                } else {
                    if (!type) {
                        $Message.success(this.$t('h.tips.loginSuccess'));
                        this.$router.push(data.info.goto || '/home');
                    } else {
                        $Message.error(msg || 'error');
                    }
                }
                this.loading = false;
            });
    }
}

</script>

<style scoped lang="scss">
    $input-bg: '~@/assets/images/login/input-bg.png';

    @include utils-pierce(ivu-input) {
        padding-left: 32px;
    }

    .login-container {
        display: flex;
        flex-flow: column;
        justify-content: center;
        .login-form {
            width: 100%; height: 100%;
            position: relative;
            display: flex;
            flex-flow: column;
            justify-content: center;
            align-items: stretch;
            &-item {
                position: relative;
                z-index: 0;
                &-icon {
                    font-size: 16px;
                    position: absolute;
                    z-index: 1;
                    top: 50%; left: 10px;
                    transform: translateY(-50%);
                    // color: $--white;
                }
                // &-input {
                //     @include utils-pierce(ivu-icon) {
                //         color: $--white;
                //     }
                // }
            }
            &-control {
                color: $--white;
                display: flex;
                justify-content: space-between;
            }
            &-submit {
                width: 100%;
                height: 40px;
                border: none;
                outline: none; letter-spacing: 4px;
                font-size: 16px; font-weight: bold;
                &::after {
                    content: none;
                }
            }
        }
    }
</style>