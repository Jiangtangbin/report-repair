<template>
    <breadcrumb>
        <transition-group name="fade-transform-r-l">
            <breadcrumb-item key="/home">
                <svg-icon @click="handle({ path: '/home' })" icon-class="location" />
            </breadcrumb-item>
            <breadcrumb-item v-for="(item, index) of breadcrumbs" :key="item.path">
                <span v-if="item.redirect === 'noredirect' || index === breadcrumbs.length - 1">{{ item.meta.title }}</span>
                <svg-icon v-else-if="item.meta.icon" @click="handle(item)" :icon-class="item.meta.icon" />
                <a v-else @click.prevent="handle(item)">{{ item.meta.title }}</a>
            </breadcrumb-item>
        </transition-group>
    </breadcrumb>
</template>

<script lang="ts">
import { Component, Watch, Vue } from 'vue-property-decorator';
import pathToRegexp from 'path-to-regexp';
import { Breadcrumb, BreadcrumbItem } from '@/components/breadcrumb/index';
import { RouteRecord } from 'vue-router';

@Component({
    components: {
        Breadcrumb,
        BreadcrumbItem,
    },
})
export default class Breadcrumbs extends Vue {
    private breadcrumbs: RouteRecord[] = [];

    @Watch('$route', { immediate: true })
    genBreadcrumbs() {
        const matched = this.$route.matched.filter(v => v.name);
        this.breadcrumbs = matched.filter(v => v.meta && v.meta.title);
    }

    /**
     * @description: 对路径进行编译, 防止产生错误
     * @param {String} path: 待编译的路径
     */
    pathCompile(path: string): string {
        // 参考地址 https://github.com/PanJiaChen/vue-element-admin/issues/561
        const { $route: { params }} = this;
        const toPath = pathToRegexp.compile(path);
        return toPath(params);
    }
    /**
     * @description: 跳转路由
     * @param {Object} item: 跳转项信息
     */
    handle(item: object) {
        const { path } = item;
        this.$router.push(this.pathCompile(path));
    }
}
</script>