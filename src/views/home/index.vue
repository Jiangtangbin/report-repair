<template>
    <div class="home-page-wrapper">
        <header class="home-page-header d-v-c">
            <div class="home-page-header-title d-v-c">
                <img src="~@/assets/images/home-page-header-title.png" />
                <span :style="{ 'letter-spacing': lang === 'en-US' ? '10px' : '50px' }">{{$t(title)}}</span>
            </div>
            <personal />
        </header>
        <main class="home-page-main">
            <div class="home-page-main-similar d-v-c">
                <template v-for="(item, index) of menus.default">
                    <figure @click="handle(item, index)" :key="item.path" class="home-page-main-similar-item d-v-c c-p">
                        <img :src="mainMenusCurrentIndex === index ? require('@/assets/images/home-page-main-menu-active.png') : require('@/assets/images/home-page-main-menu.png')" />
                        <figcaption>{{item.title}}</figcaption>
                    </figure>
                </template>
            </div>
        </main>
        <transition name="slide-dl-ue">
            <footer v-if="isShowFooter" class="home-page-footer d-v-c">
                <div class="home-page-footer-menu d-v-c">
                    <p class="home-page-footer-menu-target">{{footerMenusCurrentTarget}}</p>
                    <template
                        v-for="(item, index) of middleMenus"
                    >
                        <figure 
                            v-if="item.url_value.includes('http', 0)"
                            :key="`${index}${item.value}`"
                            @click="popupLink(item)"
                            class="home-page-footer-menu-item c-p d-v-c"
                        >
                            <svg-icon :icon-class="item.icon || 'four-round-rect'" />
                            <figcaption>{{item.title}}</figcaption>
                        </figure>
                        <router-link
                            v-else
                            :key="`${index}${item.value}`"
                            :to="item.module === 'govern' ? `/home/${item.value}` : item.path"
                            tag="figure"
                            class="home-page-footer-menu-item c-p d-v-c"
                        >
                            <svg-icon :icon-class="item.icon || 'four-round-rect'" />
                            <figcaption>{{item.title}}</figcaption>
                        </router-link>
                    </template>
                </div>
            </footer>
        </transition>
    </div>
</template>

<script lang="ts">
import { Watch, Component, Vue } from 'vue-property-decorator';
import { appModule, userModule } from '@/store/index';
import Personal from '@/views/layout/components/nav-bar/avatar.vue';
import { title } from '@/config/environment';

@Component({
    components: {
        Personal,
    },
})
export default class Home extends Vue {
    isShowFooter = false;
    middleMenus = this.menus.default[0].children;
    mainMenusCurrentIndex = null; // 主体菜单当前索引
    footerMenusCurrentTarget = ''; // 脚部菜单当前项
    lang = appModule.lang;

    // 页面标题
    get title() {
        // return userModule.user.config.title;
        return title;
    }
    // 菜单列表
    get menus() {
        const result = { default: [], govern: [] };
        userModule.menus.every(v => {
            if (v.value === 'govern') {
                v.children && result.govern.push(...v.children);
                result.default.push(v);
            } else {
                result.default.push(v);
            }
            return true;
        });
        return result;
    }
    get language() {
        return appModule.lang;
    }

    @Watch('language')
    languageChange(val: string) {
        this.lang = val as Language;
    }

    /**
     * @description: 菜单子项切换
     * @param {Object} item: 点击项信息
     * @param {Number} index: 点击项索引
     */
    handle(item: Object, index: Number) {
        this.isShowFooter = false;
        setTimeout(() => {
            // 一级菜单索引的记录
            appModule.alterState({ key: 'menuIndex', value: index });
            this.isShowFooter = true;
            this.middleMenus = item.children;
            this.mainMenusCurrentIndex = index;
            this.footerMenusCurrentTarget = item.title;
        }, 500);
    }
    /**
     * @description: 菜单子项切换（外部链接）
     * @param {Object} item: 外部链接
     */
    popupLink(item: Object) {
        this.$getDynamicComponent('publicIframe', () => {
            this.$createPublicIframeHandle({
                title: item.title,
                // url: item.url_value,
            }).show();
        });
    }

    created() {
        setTimeout(() => {
            this.handle(this.menus.default[appModule.menuIndex], appModule.menuIndex);
        }, 100);
    }
}
</script>

