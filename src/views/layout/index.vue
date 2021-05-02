<template>
    <div class="layout-wrapper">
        <div :style="{width: getWidth}" class="layout-main">
            <nav-bar v-show="!isFullScreen" :free="free" />
            <Breadcrumb v-show="!isFullScreen" />
            <app-main :class="{'layout-main-app-full-screen': isFullScreen}" class="layout-main-app" />
        </div>
    </div>
</template>

<script lang="ts">
import { Watch, Component, Vue } from 'vue-property-decorator';
import Breadcrumb from './components/nav-bar/breadcrumb.vue';
import { NavBar, AppMain } from './components/index';
import { appModule } from '@/store/index';
import { Route } from 'vue-router';

@Component({
    components: {
        Breadcrumb,
        AppMain,
        NavBar,
    },
})
export default class Layout extends Vue {
    isFullScreen = false;
    free: string | undefined = '';
    
    get getWidth() {
        const { isFullScreen } = this;
        return isFullScreen || appModule.isMobile
            ? '100%'
            : appModule.sidebarToggle
                ? 'calc(100% - 58px)'
                : 'calc(100% - 270px)';
    }

    // 需要独立的菜单模块
    @Watch('$route.params.free', { immediate: true })
    freeChange(val: string | undefined) {
        this.free = val || '';
    }
    @Watch('$route', { immediate: true })
    routeChange(route: Route) {
        this.isFullScreen = route.meta.fullScreen === true;
        const { meta, fullPath, path, name } = route;
        const value = name && name.replace(/^(xf-|aj-|sw-|dj-|hb-|gw-|sq-|jt-|jy-|mz-)/, '');
        meta && value && meta.title && !meta.noTag && appModule.updateCacheRoute({ title: meta.title, value, path, fullPath });
    }
}
</script>

<style scoped lang="scss">
    $page-bg: '~@/assets/images/page-bg.png';

    .layout-wrapper {
        width: 100%; height: 100%;
        display: flex;
        background-color: #f1f5f7;
        background: {
            image: url($page-bg);
            size: 100% 100%;
            repeat: no-repeat;
        }
        // 主体内容
        .layout-main {
            width: 100%; height: inherit;
            flex: auto;
            display: flex;
            flex-flow: column;
            &-app {
                &-full-screen {
                    width: 100%; height: 100%;
                    padding: 0;
                }
                width: 100%; height: calc(100% - 93px); // 面包屑 + header 的高度 93 px
                flex: auto;
                z-index: 0;
                color: $--white;
            }
        }
    }
</style>