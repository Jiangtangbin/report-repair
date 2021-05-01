import { Module, VuexModule, Mutation } from 'vuex-module-decorators';
import { isString, isArray } from '@/utils/index';

interface Sizer {
    title: string;
    value: string;
}

export enum deviceType {
    Mobile,
    Desktop,
}

// scss 颜色变量
const variable = require('@/assets/scss/variable.scss');

// 路由缓存的配置，value 是路由 name，为 keep-alive include 使用，path 做判断使用，fullPath 做跳转用
type CacheRouteOption = { title: string; value: string; path: string; fullPath: string; };

export interface IRoot {
    from: string;
    // 外部网址跳转过来后保存的信息
    fromInfo: {
        url: string;
        token: string;
        secret: string;
    },
    // 登录后的信息
    isLogin: boolean;
    sidebarToggle: boolean;
    device: deviceType;
    screenWidth: number;
    sizer: Sizer[];
    checkedSize: string;
    variable: { [index: string]: string; };
    // 需要缓存的路由
    cacheRoute: CacheRouteOption[];
    lang: Language | '';
    languageAlias: Record<string, Language>;
    languages: { title: string; value: Language }[];
    menuIndex: number;
}

const initWidth = (document.body || document.documentElement).clientWidth;

@Module({ name: 'app', namespaced: true })
class App extends VuexModule implements IRoot {
    // state 状态
    public from = '';
    public fromInfo = { url: '', token: '', secret: '' };
    public isLogin = false;
    public menuIndex = 0;
    public sidebarToggle = true;
    public device = initWidth > 1000 ? deviceType.Desktop : deviceType.Mobile;
    public screenWidth = document.documentElement.clientWidth || document.body.clientWidth;
    public variable = variable;
    public sizer = [
        {
            title: 'h.common.large',
            value: 'large',
        },
        {
            title: 'h.common.normal',
            value: 'normal',
        },
        {
            title: 'h.common.small',
            value: 'small',
        },
    ];
    public checkedSize = 'normal';
    public cacheRoute = [] as CacheRouteOption[];
    public lang: Language | '' = '';
    public languageAlias = { en: 'en-US' } as const;
    public languages: { title: string; value: Language }[] = [
        { title: '中文', value: 'zh-CN' },
        { title: 'English', value: 'en-US' },
    ];

    get isMobile() {
        return this.device === deviceType.Mobile;
    }

    /**
     * @description: 修改 state 属性
     * @param {Object} IRoot: 参考 IRoot 声明
     */
    @Mutation
    alterState<K extends keyof IRoot>({ key, value }: IAlterState<IRoot, K>) {
        if (this.hasOwnProperty(key)) {
            (this[key] as IRoot[K]) = value;
        }
    }
    /**
     * @description: 设置缓存的组件
     * @param {String|Array|Object}
     */
    @Mutation
    updateCacheRoute(data: string | CacheRouteOption | CacheRouteOption[]): void {
        const { cacheRoute } = this;
        if (isString(data)) {
            const i = cacheRoute.findIndex(v => v.path === data);
            i !== -1 && cacheRoute.splice(i, 1);
        }
        else if (isArray(data)) {
            this.cacheRoute = data;
        }
        else {
            const index = cacheRoute.findIndex(({ path }) => path === data.path);
            index === -1
                ? cacheRoute.push(data)
                : cacheRoute.splice(index, 1, data);
        }
    }
}

export default App;