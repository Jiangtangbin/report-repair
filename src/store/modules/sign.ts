
import store from '../index';
import resetStore from '../reset';
import router, { resetRouter } from '@/router/index';
import { asyncConstantRoutes } from '@/router/module/constant';
import { Module, VuexModule, Action, getModule } from 'vuex-module-decorators';
import { login, logout, getUserThroughToken, getUserThroughSecret, freshToken } from '@/config/api';
import { setStorage } from '@/utils/index';
import { currentUserKey } from '@/config/index';
import path from 'path';

// 更新 token 时，防止用来重复请求
let updateTokenRequest: Promise<boolean> | undefined;

function addPath(data: ResponseLogin.Auth[], basePath = '/') {
    return data.every(v => {
        v.path = path.resolve(basePath, v.value);
        if (v.children && v.children.length) addPath(v.children, v.path);
        return true;
    });
}

@Module({ name: 'sign', namespaced: true, dynamic: true, store })
class Sign extends VuexModule {
    /**
     * @description: 登录
     * @param {Object} data: 登录的数据
     * @param {Boolean} isSecret: 是否通过秘钥登录
     */
    @Action
    login(data: API.Parameter['Login'] | string, isSecret?: boolean) {
        const request = isSecret
            ? getUserThroughSecret(data as string)
            : (typeof data !== 'string' ? login(data) : getUserThroughToken(data));
        return request
            .then(async (data: any) => {
                if (!data.type) {
                    addPath(data.data.auth);
                    this.addRoutes(data.data.auth);
                    // setStorage(currentUserKey, data.data.info.mobile.toString(), 'sessionStorage');
                    setStorage('t', data.data.token);
                    // const points = (data.data.info.maprange as any) || '[]';
                    // data.data.info.maprange = JSON.parse(points);
                    // if (data.data.lnglat) {
                    //     // 后台可能返回字符串，谷歌浏览器只允许数字类型
                    //     const { lng, lat } = data.data.lnglat;
                    //     Object.assign(data.data.lnglat, { lng: Number(lng), lat: Number(lat) });
                    // }
                    store.commit('user/resetUser', data.data);
                    store.commit('app/alterState', { key: 'isLogin', value: true });
                }
                return data;
            });
    }
    /**
     * @description: 添加路由
     * @param {Array} auth: 权限菜单
     */
    @Action
    async addRoutes(auth: ResponseLogin.Auth[]) {
        console.log(auth)
        const routes = await store.dispatch('permission/generateRoutes', auth);
        router.addRoutes(routes.concat(asyncConstantRoutes));
    }
    // 退出登录
    @Action
    logout() {
        return logout()
            .then((data: any) => {
                if (!data.type) {
                    this.resetState();
                }
                return data;
            });
    }
    // 切换登录状态是重置 vuex 状态
    @Action
    resetState() {
        resetRouter();
        resetStore();
    }
    // 更新 token
    @Action
    async updateToken(data: API.Parameter['Login']): Promise<boolean> {
        if (updateTokenRequest) return updateTokenRequest;
        updateTokenRequest = login(data)
            .then(({ type, data }) => {
                type || store.commit('user/alterState', { key: 'token', value: data.token });
                updateTokenRequest = undefined;
                return !type;
            });
        return updateTokenRequest;
    }
    // 刷新 token
    @Action
    freshToken() {
        if (updateTokenRequest) return updateTokenRequest;
        updateTokenRequest = freshToken()
            .then(({ type, data }) => {
                type || store.commit('user/alterState', { key: 'token', value: data });
                updateTokenRequest = undefined;
                return !type;
            });
        return updateTokenRequest;
    }
}

export const signModule = getModule(Sign);