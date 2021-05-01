<template>
    <div id="app">
        <router-view />
    </div>
</template>

<script lang="ts">
import { Watch, Component, Vue } from 'vue-property-decorator';
import { deviceType } from '@/store/modules/app';
import { appModule } from '@/store/index';
import { throttle } from 'lodash';
import socket from '@/socket/index';
import { loadLanguageAsync } from '@/locale/index';

const WIDTH = 992; // refer to Bootstrap's responsive design

@Component({
    components: {
    },
})
export default class App extends Vue {
    status = {
        socket: false,
    };

    get isLogin() {
        return appModule.isLogin;
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
    }
    beforeDestroy() {
        window.removeEventListener('resize', this.resizer);
    }

    @Watch('isLogin', { immediate: true })
    logChange(val: boolean) {
        setTimeout(() => {
            const { $route: { query: { s }}} = this;
            // // 初始如果为 false，则不登录
            s === '0' || this.setStatus('socket', val, false);
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