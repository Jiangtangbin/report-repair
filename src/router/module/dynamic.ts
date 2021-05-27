import { RouteConfig, Route, RawLocation } from 'vue-router';
import template from '@/views/template.vue';
import { userModule } from '@/store/index';
import { getMatch } from '@/utils/index';

const Layout = () => import(/* webpackChunkName: 'layout' */'@/views/layout/index.vue');

/**
 * @description: meta 字段详解
 * @param {String} title: 页面标题
 * @param {Boolean} fullScreen?: 是否全屏
 * @param {Boolean} noAuth?: 白名单路由
 * @param {Boolean} noTag?: 该组件不缓存(true)
 */

// 重定向守卫
function redirect(to: Route): RawLocation {
    const result = getMatch(userModule.menus, { value: to.matched.slice(-1)[0].name! });
    return result
        ? result.children![0].path
        : { name: 'home' };
}

// 将 query 参数转为路由组件的 props-fromQuery 字段
const setProps1: RouteConfig['props'] = route => ({ fromQuery: { ...route.query }, authKey: route.name });
// 将 query 参数转为路由组件的 props 字段
const setProps2: RouteConfig['props'] = route => ({ ...route.query, authKey: route.name });
// 将 query 参数转为路由组件的 props-fromQuery 字段，同时设置所属应用
// const setProps3: RouteConfig['props'] = route => ({ fromQuery: { ...route.query }, plat: route.params.free });
const dynamicRoutes: RouteConfig[] = [
        {
            path: '/orgList',
            name: 'orgList',
            meta: {
                title: '客户',
            },
            props: setProps1,
            component: () => import(/* webpackChunkName: 'customer-manage' */ '@/views/list-form/customer-manage.vue'),
        },
        {
            path: '/userList',
            name: 'userList',
            meta: {
                title: '账号',
            },
            props: setProps1,
            component: () => import(/* webpackChunkName: 'account-number-manage' */ '@/views/list-form/account-number-manage.vue'),
        },
        {
            path: '/knowLedgeList',
            name: 'knowLedgeList',
            meta: {
                title: '知识库',
            },
            props: setProps1,
            component: () => import(/* webpackChunkName: 'know-ledge-manage' */ '@/views/list-form/know-ledge-manage.vue'),
        },
        {
            path: '/noticeList',
            name: 'noticeList',
            meta: {
                title: '公告',
            },
            props: setProps1,
            component: () => import(/* webpackChunkName: 'notice-manage' */ '@/views/list-form/notice-manage.vue'),
        },
        {
            path: '/poolList',
            name: 'poolList',
            meta: {
                title: '工单池',
            },
            props: setProps1,
            component: () => import(/* webpackChunkName: 'work-pool-manage' */ '@/views/list-form/work-pool-manage.vue'),
        },
        {
            path: '/workList',
            name: 'workList',
            meta: {
                title: '工单记录',
            },
            props: setProps1,
            component: () => import(/* webpackChunkName: 'work-manage' */ '@/views/list-form/work-manage.vue'),
        },
        {
            path: '/map',
            name: 'map',
            meta: {
                title: '总览',
                fullScreen: true,
                size: true, // 用于给地图运维中的地图类型增加偏移
            },
            props: setProps1,
            component: () => import(/* webpackChunkName: 'map-operation' */ '@/views/operations/map-operation.vue'),
        },
        {
            path: '/operationLog',
            name: 'operationLog',
            meta: {
                title: '操作记录',
            },
            props: setProps1,
            component: () => import(/* webpackChunkName: 'operation-log' */ '@/views/list-form/operation-log.vue'),
        },
    // {
    //     path: '/system',
    //     name: 'system',
    //     meta: {
    //         title: '系统信息',
    //     },
    //     component: Layout,
    //     redirect,
    //     children: [
    //         {
    //             path: 'dicts',
    //             name: 'dicts',
    //             meta: {
    //                 title: '字典数据',
    //                 noAuth: true,
    //             },
    //             props: (route) => ({ t: route.query.t }),
    //             component: () => import(/* webpackChunkName: 'dictionaries-manage' */ '@/views/list-form/dictionaries-manage.vue'),
    //         },
    //         {
    //             path: 'menuManage',
    //             name: 'menuManage',
    //             meta: {
    //                 title: '菜单管理',
    //             },
    //             props: (route) => ({ t: route.query.t, authKey: route.name }),
    //             component: () => import(/* webpackChunkName: 'menu-manage' */ '@/views/list-form/menu-manage.vue'),
    //         },
    //         {
    //             path: 'packageManage',
    //             name: 'packageManage',
    //             meta: {
    //                 title: '安装包和插件管理',
    //             },
    //             component: () => import(/* webpackChunkName: 'package-manage' */ '@/views/list-form/package-manage.vue'),
    //         },
    //         {
    //             path: 'operation-log',
    //             name: 'operation-log',
    //             meta: {
    //                 title: '操作记录',
    //             },
    //             props: setProps1,
    //             component: () => import(/* webpackChunkName: 'operation-log' */ '@/views/list-form/operation-log.vue'),
    //         },
    //     ],
    // },
    // {
    //     path: '/user',
    //     name: 'user',
    //     meta: {
    //         title: '用户管理',
    //     },
    //     component: Layout,
    //     redirect,
    //     children: [
    //         {
    //             path: 'unitManage',
    //             name: 'unitManage',
    //             meta: {
    //                 title: '客户管理',
    //             },
    //             props: setProps1,
    //             component: () => import(/* webpackChunkName: 'customer-manage' */ '@/views/list-form/customer-manage.vue'),
    //         },
    //         {
    //             path: 'userManage',
    //             name: 'userManage',
    //             meta: {
    //                 title: '账号管理',
    //             },
    //             props: setProps1,
    //             component: () => import(/* webpackChunkName: 'account-number-manage' */ '@/views/list-form/account-number-manage.vue'),
    //         },
    //         {
    //             path: 'role',
    //             name: 'role',
    //             meta: {
    //                 title: '角色管理',
    //             },
    //             props: setProps1,
    //             component: () => import(/* webpackChunkName: 'role-manage' */ '@/views/list-form/role-manage.vue'),
    //         },
    //     ],
    // },
    // {
    //     path: '/device',
    //     name: 'device',
    //     meta: {
    //         title: '设备中心',
    //     },
    //     component: Layout,
    //     redirect,
    //     children: [
    //         {
    //             path: 'deviceList',
    //             name: 'deviceList',
    //             meta: {
    //                 title: '设备管理',
    //             },
    //             props: setProps1,
    //             component: () => import(/* webpackChunkName: 'device-manage' */ '@/views/list-form/device-manage.vue'),
    //         },
    //         {
    //             path: 'group',
    //             name: 'group',
    //             meta: {
    //                 title: '设备分组管理',
    //             },
    //             props: setProps1,
    //             component: () => import(/* webpackChunkName: 'device-group-manage' */ '@/views/list-form/device-group-manage.vue'),
    //         },
    //         {
    //             path: 'maps',
    //             name: 'maps',
    //             meta: {
    //                 title: '平面图管理',
    //             },
    //             props: setProps1,
    //             component: () => import(/* webpackChunkName: 'plan-manage' */ '@/views/list-form/plan-manage.vue'),
    //         },
    //         {
    //             path: 'files',
    //             name: 'files',
    //             meta: {
    //                 title: '文件仓库',
    //             },
    //             props: setProps1,
    //             component: () => import(/* webpackChunkName: 'file-manage' */ '@/views/list-form/file-manage.vue'),
    //         },
    //         {
    //             path: 'configs',
    //             name: 'configs',
    //             meta: {
    //                 title: '配置管理',
    //             },
    //             props: setProps1,
    //             component: () => import(/* webpackChunkName: 'config-manage' */ '@/views/list-form/config-manage.vue'),
    //         },
    //         {
    //             path: 'distribute-log',
    //             name: 'distribute-log',
    //             meta: {
    //                 title: '下发记录',
    //             },
    //             props: setProps1,
    //             component: () => import(/* webpackChunkName: 'distribute-log-manage' */ '@/views/list-form/distribute-log-manage.vue'),
    //         },
    //     ],
    // },
    // {
    //     path: '/layout',
    //     name: 'layout',
    //     meta: {
    //         title: '运维中心',
    //     },
    //     component: Layout,
    //     redirect,
    //     children: [
    //         {
    //             path: 'planLayout',
    //             name: 'planLayout',
    //             meta: {
    //                 title: '地图运维',
    //                 fullScreen: true,
    //                 size: true, // 用于给地图运维中的地图类型增加偏移
    //             },
    //             props: route => ({ ...route.query, tagHide: true, authKey: route.name }),
    //             component: () => import(/* webpackChunkName: 'map-operation' */'@/views/operations/map-operation.vue'),
    //         },
    //     ],
    // },
];

export default dynamicRoutes;