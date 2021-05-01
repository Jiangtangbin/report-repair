import Vue from 'vue';
import Vuex from 'vuex';
import { getModule } from 'vuex-module-decorators';
import app, { IRoot } from './modules/app';
import user, { IUserState } from './modules/user';
import permission, { IPermission } from './modules/permission';
import socket, { ISocket } from './modules/socket';
import persistedstate from 'vuex-persistedstate';
import { storeType, storeKey, staleDatedKey, staleDatedTime } from '@/config/index';

Vue.use(Vuex);

export interface IRootState {
    app: IRoot;
    user: IUserState;
    permission: IPermission;
    socket: ISocket;
}

const store = new Vuex.Store<IRootState>({
    strict: process.env.NODE_ENV !== 'production', // 严格模式，仅允许 mutations 触发 state 的更新
    modules: {
        app,
        user,
        permission,
        socket,
    },
    plugins: [
        persistedstate({
            key: storeKey,
            storage: {
                getItem(key) {
                    // 获取上次保存的时间戳
                    const lastTimestamp: string | null = window[storeType].getItem(key + staleDatedKey);
                    return staleDatedTime === undefined || Date.now() - Number(lastTimestamp) < (staleDatedTime as number)
                        ? window[storeType].getItem(key)
                        : null;
                },
                setItem: (key, value) => window[storeType].setItem(key, value),
                removeItem: key => window[storeType].removeItem(key),
            },
        }),
    ],
});

export default store;
export const appModule = getModule(app, store);
export const userModule = getModule(user, store);
export const permissionModule = getModule(permission, store);
export const socketModule = getModule(socket, store);