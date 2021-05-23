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
        path: '/personal',
        name: 'personal',
        meta: {
            title: '个人设置',
        },
        component: () => import(/* webpackChunkName: 'personal' */ '@/views/setting/personal.vue'),
    },
    {
        path: '/modifyMobile',
        name: 'modifyMobile',
        meta: {
            title: '修改手机号码',
        },
        component: () => import(/* webpackChunkName: 'modify-mobile' */ '@/views/setting/modify-mobile.vue'),
    },
    {
        path: '/modifyPassword',
        name: 'modifyPassword',
        meta: {
            title: '修改密码',
        },
        component: () => import(/* webpackChunkName: 'modify-password' */ '@/views/setting/modify-password.vue'),
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