<style scoped lang="scss">
    $home-bg: '~@/assets/images/home-page.png';
    $home-page-footer-menu: '~@/assets/images/home-page-footer-menu.png';
    $home-page-footer-menu-item: '~@/assets/images/home-page-footer-menu-item.png';
    $home-page-footer-menu-active: '~@/assets/images/home-page-footer-menu-active.png';
    $home-page-header-svg-color: #47d7ff;

    @keyframes move-up-down_1 {
        0% {
            transform: translate(0px, -20px);
        }
        50% {
            transform: translate(0px, 20px);
        }
        100% {
            transform: translate(0px, -20px);
        }
    }
    @keyframes move-up-down_2 {
        0% {
            transform: translate(0px, 20px)
        }
        50% {
            transform: translate(0px, -20px)
        }
        100% {
            transform: translate(0px, 20px)
        }
    }
    @keyframes move-up-down_3 {
        0% {
            transform: translate(0px, -20px) rotateY(180deg);
        }
        50% {
            transform: translate(0px, 20px) rotateY(180deg);
        }
        100% {
            transform: translate(0px, -20px) rotateY(180deg);
        }
    }
    @keyframes move-up-down_4 {
        0% {
            transform: translate(0px, 20px) rotateY(180deg);
        }
        50% {
            transform: translate(0px, -20px) rotateY(180deg);
        }
        100% {
            transform: translate(0px, 20px) rotateY(180deg);
        }
    }
    @keyframes clockwise_rotation {
        0% {
            transform: rotate(0);
        }
        50% {
            transform: rotate(180deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
    @keyframes anticlockwise_rotation {
        0% {
            transform: rotate(360deg);
        }
        50% {
            transform: rotate(180deg);
        }
        100% {
            transform: rotate(0);
        }
    }
    @keyframes flip {
        0% {
            transform: rotateX(0);
        }
        50% {
            transform: rotateX(180deg);
        }
        100% {
            transform: rotateX(360deg);
        }
    }
    
    @include utils-pierce(nav-avatar-wrapper) {
        .realtime-task-email {
            &-img {
                width: 60px;
                animation: clockwise_rotation 3s linear infinite;
            }
            &-svg {
                position: absolute;
                top: 19px;
                right: 19px;
                font-size: 22px;
                color: $home-page-header-svg-color;
            }
        }
        .lang-select {
            &-img {
                width: 60px;
                animation: anticlockwise_rotation 3s linear infinite;
            }
            &-svg {
                position: absolute;
                top: 19px;
                right: 19px;
                font-size: 22px;
                color: $home-page-header-svg-color;
            }
        }
        .nav-avatar-person {
            &-img {
                width: 60px;
                animation: anticlockwise_rotation 3s linear infinite;
            }
            &-svg {
                position: absolute;
                top: 19px;
                right: 19px;
                font-size: 22px;
                color: $home-page-header-svg-color;
            }
        }
    }

    .home-page-wrapper {
        width: 100%;
        height: 100%;
        background: {
            image: url($home-bg);
            size: 100% 100%;
            repeat: no-repeat;
        }
        .home-page-header {
            width: 100%;
            height: 120px;
            position: relative;
            &-title {
                width: 100%;
                height: 100%;
                position: relative;
                img {
                    margin-top: 50px;
                    animation: flip 6s linear infinite;
                }
                span {
                    position: absolute;
                    top: 25px;
                    letter-spacing: 50px;
                    font-size: 46px;
                    color: #00fff5;
                    text-shadow: 3px 3px 10px #00fff5;
                }
            }
            // 个人信息
            @include utils-pierce(nav-avatar-wrapper) {
                position: absolute;
                right: 10px;
                top: 10px;
                .realtime-task-wrapper, .lang-select-wrapper, .nav-avatar {
                    margin: 0 2px;
                }
            }
        }
        .home-page-main {
            height: calc(100% - 320px);
            display: flex;
            &-similar {
                width: 100%;
                figure {
                    margin: 0 80px;
                    width: 220px;
                    height: 350px;
                    color: #dddddd;
                    font-size: 24px;
                    font-weight: bold;
                    position: relative;
                    figcaption {
                        position: absolute;
                        bottom: 90px;
                    }
                }
                &-item {
                    img {
                        height: 320px;
                    }
                    &:nth-child(1) {
                        animation: move-up-down_1 5s $--ease-in-out-function infinite;
                    }
                    &:nth-child(2) {
                        animation: move-up-down_2 5s $--ease-in-out-function infinite;
                    }
                    &:nth-child(3) {
                        transform: rotateY(180deg);
                        animation: move-up-down_3 5s $--ease-in-out-function infinite;
                        figcaption {
                            transform: rotateY(180deg);
                        }
                    }
                    &:nth-child(4) {
                        transform: rotateY(180deg);
                        animation: move-up-down_4 5s $--ease-in-out-function infinite;
                        figcaption {
                            transform: rotateY(180deg);
                        }
                    }
                }
            }
        }
        .home-page-footer {
            width: 100%;
            height: 200px;
            &-menu {
                width: calc(100% - 286px);
                height: 100%;
                position: relative;
                display: flex;
                flex-flow: row wrap;
                padding: 55px 10px 10px 10px;
                background: {
                    image: url($home-page-footer-menu);
                    size: 100% 100%;
                    repeat: no-repeat;
                }
                &-target {
                    position: absolute;
                    color: white;
                    top: 11px;
                    font-size: 16px;
                    text-shadow: 1px 1px 3px #fff;
                }
                &-item {
                    min-width: 160px;
                    max-width: 160px;
                    margin: 0 20px;
                    height: 40px;
                    color: #fff;
                    background: {
                        image: url($home-page-footer-menu-item);
                        size: 100% 100%;
                        repeat: no-repeat;
                    }
                    &:hover {
                        transition: all .8s;
                        background: {
                            image: url($home-page-footer-menu-active);
                            size: 100% 100%;
                            repeat: no-repeat;
                        }
                    }
                    figcaption {
                        margin: 0 0 0 10px;
                    }
                }
            }
        }
    }
</style>