<template>
    <div id="app">
        <layout v-if="!isHomeOrLogin" />
        <router-view v-else />
    </div>
</template>

<script lang="ts">
import { Watch, Component, Vue } from 'vue-property-decorator';
import { deviceType } from '@/store/modules/app';
import { appModule, socketModule } from '@/store/index';
import { throttle } from 'lodash';
import socket from '@/socket/index';
import Layout from '@/views/layout/index'
import { loadLanguageAsync } from '@/locale/index';

const WIDTH = 992; // refer to Bootstrap's responsive design

@Component({
    components: {
        Layout
    },
})
export default class App extends Vue {
    status = {
        socket: false,
    };

    get isLogin() {
        return appModule.isLogin;
    }
    get isHomeOrLogin() {
        return this.$route.name === 'home' || this.$route.name === 'login';
    }

    beforeCreate() {
        const { languages: languageMenu, languageAlias } = appModule;
        let lang = appModule.lang as Language;
        if (!lang) {
            const { language } = window.navigator;
            const _language = languageAlias[language as keyof typeof languageAlias] || language;
            lang = languageMenu.findIndex(v => v.value === _language) !== -1 ? (_language as Language) : 'zh-CN';
        }
        loadLanguageAsync(lang)
            .then(() => {
                appModule.alterState({ key: 'lang', value: lang });
            });
    }
    mounted() {
        window.addEventListener('resize', this.resizer);
        // 模拟新工单通知
        // socketModule.newMessage({
        //     t: 'new_work',
        //     p: {
        //         id: 9,
        //         step: 'evaluate',
        //         work_code: 'W16221694891106',
        //         org_name: '肖测试',
        //         link_man: '肖测试客户',
        //         link_mobile: '15874275356',
        //         work_type_name: '维修',
        //         service_type_name: '硬件维修',
        //         work_level_name: '一级'
        //     },
        // });
        // 模拟接单通知
        // socketModule.newMessage({
        //     t: 'accept_work',
        //     p: {
        //         id: 9,
        //         step: 'recieve',
        //         work_code: 'W16221694891106',
        //         accepter_name: '肖测试',
        //         accepter_mobile: '15874275356',
        //     },
        // });
        // 模拟完工通知
        // socketModule.newMessage({
        //     t: 'finish_work',
        //     p: {
        //         id: 9,
        //         step: 'reply',
        //         work_code: 'W16221694891106',
        //         accepter_name: '肖测试',
        //         accepter_mobile: '15874275356',
        //     },
        // });
        // 模拟pj_work,
        // socketModule.newMessage({
        //     t: 'pj_work',
        //     p: {
        //         id: 9,
        //         step: 'evaluate',
        //         work_code: 'W16221694891106',
        //         score: '6',
        //         pj: '的萨芬微软非常高'
        //     },
        // });
    }
    beforeDestroy() {
        window.removeEventListener('resize', this.resizer);
    }

    @Watch('isLogin', { immediate: true })
    logChange(val: boolean) {
        setTimeout(() => {
            const { $route: { query: { s }}} = this;
            // // 初始如果为 false，则不登录
            s === '0' || this.setStatus('socket', val, true);
        });
    }
    // 监听 socket
    @Watch('$route.query.s')
    sChange(val: string) {
        const { isLogin } = this;
        if (typeof val === 'undefined' || val === '') return;
        const isEnable = isLogin && Boolean(Number(val));
        this.setStatus('socket', isEnable, true);
    }
    // 是否开启 socket
    @Watch('status.socket')
    socketStatusChange(enable: boolean) {
        enable ? console.log('正常开启 socket') : console.log('正常销毁 socket');
        enable
            ? socket.inits()
            : socket.destroy();
    }

    /**
     * @description: 屏幕宽度发生变化时触发
     * @param {Event} ev: Event
     */
    resizer = throttle(() => {
        const value = document.body.getBoundingClientRect().width;
        const device = this.isMobile();
        appModule.alterState({ key: 'screenWidth', value });
        appModule.alterState({ key: 'device', value: device ? deviceType.Mobile : deviceType.Desktop });

    }, 100, { leading: true, trailing: true })
    /**
     * @description: 判断平台类型
     * @returns {Boolean}
     */
    isMobile(): boolean {
        const { width } = document.body.getBoundingClientRect();
        return width - 1 < WIDTH;
    }
    /**
     * @description: 设置状态(p2p | socket)
     * @param {String} type: 设置的类型
     * @param {Boolean} bool: 设置的状态
     * @param {Boolean} fromQuery: 是否来自路由参数
     */
    setStatus(type: keyof App['status'], bool: boolean, fromQuery: boolean) {
        const _status = !fromQuery && process.env.NODE_ENV === 'development'
            ? process.env.VUE_APP_NO_SOCKET === 'true'
                ? false
                : bool
            : bool;
        this.status[type] = _status;
    }
}
</script>

<style scoped lang="scss">
    #app {
        color: $--gray;
    }
</style>