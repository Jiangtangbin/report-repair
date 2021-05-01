import { setStorage, getStorage, compile, unCompile } from './index';

export interface IUserInfo {
    mobile: string;
    password: string;
    remember: boolean;
}

export interface ICompileUser {
    0: string;
    1: string;
    2: boolean
}

interface IStorageCompileUser {
    [index: string]: ICompileUser;
}

// 用户账号信息存储的 key
const STORAGE_KEY = 'u';

/**
 * @description: 对编码后的用户信息进行还原
 * @param {ICompileUser} user: 用户信息
 */
function parseUser(user: ICompileUser): IUserInfo {
    return {
        mobile: unCompile(user[0]),
        password: unCompile(user[1]),
        remember: user[2],
    };
}

/**
 * @description: 获取用户信息
 * @param {String} mobile: 用户名，未传则传所有的
 * @returns {IUserInfo[]}
 */
export function getUser(mobile?: string): IUserInfo[] {
    const store: IStorageCompileUser | undefined = getStorage(STORAGE_KEY);
    if (!store) return [];
    if (mobile) {
        const enMobile = compile(mobile);
        const userInfo = store[enMobile];
        return userInfo
            ? [parseUser(userInfo)]
            : [];
    } else {
        return Object.values(store).map(parseUser);
    }
}

/**
 * @description: 保存用户信息
 * @param {IUserInfo} data: 用户信息
 */
export function setUser({ mobile, password, remember }: IUserInfo) {
    const store: IStorageCompileUser = getStorage(STORAGE_KEY) || {};
    const enMobile = compile(mobile);
    const enPassword = compile(password);
    setStorage(STORAGE_KEY, Object.assign(store, { [enMobile]: { 0: enMobile, 1: enPassword, 2: remember }}));
}