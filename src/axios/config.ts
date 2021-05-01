import Qs from 'qs';
import { AxiosRequestConfig } from 'axios';
import { userModule } from '@/store/index';
import baseUrl from '@/config/api';

const disposeType = ['Array', 'Object'];

function getType(obj: any) {
    return Object.prototype.toString.call(obj).slice(8, -1);
}

// axios 实例配置
export const config = () => ({
    baseURL: baseUrl,
    paramsSerializer: (params: any) => Qs.stringify(params, { arrayFormat: 'indices' }),
});

// 请求前的处理函数
export const request = (config: AxiosRequestConfig) => {
    config.headers = config.headers || {};
    config.headers.token = config.headers.token || userModule.user.token;
    const type = getType(config.data);
    disposeType.includes(type) && (config.data = Qs.stringify(config.data));
    return config;
};

// 错误处理函数
export function errorCallback(error: Error) {
    return Promise.reject(error);
}

// 请求错误处理函数
export function responseError(error: any) {
    error.oldMessage = error.message;
    if (error.response && error.response.status) {
        error.message = error.response.status || error.message;
    }
    else {
        error.message = 'timeout';
    }
    return Promise.reject(error);
}

// token 过期后的更新函数
// export async function updateToken(): Promise<boolean> {
//     const [user] = getUser(userModule.user.info.mobile.toString());
//     if (!user) return Promise.resolve(false);
//     return _updateToken({ mobile: user.mobile, password: user.password, type: 1, force: 1 });
// }