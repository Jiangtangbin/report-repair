<template>
    <div v-click-outside="hide" :class="{'search-wrapper-show': show}" class="search-wrapper d-v-c">
        <svg-icon @click="toggleHandle" icon-class="search" />
        <i-select v-model="search" @on-change="selected" :remote-method="querySearch" class="search-body" :placeholder="i18n.placeholder.menu" ref="select" remote filterable>
            <i-option v-for="item of data" :key="`${item.path}${search}`" :value="item.path">{{item.title.join('>')}}</i-option>
        </i-select>
    </div>
</template>

<script lang="ts">
/// <reference types="node" />
import { Watch, Component, Vue } from 'vue-property-decorator';
import { Select as ISelect, Option as IOption, Input as IInput } from 'view-design';
import { permissionModule } from '@/store/index';
import FuseJs from 'fuse.js';
import path from 'path';
import { RouteConfig } from 'vue-router';

interface IOptions {
    title: string[];
    path: string;
}

@Component({
    components: {
        ISelect,
        IOption,
        IInput,
    },
})
export default class NavSearch extends Vue {
    $refs!: {
        select: ISelect;
    }

    private show = false;
    private data: IOptions[] = [];
    private search = '';
    private fuse: FuseJs<IOptions, any> | null = null;

    get routes() {
        return permissionModule.addRoutes;
    }
    get i18n() {
        const placeholder = {
            menu: this.$t('h.placeholder.pleaseEnter', { msg: this.$t('h.header.menuName') }),
        };
        
        return { placeholder };
    }

    // 初始化搜索函数
    @Watch('routes', { immediate: true })
    initFuse(data: RouteConfig[]) {
        const _data = this.genSearchPool(data);
        this.fuse = new FuseJs(_data, {
            shouldSort: true,
            threshold: 0.4,
            location: 0,
            distance: 100,
            maxPatternLength: 32,
            minMatchCharLength: 1,
            keys: [{
                name: 'title',
                weight: 0.7,
            }, {
                name: 'path',
                weight: 0.3,
            }],
        });
    }

    /**
     * @description: 设置显示状态
     * @param {Boolean} status: 显示状态
     */
    toggleHandle(status?: boolean) {
        this.show = typeof status === 'boolean' ? status : !this.show;
        if (this.show) {
            (this.$refs.select as any).isFocused = true;
        } else {
            this.$nextTick(() => {
                this.search = '';
            });
            this.data = [];
        }
    }
    // 隐藏
    hide() {
        this.toggleHandle(false);
    }
    /**
     * @description: 对路由进行处理，返回搜索源
     * @param {Array} routes: 搜索的路由
     * @param {String} basePath: 路径
     * @param {Array} prefixTitle: 标题
     */
    genSearchPool(routes: RouteConfig[], basePath: string = '/', prefixTitle: string[] = []): IOptions[] {
        let res: IOptions[] = [];
        for (const router of routes) {
            // 跳过隐藏路由器
            // if (router.hidden) continue;
            const data: IOptions = {
                path: path.resolve(basePath, router.path),
                title: [...prefixTitle],
            };
            if (router.meta && router.meta.title) {
                data.title = [...data.title, router.meta.title];
                if (!router.redirect) {
                    // 只推带标题的路线，特殊情况，需要排除没有重定向的父路由器
                    res.push(data);
                }
            }
            // 递归子路由
            if (router.children) {
                const tempRoutes = this.genSearchPool(router.children, data.path, data.title);
                if (tempRoutes.length >= 1) {
                    res = [...res, ...tempRoutes];
                }
            }
        }
        return res;
    }
    /**
     * @description: 搜索事件
     * @param {String} str: 搜索值
     */
    querySearch(str: string) {
        if (str !== '' && this.fuse) {
            this.data = (this.fuse.search(str) as IOptions[]);
        } else {
            this.data = [];
        }
    }
    /**
     * @description: 选择事件
     * @param {String} path: 选择的路径
     */
    selected(path: string) {
        if (path) {
            this.$router.push(path);
            this.hide();
        }
    }
}
</script>

<style scoped lang="scss">
    $radius: 15px;

    .search-wrapper {
        padding: 0 5px;
        border-radius: $radius;
        .search-body {
            width: 0;
            overflow: hidden;
            transition: width .3s $--ease-out-function;
            border-radius: 20px;
            @include utils-inputPlaceholder($--btn-disable-color-2);
            @include utils-pierce (ivu-select-selection) {
                border: none;
                background: #1B325C;
                .ivu-select-input {
                    color: $--white;
                    background: rgba(255, 255, 255, 0.2);
                    opacity: 0.5;
                }
            }
        }
        &-show {
            .search-body {
                width: 200px;
                margin-left: 4px;
            }
        }
    }
</style>