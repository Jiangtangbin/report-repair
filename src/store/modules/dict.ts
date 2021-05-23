import { Module, VuexModule, Action, getModule } from 'vuex-module-decorators';
import store, { userModule } from '../index';
import { getDicts, getCityAreaTree, getRuleSelect, getWorkServiceFault } from '@/config/api';
import { uniqueRequest, disposeCascader } from '@/utils/assist';

type CustomDicts = GlobalCustomDicts.CustomDicts

@Module({ name: 'dict', store, dynamic: true, namespaced: true })
class Dict extends VuexModule {
    /**
     * @description: 获取字典数据
     * @param t?: 字典类型
     */
    @Action
    async getDicts(t?: string | number): Promise<ResponseSimple.Dict[] | string> {
        let list = userModule.dicts[t || 'list'];
        return list || this.requestDicts(t);
    }
    /**
     * @description: 请求字典数据
     * @param t?: 字典类型
     */
    @Action
    async requestDicts(t?: string | number): Promise<ResponseSimple.Dict[] | string> {
        const { type, data, msg } = await uniqueRequest(() => getDicts(t), t || 'list');
        uniqueRequest.remove(t || 'list');
        if (!type) {
            userModule.alterDict({ key: t || 'list', value: data });
        }
        return data || msg;
    }
    /**
     * @description: 获取自定义字典或字典数据
     * @param t?: 自定义类型
     */
    @Action
    async requestCustomDicts<T extends CustomDicts, K extends keyof CustomDicts>({ axios, type: t, params }: { axios: () => Promise<T[K]['response']>, type: K, params?: T[K]['params'] }): Promise<T[K]['response']['data']> {
        const { type, data, msg } = await uniqueRequest(axios, `${t}${params || ''}`);
        uniqueRequest.remove(`${t}${params || ''}`);
        if (!type) {
            userModule.alterCustomDict({ key: (`${t}${params || ''}` as any), value: data });
        }
        return data || msg;
    }
    /**
     * @description: 获取字典数据
     * @param {String} type?: 字典类型
     * @param {Object} params?: 请求字典的参数
     */
    @Action
    async getCustomDicts<T extends CustomDicts, K extends keyof CustomDicts>({ type, params }: { type: K, params?: T[K]['params'] }): Promise<T[K]['response']['data'] | string | never> {
        let result;
        switch (type) {
            case 'dict':
                // 字典数据
                result = userModule.customDicts[type] || await this.getDicts(params as GlobalCustomDicts.CustomDicts['dict']['params']);
                break;
            case 'menus':
                // 获取权限菜单
                result = JSON.parse(JSON.stringify(userModule.menus));
                break;
            case 'role':
                // 获取角色
                result = userModule.customDicts[`${type}${params}` as K]
                    || await this.requestCustomDicts({ axios: () => getRuleSelect(), type });
                break;
            case 'work_type':
                // 获取工单类型
                result = userModule.customDicts[`${type}${params}` as K]
                    || await this.requestCustomDicts({ axios: () => getWorkServiceFault(), type });
                disposeCascader(result as API.Response['BasicDataTree']);
                break;
            case 'unit':
                // 区域
                result = userModule.customDicts[`${type}${params}` as K]
                    || await this.requestCustomDicts({ axios: () => getCityAreaTree(), params: `${(params)}` });
                disposeCascader(result as API.Response['BasicDataTree']);
                break;
            default:
                throw new Error(`未定义的类型，type：${type}，params：${params}`);
        }
        return JSON.parse(JSON.stringify(result));
    }
}

export const DictModule = getModule(Dict);