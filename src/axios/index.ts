import axios, { AxiosRequestConfig } from 'axios';
import { signModule } from '@/store/modules/sign';
import { config, request, errorCallback, responseError } from './config';
import { Message } from 'view-design';
import { i18n } from '@/locale/index';

export const defaultAxios = axios.create(config());

defaultAxios.interceptors.request.use(request, errorCallback);
defaultAxios.interceptors.response.use(a => a, responseError);

type AxiosConfig = AxiosRequestConfig & {
    noTip?: boolean;
    forbiddenAutoUpdateToken?: boolean;
    updateTokenFun?: null | (() => Promise<boolean>);
};

function getUpdateTokenFunc(): Promise<boolean> {
    return signModule.freshToken();
}

/**
 * @description: 对请求做一层包装
 * @param {String} url: 地址
 * @param {Object} config: 配置参数
 */
function _axios<T extends API.Response[keyof API.Response] | null = null>(url: string, config: AxiosConfig, wholeResponse: true): Promise<IWholeResponse<T>>
function _axios<T extends API.Response[keyof API.Response] | null = null>(url: string, config?: AxiosConfig, wholeResponse?: false): Promise<IResponse<T>>
function _axios(url: string, config: AxiosConfig = {}, wholeResponse?: any) {
    return defaultAxios({ url, ...config })
        .then((response) => {
            // IE9 时 response.data 是 undefined，因此需要使用 response.request.responseText (Stringify后的字符串)
            const data = response.data === undefined ? JSON.parse(response.request.responseText) : response.data;
            if (
                data.code === 1 &&
                config.updateTokenFun !== null &&
                !config.forbiddenAutoUpdateToken
            ) {
                // token 过期，自动重新登录
                return (config.updateTokenFun || getUpdateTokenFunc)()
                    .then(status => {
                        if (status) {
                            return _axios(url, config, wholeResponse);
                        } else {
                            Message.error(i18n.t('h.tips.tokenExpire'));
                            throw new Error('token 过期, 请重新登录');
                        }
                    });
            }
            if (!data.status) {
                response.data = Object.assign(data, { type: 'fail' });
            }
            config && !config.noTip && response.data && response.data.type && response.data.msg && Message.error(response.data.msg);
            return Promise.resolve(wholeResponse ? response : data);
        }).catch((error) => {
            const tips = i18n.te(`h.httpCode.${error.message}`) ? i18n.t(`h.httpCode.${error.message}`) : error.message;
            console.error({ error });
            config && !config.noTip && Message.error(tips || i18n.t('h.tips.unknownError'));
            return Promise.resolve({ type: 'error', code: 0, msg: tips || i18n.t('h.tips.unknownError'), data: null, status: false });
        });
}

export default _axios;