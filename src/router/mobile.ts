import Vue from 'vue';
import Router, { RouteConfig } from 'vue-router';
import { VueRouter } from 'vue-router/types/router';

Vue.use(Router);

const setProps: RouteConfig['props'] = (route) => ({ id: Number(route.query.id) || 0 });

function createRouter(): VueRouter {
    return new Router({
        scrollBehavior: () => ({ x: 0, y: 0 }),
        routes: constantRoutes,
    });
}

const constantRoutes: RouteConfig[] = [
    {
        path: '/',
        redirect: '/download',
    },
    /* app 下载页 */
    {
        path: '/download',
        name: 'download',
        meta: {
            title: 'app 下载',
        },
        component: () => import(/* webpackChunkName: "download" */ '@/views/download.vue'),
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

const router = createRouter();

export default router;