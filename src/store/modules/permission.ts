/// <reference types="node" />

import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import constantRoutes from '@/router/module/constant';
import asyncRoutes from '@/router/module/dynamic';
import pathToRegexp from 'path-to-regexp';
import path from 'path';
import { RouteConfig } from 'vue-router';

export interface IPermission {
    routes: RouteConfig[];
    addRoutes: RouteConfig[];
}

/**
 * @description: 筛选符合条件的路由
 * @param {Array} routes: 异步加载的路由
 * @param {Array} auth: 权限菜单
 */
function filterAsyncRoutes(routes: RouteConfig[], auth: ResponseLogin.Auth[], basePath = '/'): RouteConfig[] {
    const result: RouteConfig[] = [];
    routes.every(_route => {
        const route = { ..._route };
        const status = auth.some(v => {
            const status = pathToRegexp(path.resolve(basePath, route.path)).test(v.path);
            if (status) {
                route.meta = route.meta || {};
                route.meta.title = v.in_title || v.title || route.meta.title;
                route.children && v.children && (route.children = filterAsyncRoutes(route.children, v.children, path.resolve(basePath, route.path)));
                result.push(route);
            }
            return status;
        });
        if (!status) {
            route.meta &&
                route.meta.noAuth &&
                result.findIndex(v => v.path === route.path) === -1 &&
                result.push(route);
        }
        return true;
    });
    return result;
}

@Module({ namespaced: true, name: 'permission' })
class Permission extends VuexModule implements IPermission {
    public routes: RouteConfig[] = [];
    public addRoutes: RouteConfig[] = [];

    @Mutation
    setRoutes(routes: RouteConfig[]) {
        this.addRoutes = routes;
        this.routes = constantRoutes.concat(routes);
    }

    @Action
    generateRoutes(auth: ResponseLogin.Auth[]): Promise<RouteConfig[]> {
        const accessedRoutes = filterAsyncRoutes(asyncRoutes, auth);
        this.setRoutes(accessedRoutes);
        return Promise.resolve(accessedRoutes);
    }
}

export default Permission;