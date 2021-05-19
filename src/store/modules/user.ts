/// <reference path="../../interface/api/index.ts" />

import { Module, VuexModule, Mutation } from 'vuex-module-decorators';
// import { title } from '@/config/environment';

export interface IUserState {
    user: ResponseLogin.LoginInfo;
    menus: ResponseLogin.Auth[];
    dicts: Dictionary<ResponseSimple.Dict[]>;
    customDicts: ICustomDicts<GlobalCustomDicts.CustomDicts, keyof GlobalCustomDicts.CustomDicts>;
    unique: string; // 用户每次登录后生成的唯一值，防止字典数据缓存
    token: string; // 图片上传 token
}

export type ICustomDicts<T extends GlobalCustomDicts.CustomDicts, K extends keyof GlobalCustomDicts.CustomDicts> = {
    [J in K]: T[J]['response']['data'];
}

// 服务器未返回 lng、lat 时的回填字段
const backfillPoint = { lng: '112.958549', lat: '28.201406' };
// 服务器未返回 zoom 时的回填字段
const backfillZoom = 15;

function defaultUser(): ResponseLogin.LoginInfo {
    return {
        info: {
            admin_area: "",
            id: 0,
            org_id: 0,
            org_name: "",
            role: "",
        },
        token: '',
        auth: [],
    };
}
function getMenu(data: ResponseLogin.Auth[]): ResponseLogin.Auth[] {
    return data.filter(v => {
        if (v.hasOwnProperty('ismenu') && !v.ismenu) return false;
        if (v.children) {
            v.children = getMenu(v.children);
            if (!v.children.length) {
                delete v.children;
            }
        }
        return true;
    });
}

@Module({ name: 'user', namespaced: true })
class User extends VuexModule implements IUserState {
    public user = defaultUser();
    public dicts: Dictionary<ResponseSimple.Dict[]> = {};
    public customDicts = ({} as ICustomDicts<GlobalCustomDicts.CustomDicts, keyof GlobalCustomDicts.CustomDicts>);
    public unique = ''; // 用户每次登录后生成的唯一值, 防止字典数据缓存
    public token = ''; // 图片上传 token

    get menus() {
        return getMenu(JSON.parse(JSON.stringify(this.user.auth)));
    }
    // 返回地图中心点
    get center(): API.Location | string {
        const { user: { lnglat, mapcenter }} = this;
        const { lng, lat } = lnglat || ({ lng: '', lat: '' });
        return lng && lat
            ? { lng, lat }
            : mapcenter
                ? mapcenter
                : { ...backfillPoint };
    }
    // 返回地图 zoom
    get zoom(): number {
        const { user: { zoom }} = this;
        return zoom && zoom >= 3 ? zoom : backfillZoom;
    }
    // 返回当前用户机构信息
    get userOrg() {
        const { user: { info: { org_id: id, role: name }}} = this;
        return { id, name };
    }
    // 返回网格信息
    get maprange() {
        const { user: { info: { maprange }}} = this;
        return maprange || [];
    }

    /**
     * @description: 修改用户信息, 未传则恢复为默认值
     * @param {Object} data?: 用户信息
     */
    @Mutation
    resetUser(data?: ResponseLogin.LoginInfo) {
        const user = data || defaultUser();
        this.user = user;
        this.unique = Date.now().toString() + ~~(Math.random() * 1000);
    }
    @Mutation
    /**
     * @description: 修改 user 单条属性
     */
    alterState<K extends keyof ResponseLogin.LoginInfo>({ key, value }: IAlterState<ResponseLogin.LoginInfo, K>) {
        this.user[key] = value;
    }
    @Mutation
    /**
     * @description: 修改 user.info 单条属性
     */
    alterUser<K extends keyof ResponseLogin.Info>({ key, value }: IAlterState<ResponseLogin.Info, K>) {
        this.user.info[key] = value;
    }
    @Mutation
    /**
     * @description: 修改字典属性
     */
    alterDict(data?: { key: string | number, value: ResponseSimple.Dict[] }) {
        if (data) {
            const { key, value } = data;
            this.dicts[key] = value;
        }
        else {
            this.dicts = {};
        }
    }
    @Mutation
    /**
     * @description: 修改自定义字典属性
     */
    alterCustomDict<K extends keyof IUserState['customDicts']>(data?: IAlterState<IUserState['customDicts'], K>) {
        if (data) {
            const { key, value } = data;
            this.customDicts[key] = value;
        }
        else {
            this.customDicts = {} as any;
        }
    }
    /**
     * @description: 更新上传图片 token
     * @param {Number} token: 上传图片的 token
     */
    @Mutation
    updateToken(token: string) {
        this.token = token;
    }
}

export default User;