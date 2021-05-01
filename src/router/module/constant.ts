import { RouteConfig } from 'vue-router';

const constantRoutes: RouteConfig[] = [
    {
        path: '/',
        name: 'login',
        meta: {
            title: '登录',
        },
        component: () => import(/* webpackChunkName: 'login' */ '@/views/login/index.vue'),
    },
    {
        path: '/icon',
        name: 'icon',
        meta: {
            title: '图标',
        },
        component: () => import(/* webpackChunkName: 'icon' */ '@/views/svg-icon/index.vue'),
    },
];

export const asyncConstantRoutes: RouteConfig[] = [
    {
        path: '/home',
        name: 'home',
        meta: {
            title: '首页',
        },
        component: () => import(/* webpackChunkName: 'home' */ '@/views/home/index.vue'),
    },
    {
        path: '/api',
        name: 'api',
        meta: {
            title: '接口页面',
        },
        component: () => import(/* webpackChunkName: 'api' */ '@/views/api/index.vue'),
    },
    {
        path: '/zrender',
        name: 'zrender',
        meta: {
            title: 'zrender 页面',
        },
        component: () => import(/* webpackChunkName: 'zrender' */ '@/views/zrender.vue'),
    },
    {
        path: '*',
        name: '*',
        meta: {
            title: '404',
        },
        component: () => import(/* webpackChunkName: '404' */ '@/views/404.vue'),
    },
];

export default constantRoutes;