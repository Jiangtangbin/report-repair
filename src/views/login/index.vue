<template>
    <div class="login-wrapper d-v-c">
        <div class="login">
            <component :is="currentComponent" :class="{'login-container-fill': isMobile}" @forgot="currentComponent = 'forgot'" @on-back="currentComponent = 'signIn'" class="login-container" />
            <template v-if="!isMobile">
                <div class="login-download-rail d-v-c">
                    <img src="~@/assets/images/login/download-rail.png" />
                </div>
                <div class="login-qr-code d-v-c">
                    <tabs>
                        <tab-pane v-for="item of packageArr" :key="item.value" :label="item.value">
                            <q-r :dot-scale="1" :logo-src="logo" :margin="5" :size="120" :text="$te(item.url) ? $t(item.url) : item.url" logo-background-color="white" />
                        </tab-pane>
                    </tabs>
                </div>
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Tabs, TabPane } from 'view-design';
import QR from 'vue-qr';
import login from './components/login.vue';
import forgot from './components/forgot.vue';
import { appModule } from '@/store/index';
// import { getPackage } from '@/config/api';

const logo = require('@/assets/images/logo.png'); // 防止 ts 报错
const { location: { origin }} = window;

@Component({
    components: {
        signIn: login,
        forgot: forgot,
        Tabs,
        TabPane,
        QR,
    },
})
export default class Login extends Vue {
    private currentComponent = 'signIn';
    private logo = logo;
    private packageArr = [{ title: 'h.other.android', value: 'Android', url: `${origin}/mini.html#/download` }, { title: 'IOS', value: 'IOS', url: 'h.tips.getIOSInstallPackageError' }];

    get isMobile(): boolean {
        return appModule.device === 0;
    }

    async created() {
        console.log('获取安装包接口，后台逻辑错误');
        // const { type, data } = await getPackage(4);
        // if (!type) {
        //     this.packageArr[1].url = (data.ios && data.ios.url) || 'h.tips.getIOSInstallPackageError';
        // }
    }
}
</script>
<style scoped lang="scss">
    $bg: '~@/assets/images/page-bg.png';
    $box-bg: '~@/assets/images/login/frame.png';
    $download-rail: '~@/assets/images/login/download-rail.png';
    $box-width: 533px;
    $box-height: 600px;

    @include utils-pierce(ivu-tabs) {
        color: $--white;
        .ivu-tabs-tabpane {
            text-align: center;
        }
    }
    // 小屏
    @media screen and (max-width: 600px) {
        .login {
            width: 95vw; height: calc(95vw / 0.888);
            padding: 13vw;
        }
    }

    .login-wrapper {
        width: 100%; height: 100%;
        background: {
            image: url($bg);
            size: 100% 100%;
        }
        flex-flow: column;
    }
    .login {
        width: $box-width; height: $box-height;
        padding: 80px calc(#{$box-width} * 0.15) 50px;
        background: {
            image: url($box-bg);
            size: 100% 100%;
        }
        &-container {
            height: 54%;
            &-fill {
                height: 100%;
            }
        }
        &-download-rail {
            height: 6%;
        }
        &-qr-code {
            height: 40%;
        }
    }
</style>
