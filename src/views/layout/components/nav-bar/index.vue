<template>
    <div class="nav-bar-wrapper">
        <div class="nav-bar-title d-v-c">
            <h2 :style="styles">{{$t(title)}}</h2>
        </div>
        <my-menu @selected="selected" :active-name="$route.name" :collapse="collapse" :data="menuData" :trigger="trigger" class="nav-bar-menus" ref="menuWrapper" />
        <div class="nav-bar-personal d-v-c">
            <search />
            <avatar />
        </div>
    </div>
</template>

<script lang="ts">
import { Watch, Prop, Component, Vue } from 'vue-property-decorator';
import { Card } from 'view-design';
import { appModule, userModule } from '@/store/index';
import MyMenu from '@/components/menu/index.vue';
import Search from './search.vue';
import avatar from './avatar.vue';
import { title } from '@/config/environment';

// 首页
const home = [{ title: 'h.other.home', icon: 'homes', value: 'home', path: '/home' }];

@Component({
    components: {
        Card,
        Search,
        avatar,
        MyMenu,
    },
})
export default class LayoutNavBar extends Vue {
    // 需要独立的菜单源
    @Prop(String)
    free?: string;

    lang = appModule.lang;

    get title() {
        const { $route: { params: { free }, matched }} = this;
        const route = free && matched.find(v => v.path.indexOf(`:free(${free})`) !== -1);
        return (route && route.meta.title) || this.$t(title);
    }
    // 子应用首页
    get appHome() {
        const { free } = this;
        return free ? [{ title: 'h.other.home', icon: 'home', value: 'govern-home', path: `/home/${free}` }] : [];
    }
    // 数据源
    get menuData() {
        const { free, appHome } = this;
        return free
            ? home.concat(appHome, this.freeModule(free, userModule.menus))
            : home.concat(userModule.menus);
    }
    // 是否处于手机模式
    get isMobile() {
        return appModule.isMobile;
    }
    // 是否开启子级菜单弹出模式
    get collapse() {
        return !this.isMobile && appModule.sidebarToggle;
    }
    // 触发方式
    get trigger() {
        return this.collapse ? 'hover' : 'click';
    }
    get language() {
        return appModule.lang;
    }
    get styles() {
        return {
            'letter-spacing': this.lang === 'en-US' ? '5px' : '20px',
            padding: this.lang === 'en-US' ? '0 5px 0 0' : '0 0 0 10px',
        };
    }

    @Watch('language')
    languageChange(val: string) {
        this.lang = val as Language;
    }
    
    /**
     * @description: 菜单跳转
     * @param {Object} data: 待跳转菜单的信息
     */
    selected(data: ResponseLogin.Auth) {
        const _cacheRoute = appModule.cacheRoute.find(v => v.path === data.path);
        let path = '';
        if (_cacheRoute) {
            path = _cacheRoute.fullPath;
        } else {
            if (data.url_value && data.url_value.includes('http', 0)) {
                this.$getDynamicComponent('publicIframe', () => {
                    this.$createPublicIframeHandle({
                        title: data.title,
                    }).show();
                });
                return false;
            } else {
                path = data.path;
            }
        }
        this.$router.push(path);
    }
    /**
     * @description: 需要独立出来的模块
     * @param {String} type: 需要独立出来的模块
     * @param {Array} data: 数据源
     */
    freeModule(type: string, data: ResponseLogin.Auth[]): ResponseLogin.Auth[] {
        const lastModule = data.find(v => v.value === 'govern');
        if (!(lastModule && lastModule.children)) return [];
        const result = lastModule.children.find(v => v.value === type);
        return result && result.children ? result.children : [];
    }
}
</script>
<style scoped lang="scss">
    $title-bg: '~@/assets/images/ds_lump.png';

    // 菜单栏
    @include utils-b(nav-bar-wrapper) {
        .nav-bar-menus {
            overflow: hidden;
        }
    }

    .nav-bar-wrapper {
        width: 100%; height: 60px;
        color: $--white;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0px 0px 5px 0px #01C8EB;
        .nav-bar-title {
            height: 100%;
            flex-flow: column nowrap;
            margin-left: 10px;
            h2 {
                letter-spacing: 20px;
                border-right: 2px solid;
                height: 45px;
                line-height: 45px;
                font-size: 24px;
                color: #01C8EB;
                text-shadow: 1px 1px 3px #01C8EB;
            }
        }
        .nav-bar-personal {
            height: 100%;
            margin-right: 10px;
        }
        .nav-bar-menus {
            flex: auto;
            height: 100%;
            display: flex;
            align-items: center;
            @include utils-pierce(sub-menu) {
                width: 120px;
                background: none;
                &__title--icon {
                    margin: 2px 5px 0 0;
                }
                &__icon-arrow {
                    margin: 1px 0 0 5px;
                }
            }
        }
    }
</style>